import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../config'; 

const Recommend = () => {
  const navigation = useNavigation();
  const [touristSpots, setTouristSpots] = useState([]);

  useEffect(() => {
    const unsubscribe = fetchTouristSpots(setTouristSpots);
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchTouristSpots = async (setTouristSpots) => { 
    const db = firebase.firestore();
    const touristRef = db.collection('touristSpots');
  
    try {
      const querySnapshot = await touristRef.get();
  
      const touristSpots = [];
      querySnapshot.forEach(doc => {
        const {
          category,
          destinationLocation,
          direction,
          fare,
          imageUrl,
          information,
          touristSpotName,
          transportationMode,
        } = doc.data();
        touristSpots.push({
          id: doc.id,
          category,
          destinationLocation,
          direction,
          fare,
          imageUrl,
          information,
          touristSpotName,
          transportationMode,
        });
      });
  
      const unsubscribe = touristRef.onSnapshot((querySnapshot) => {
        const updatedTouristSpots = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Updated Tourist Spots:', updatedTouristSpots);
        setTouristSpots(updatedTouristSpots);
      });
  
      return unsubscribe;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };
  
  const renderItem = ({ item }) => {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.navigate('DestinationScreen', { ...item })}
          style={styles.touchable}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      data={touristSpots}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={(item) => renderItem(item, navigation)}
      keyExtractor={(item) => item.id}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 2,
  },
  touchable: {
    borderRadius: 8,
  },
  imageContainer: {
    width: 300,
    height: 200,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10
  },
});

export default Recommend;
