import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import PickUpAddress from './PickUpAddress';

import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import { showError } from './HelperFunction';

import { Destination, Start } from '../assets';

const ChooseLocation = () => {
  const [state, setState] = useState({
    mapRegion: {
      latitude: 12.8797,
    longitude: 121.7740,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
    },
    destinationCoords: {},
    showDirections: false,
    heading: 0, // Define or get the initial heading value.
  });


  const [time, setTime] = useState('0 sec');
  const [distance, setDistance] = useState('0.0 km');


  const onDone = () => {
    const isValid = checkValid();
    console.log("is valid?...", isValid);
  
    if (state.destinationCoords) {
      setState({ ...state, showDirections: true });
      mapRef.current.fitToCoordinates([mapRegion, state.destinationCoords], {
        edgePadding: {
          right: 30,
          bottom: 200,
          left: 30,
          top: 100,
        },
      });
      fetchDirections();
    }
    
  };

  const { destinationCoords, showDirections, mapRegion, coordinate, heading,} = state;
  const updateState = (data) => setState((state) => ({ ...state, ...data }));


  const checkValid = () => {
    if (Object.keys(destinationCoords).length === 0) {
      showError('Please enter your destination location');
      return false;
    }
    return true;
  };

  const fetchDestinationCoords = (lat, lng, id, zipCode, cityText) => {
    console.log('zip code===>>>', zipCode)
    console.log('city name===>>', cityText)
    const updatedState = { ...state };
    updatedState[id] = {
      latitude: lat,
      longitude: lng,
    };
    setState(updatedState);
  };


  const GOOGLE_MAP_KEY = "AIzaSyDlGJxTWNr3PFEsyBt0y2Y29SVuy4PBCJo";

  const mapRef = useRef();
  const markerRef = useRef()


  useEffect(() => {
    userLocation()
}, [])

const userLocation = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    showError('Permission to access location was denied');
  }
  let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
  const userLocation = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
  setState({ ...state, mapRegion: userLocation });
};

const fetchDirections = () => {
  if (Object.keys(destinationCoords).length === 0) {
    showError('Please enter your destination location');
    return;
  }
  const origin = `${mapRegion.latitude},${mapRegion.longitude}`;
  const destination = `${destinationCoords.latitude},${destinationCoords.longitude}`;
  const apiKey = GOOGLE_MAP_KEY;

  fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const timeInSeconds = route.legs[0].duration.value;
        const distanceInMeters = route.legs[0].distance.value;

        const timeText = formatTimeFromSeconds(route.legs[0].duration.value);
        const distanceText = formatDistance(route.legs[0].distance.value);

        setTime(timeText);
        setDistance(distanceText);


        updateState({ time: timeText, distance: distanceText });

      } else {
        showError('Unable to fetch directions.');
      }
    })
    .catch((error) => {
      showError('Error fetching directions.');
      console.error(error);
    });
};

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

function formatDistance(meters) {
  const kilometers = meters / 1000;
  return kilometers.toFixed(1) + ' km';
}


  const data = [
    { id: '2', placeholderText: "Enter Destination Location", fetchAddress: fetchDestinationCoords }
  ];

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

const onCenter = () => {
    mapRef.current.animateToRegion({
        latitude: curLoc.latitude,
        longitude: curLoc.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    })
}

const fetchTime = (d, t) => {
    updateState({
        distance: d,
        time: t
    })
}


  return (
    <View style={styles.container}>
       {time !== '0 sec' && distance !== '0.0 km' && (
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
        <Text style={{fontSize:14, fontWeight: 'bold'}}>Time: {time}</Text>
         <Text style={{fontSize:14, fontWeight: 'bold'}}>Distance: {distance}</Text>
        </View>
      )}


      <View style={styles.mapContainer}>
        <MapView
          style={{ flex: 1, height: 400 }}
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          region={mapRegion}
        >
          <Marker.Animated ref= {markerRef} coordinate={mapRegion} >
          <Image style={styles.icon}
          source={Start} />
          </Marker.Animated>
          
          {Object.keys(destinationCoords).length > 0 &&
          <Marker.Animated ref= {markerRef} coordinate={destinationCoords}>
          <Image style={styles.icon}
          source={Destination} />
        </Marker.Animated> }
          

          {showDirections && (
            <MapViewDirections
              origin={mapRegion}
              destination={destinationCoords}
              apikey={GOOGLE_MAP_KEY}
              strokeWidth={4}
              strokeColor="red"
              optimizeWaypoints={true}
              onReady={(result) => {
                console.log(`Distance: ${result.distance} km`)
                console.log(`Duration: ${result.duration} min.`)
                fetchTime(result.distance, result.duration),
                mapRef.current.fitToCoordinates(result.coordinates, {
                  edgePadding: {
                    right: 30,
                    bottom: 200,
                    left: 30,
                    top: 100,
                  },
                });
              }}
            />
          )}
        </MapView>
      </View>

      <View style={styles.flatListContainer}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <PickUpAddress
                fetchAddress={(lat, lng) => {
                  if (item.id === '2') {
                    fetchDestinationCoords(lat, lng, 'destinationCoords');
                  }
                }}
                placeholderText={item.placeholderText}
              />
            </View>
          )}
          keyboardShouldPersistTaps="handled"
        />
      </View>
      <TouchableOpacity style={styles.done} onPress={onDone}>
        <Text style={styles.donetxt}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  itemContainer: {
    marginBottom: 10,
  },
  done: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    height:48,
    backgroundColor: '#32AFA9',
    elevation: 3,
     shadowColor: 'black', // for iOS shadow
     shadowOffset: { width: 0, height: 2 }, // for iOS shadow
     shadowOpacity: 1, // for iOS shadow
     shadowRadius: 2,
  },
  donetxt: {
    fontSize: 16
  },
  mapContainer: {
    flex: 1,
    height: 400
  },
  flatListContainer: {
    paddingTop: 10, // Add padding to create space between map and FlatList
  },
  icon: {
    width: 40,
    height: 40, 
  }
});

export default ChooseLocation;
