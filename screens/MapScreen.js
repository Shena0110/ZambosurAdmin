import {Text, View, Platform, StatusBar } from 'react-native';
import React from 'react';

import GoogleMapView from "../components/GoogleMapView";

export default function MapScreen() {
  return (
    <View 
    style={{
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      marginLeft:2,
      marginRight:2,
      flex:1
    }}
    >
      <View>
        <GoogleMapView/>
      </View>
    </View>
  )
}