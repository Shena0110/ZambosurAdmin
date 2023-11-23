import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { categoriesData, fetchDestinationsData } from './constant';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Dialog } from 'react-native-paper';
import { firebase } from '../config';
import { Beach, Resort, Hotel, Waterfall } from '../assets';

export default function Categories() {
  const navigation = useNavigation();
  const [activeCat, setActiveCat] = useState('All');
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [touristSpots, setTouristSpots] = useState([]);
  const [unsubscribe, setUnsubscribe] = useState(null);

  useEffect(() => {
    const unsubscribe = fetchDestinationsData(setTouristSpots);
  
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);
  
  useEffect(() => {
    if (activeCat === 'All') {
      setFilteredDestinations(touristSpots);
    } else {
      setFilteredDestinations(touristSpots.filter(item => item.category === activeCat));
    }
  }, [activeCat, touristSpots]);

  useEffect(() => {
    console.log('Active Category:', activeCat);
    console.log('Tourist Spots:', touristSpots); // Log the entire tourist spots data
    console.log('Filtered Destinations:', filteredDestinations); // Log the filtered destinations
  }, [activeCat, touristSpots, filteredDestinations]);
  


  return (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: 'row' }}>
          {categoriesData.map((cat, index) => {
            let isActive = cat.name === activeCat;
            let activeButtonStyle = isActive ? { backgroundColor: '#32AFA9', shadowColor: 'black',} : {};
            return (
              <TouchableOpacity
                onPress={() => setActiveCat(cat.name)}
                key={index}
                style={[{ padding: 10, paddingHorizontal: 20, borderRadius: 20, margin: 5, alignItems:"center", justifyContent:"center" }, activeButtonStyle]}
              >
                <Image source={cat.image} style={{ width: 40, height: 40, marginBottom: 5 }} />
                <Text>{cat.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }}>
        <View style={{ minHeight: 3500, marginBottom: 10 }}>
          {filteredDestinations.map((item, index) => {
            return (
              <DestinationCard navigation={navigation} item={item} key={index} />
            );
          })}
          
        </View>
      </ScrollView>
    </View>
  );
}

const DestinationCard = ({ item, navigation }) => {
  const [openDialog, setOpenDialog] = useState(false);

  const hideDialog = () => {
    setOpenDialog(false);
  }

  const showEditDialog = () => {
    setOpenDialog(true);
  }

  const deleteDestination = () => {
    const touristSpotsRef = firebase.firestore().collection('touristSpots');

    const user = firebase.auth().currentUser;

    if (!user) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this tourist spot?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            touristSpotsRef
            .doc(item.id)
            .delete()
            .then(() => {
              Alert.alert("Deleted Successfully")
            })
            .catch(error => {
              alert(error);
            })
          },
        },
      ]
    );
  };
  
  


  return (
   <View style={{flexDirection:"row", padding:10}}>
     <TouchableOpacity
      onPress={() => navigation.navigate('DestinationScreen', { ...item })}
      style={{
        flexDirection: 'row',
        margin: 10,
        padding: 10,
        height: '400', 
        borderWidth: 1, 
        borderRadius: 16,
        width: 350
        
      }}
    >
      <View>
      <Image
        style={{ width: 330, height: 200, marginBottom: 10, borderRadius: 30,  }}
        source={{ uri: item.imageUrl }}
      />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.touristSpotName}</Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Icon name='map-marker-alt' size={20} color={'#32AFA9'} />
          <Text style={{ fontSize:12 }}> {item.destinationLocation} </Text>
        </View>
      </View>
      </View>
      <Dialog 
        visible={openDialog}
        onDismiss={hideDialog}
        style={{
          width: 200,
          height: 100,
          top: 0,
          right: 0,
          position:'absolute', 
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Dialog.Content>
          <View 
            style={{
              backgroundColor: 'white',
            }}
          >
            <TouchableOpacity style={{borderWidth:1, width:200, height:60, alignItems: 'center', justifyContent: 'center'}} onPress={() => navigation.navigate('EditScreen', {...item})} >
              <Text style={{fontWeight: 'bold', fontSize: 14}}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{borderWidth:1, width:200, height:60, alignItems: 'center', justifyContent: 'center'}} onPress={() => {deleteDestination();}}>
              <Text style={{fontWeight: 'bold', fontSize: 14}}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Dialog.Content>
      </Dialog>
    </TouchableOpacity>
     {/* The ellipsis menu should be part of the DestinationCard */}
      {/* The Dialog should also be part of the DestinationCard */}
      <TouchableOpacity onPress={showEditDialog}>
        <Icon name='ellipsis-h' size={20} color={'#32AFA9'} />
      </TouchableOpacity>
   </View>
  );
};
