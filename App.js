import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { firebase } from './config'

import FlashMessage from "react-native-flash-message";

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import Navigation from './Navigation';
import DestinationScreen from './components/DestinationScreen';
import EditScreen from './components/EditScreen';
import GoogleMapView from './components/GoogleMapView';
import ChooseLocation from './components/ChooseLocation';

const Stack = createStackNavigator();

function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null); // Change the initial value to null

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (initializing) return null;

  if (!user) {
    return (
      <Stack.Navigator>
        <Stack.Screen name='LoginScreen' component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name='RegisterScreen' component={RegisterScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen name='MainNavigation' component={Navigation} options={{ headerShown: false }} />
      <Stack.Screen name='DestinationScreen' component={DestinationScreen} options={{headerShown:false}}/>
      <Stack.Screen name='EditScreen' component={EditScreen}/>
      <Stack.Screen name='ChooseLocation' component={ChooseLocation} />
      
    </Stack.Navigator>
  );
  
}

export default () => {
  return (
    <NavigationContainer>
      <App 
      />
      <FlashMessage position= "top" />
    </NavigationContainer>
  );
}