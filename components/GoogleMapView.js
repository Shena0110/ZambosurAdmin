import React, { useEffect, useState, useRef } from 'react';
import { View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';


export default function GoogleMapView() {
  const [mapRegion, setMapRegion] = useState({
    latitude: 12.8797,
    longitude: 121.7740,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421
  });

  const [droplocationCoords] = useState({
    latitude: 7.65498,
    longitude: 123.32478
  });

  const GOOGLE_MAP_KEY = "AIzaSyDlGJxTWNr3PFEsyBt0y2Y29SVuy4PBCJo"

  const mapRef = useRef()
  const userLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
    }
    let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
    setMapRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    });
    return location.coords;
  }

  useEffect(() => {
    userLocation();
  }, []);

  return (
    <View style={{ flex: 1, borderRadius: 20 }}>
      <MapView
        style={{
          width: 400,
          height: 600,
          borderRadius: 20
        }}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        region={mapRegion}
      >
        <Marker coordinate={mapRegion}/>
        <Marker coordinate={droplocationCoords} />
        
        {droplocationCoords && (
          <MapViewDirections
            origin={mapRegion} // Use the current location as the origin
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
              })
            }}
          />
        )}
      </MapView>
    </View>
  );
}
