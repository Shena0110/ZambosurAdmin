import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert, FlatList } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Dialog } from 'react-native-paper';
import MapView, { PROVIDER_GOOGLE, Marker, AnimatedRegion } from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import { Destination, Start, Confetti } from '../assets';
import { firestore } from '../config';

export default function DestinationScreen(props) {
  const item = props.route.params;
  
  const [time, setTime] = useState('0 sec');
  const [distance, setDistance] = useState('0.0 km');


  const navigation = useNavigation();
  const [isFavourite, toggleFavorite] = useState();
  const [openDialog, setOpenDialog] = useState(false);
  const [openRate, setOpenRate] = useState(false);

  const hideDialog = () => {
    setOpenDialog(!openDialog);
  };
  const hideRateDialog = () => {
    setOpenRate(!openRate);
  };

  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    fetchRatingsAndComments();
  }, []);

  const fetchRatingsAndComments = async () => {
    try {
      if (item && item.id) {

        const ref = firestore.collection('touristSpots').doc(item.id);
        const doc = await ref.get();

        if (doc.exists) {
          const data = doc.data();
          const users = data.users || {};

          // Extract ratings, comments, and user emails
          const fetchedRatings = Object.keys(users).map((userId) => ({
            userId,
            name: users[userId].name,
            rating: users[userId].rating,
            comment: users[userId].comment,
          }));

          setRatings(fetchedRatings);
        } else {
          console.log('No such document!');
        }
      }
    } catch (error) {
      console.error('Error fetching ratings and comments:', error);
    }
  };

  const renderStarRating = (rating) => {
    const filledStars = Math.floor(rating); // Get the number of filled stars
    const remainingStars = 5 - filledStars; // Get the number of remaining stars

    // Create an array of filled star icons
    const filledStarIcons = Array.from({ length: filledStars }, (_, index) => (
      <Image key={`filled-${index}`} source={require('../assets/star_filled.png')} style={{ width: 24, height: 24 }} />
    ));
  
    // Create an array of remaining star images
    const remainingStarIcons = Array.from({ length: remainingStars }, (_, index) => (
      <Image key={`empty-${index}`} source={require('../assets/star_corner.png')} style={{ width: 24, height: 24 }} />
    ));

    const allStars = [...filledStarIcons, ...remainingStarIcons];

    return allStars;
  };

  const [mapRegion, setMapRegion] = useState({
    latitude: 12.8797,
    longitude: 121.7740,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421
  });

  const [coordinate] = useState(new AnimatedRegion({
    latitude: 12.8797,
    longitude: 121.7740,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421
  }));
  

  const droplocationCoords = {
    latitude: parseFloat(item.latitude), // Convert latitude to a float
    longitude: parseFloat(item.longitude), // Convert longitude to a float
  };

  const GOOGLE_MAP_KEY = "AIzaSyDlGJxTWNr3PFEsyBt0y2Y29SVuy4PBCJo";

  
  const mapRef = useRef();
  const markerRef = useRef();
  
  const userLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
    }
    let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
    animate(location.coords.latitude, location.coords.longitude);
    setMapRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    });
    // Update the Animated Region
    coordinate.timing(new AnimatedRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    })).start();
    return location.coords;
  };

  useEffect(() => {
    userLocation();
  }, []);

  const onChoose = () => {
    //navigation.setParams({ selectedCoordinates });
    navigation.navigate('ChooseLocation');
  }

  const onRate = () => {
    navigation.navigate('RatingScreen', {item});
  }

  const fetchTimeAndDistance = async () => {
    if (Object.keys(droplocationCoords).length === 0) {
      Alert.alert('Error', 'Please enter your destination location');
      return;
    }
  
    try {
      const userCoordinates = await userLocation();
  
      const origin = `${userCoordinates.latitude},${userCoordinates.longitude}`;
      const destination = `${item.latitude},${item.longitude}`;
      const apiKey = GOOGLE_MAP_KEY;
  
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`
      );
      const data = await response.json();
  
      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const timeInSeconds = route.legs[0].duration.value;
        const distanceInMeters = route.legs[0].distance.value;
  
        const timeText = formatTimeFromSeconds(route.legs[0].duration.value);
        const distanceText = formatDistance(route.legs[0].distance.value);
        const distance = data.routes[0].legs[0].distance.value;

  
        setTime(timeText);
        setDistance(distanceText);
        return distance;
      } else {
        Alert.alert('Error', 'No routes found. Unable to fetch directions.');
      }
    } catch (error) {
      Alert.alert('Error', `Error fetching directions: ${error.message}`);
      console.error(error);
    }
  };
  
  
  // Function to format time from seconds
  function formatTimeFromSeconds(seconds) {
    const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let formattedTime = '';
  if (hours > 0) {
    formattedTime += hours + 'hr';
    if (minutes > 0 || remainingSeconds > 0) {
      formattedTime += ' ';
    }
  }

  if (minutes > 0) {
    formattedTime += minutes + 'min';
    if (remainingSeconds > 0) {
      formattedTime += ' ';
    }
  }

  if (remainingSeconds > 0) {
    formattedTime += remainingSeconds + 'sec';
  }

  return formattedTime.trim();
  }
  
  // Function to format distance
  function formatDistance(meters) {
    const kilometers = meters / 1000;
    return kilometers.toFixed(1) + ' km';
  }

const animate = (latitude, longitude) => {
  const newCoordinate = { latitude, longitude };
  if (Platform.OS == 'android') {
      if (markerRef.current) {
          markerRef.current.animateMarkerToCoordinate(newCoordinate, 7000);
      }
  } else {
      coordinate.timing(newCoordinate).start();
  }
}

const [destinationReached, setDestinationReached] = useState(false);

const checkDestinationReached = async (userLocation, droplocationCoords) => {
  const distanceThreshold = 0.1; 
  const distance = await fetchTimeAndDistance(userLocation, droplocationCoords); 

  console.log('Distance to destination:', distance);

  if (distance <= distanceThreshold && !destinationReached) {
    setDestinationReached(true);
    setOpenRate(true);
  }
};

useEffect(() => {
  const interval = setInterval(async () => {
    const userLocationCoords = await userLocation();
    checkDestinationReached(userLocationCoords, droplocationCoords);
  }, 5000); // Check every 5 seconds, adjust this interval as needed

  return () => clearInterval(interval);
}, []);

console.log("Item being passed:", item);
console.log('Email:', item.name);


  return (
    <View style={{ flex: 1, backgroundColor: '#E3F4F4' }}>
      <Image source={{ uri: item.imageUrl }} style={{ width: wp(100), height: hp(55) }} />
      <SafeAreaView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', width: '100%' }}>
      
        <TouchableOpacity
          style={{ padding: 12, borderRadius: 10, marginLeft: 16, backgroundColor: "#32AFA9", marginTop: 30, alignItems:"center", justifyContent:"center"}}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={24} color="black"  />
        </TouchableOpacity>
      </SafeAreaView>
      <View style={{
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#E3F4F4',
        padding: 5,
        marginTop: -40,
      }}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 10, padding: 10, }}>
          <View style={{ minHeight: 1500 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 28 }}>{item?.touristSpotName}</Text>
            <View style={{ flexDirection: 'row' }}>
              <Icon name='map-marker-alt' size={24} color={'#32AFA9'} />
              <Text style={{ flexWrap: 'wrap', fontSize: 16 }}> {item?.destinationLocation} </Text>
            </View>
            <Text style={{ flexWrap: 'wrap', fontSize: 16, marginTop: 10 }}> {item?.information} </Text>
            <Text style={{ fontWeight: "bold", marginTop: 10, fontSize: 18 }}>Estimated Travel Duration:</Text>
            <Text style={{ flexWrap: 'wrap', fontSize: 16, marginTop: 10 }}> {item?.direction} </Text>
            <Text style={{ fontWeight: "bold", marginTop: 10, fontSize: 18 }}>Estimated Fare:</Text>
            <Text style={{ flexWrap: 'wrap', fontSize: 16, marginTop: 10 }}> {item?.fare} </Text>
            <View style={{ flexDirection: 'row', marginTop: 10, }}>
              <Icon name='taxi' size={24} color={'#32AFA9'} />
              <Text style={{ flexWrap: 'wrap', fontSize: 14, fontWeight: 'bold', fontSize: 16 }}> {item?.transportationMode} </Text>
            </View>
            <View>
        <View>
  <Text style={{ fontSize: 26, fontWeight: 'bold', marginTop: 20 }}>
    Users Review
  </Text>
  {ratings.map((ratingItem, index) => (
  <View key={index} style={{ marginTop: 10, padding: 4}}>
    <Text style={{fontSize: 18, marginTop: 5 }}>{ratingItem.name}</Text>
    {/* Render star rating based on the rating value */}
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
      {renderStarRating(ratingItem.rating)}
    </View>
    <Text style={{ marginLeft: 40, marginTop: 10, fontSize: 16 }}> {ratingItem.comment}</Text>
  </View>
))}
</View>
      </View>
            <TouchableOpacity
              style={{
                backgroundColor: '#32AFA9',
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 20,
                height: 40
              }}
              onPress={() => {
                fetchTimeAndDistance();
                hideDialog();
              }}
            >
              <Text style={{ fontSize: 20 }}>View Map</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      <Dialog
        visible={openDialog}
        onDismiss={hideDialog}
        style={{ flex: 1, backgroundColor:"#E3F4F4" }}
      >
        <View style={{ flex: 1 }}>
          {time !== '0 sec' && distance !== '0.0 km' && (
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
         <Text style={{fontSize:14, fontWeight: 'bold'}}>Time: {time}</Text>
         <Text style={{fontSize:14, fontWeight: 'bold'}}>Distance: {distance}
        </Text>
        </View>
      )}
          <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={true}
            region={mapRegion}
          >
            <Marker.Animated coordinate={coordinate} ref={markerRef} >
          <Image style={{width: 40, height: 40}}
          source={Start} />
          </Marker.Animated>

          <Marker coordinate={droplocationCoords} >
          <Image style={{width: 40, height: 40}}
          source={Destination} />
          </Marker>

            {droplocationCoords && (
              <MapViewDirections
                origin={mapRegion}
                destination={droplocationCoords}
                apikey={GOOGLE_MAP_KEY}
                strokeWidth={4}
                strokeColor='red'
                optimizeWaypoints={true}
                onReady={result => {
                  mapRef.current.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                      right: 30,
                      bottom: 200,
                      left: 30,
                      top: 100
                    }
                  });
                }}
              />
            )}
          </MapView>
          </View>
         <View styl={{
          width: '100%',
          padding: 30,
          borderTopEndRadius: 24,
          borderTopStartRadius: 24
         }} >
          <TouchableOpacity
          style={{
            borderRadius: 4,
            alignItems:"center",
            height: 48,
            justifyContent: 'center',
            marginTop: 10
          }}
          onPress={onChoose}
          >
            <Text>Choose your location</Text>
          </TouchableOpacity>
         </View>
        </View>
      </Dialog>
      <Dialog
  visible={openRate}
  onDismiss={hideRateDialog}
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height:400,
    width: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Image source={Confetti} style={{width: 150, height:150}}/>
    <Text style={{fontSize: 20, fontWeight: "bold"}}>Congrats!!</Text>
    <Text style={{fontSize: 20}}> you've reached the destination!!</Text>
    
    <TouchableOpacity 
    style={{width:100,
      height: 40,
      alignItems:'center',
      justifyContent:"center",
      backgroundColor:"#32AFA9",
      borderRadius: 10,
      marginBottom:10
    }}
    onPress={onRate}
    >
      <Text>Rate Now</Text>
    </TouchableOpacity>
  </View>
</Dialog>

    </View>
  );
}
