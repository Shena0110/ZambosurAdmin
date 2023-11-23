import { View, Text, TouchableOpacity, TextInput, Platform, StatusBar, Image, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { firebase, auth } from '../config';

import { Zam } from '../assets';


const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  loginUser = async (email, password) => {
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
  
      const userDoc = await firebase.firestore().collection('adminUsers').doc(userCredential.user.uid).get();
      const userData = userDoc.data();
  
      if (userData) {
        // Navigate to 'MainNavigation' unconditionally
        navigation.navigate('MainNavigation');
      }
    } catch (error) {
      if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found') {
        Alert.alert('Invalid Email', 'The email address is not valid or does not exist.');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Invalid Password', 'The password is incorrect.');
      } else {
        Alert.alert('Login Error', 'Invalid Email or Password.');
      }
    }
  } 

  

  return (
    <View style={{
      flex: 1,
      alignItems: "center",
      backgroundColor:"#D2E9E9",
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    }}>
      <Image
        source={Zam}
        style={{ width: 200, height: 200, borderRadius: 8, objectFit: "cover" }}
      />

      <Text style={{ fontWeight: 'bold', fontSize: 24 }}>
        Login to Your Account
      </Text>
      <View style={{ marginTop: 40 }}>
        <TextInput
          style={{
            borderWidth: 1,
            padding: 2,
            marginBottom: 12,
            borderRadius: 20,
            textAlign: 'center',
            height: 50,
            width: 340,
          }}
          placeholder='Email'
          onChangeText={(email) => setEmail(email)}
          autoCapitalize='none'
          autoCorrect={false}
        />
        <TextInput
          style={{
            borderWidth: 1,
            padding: 2,
            marginBottom: 12,
            borderRadius: 20,
            textAlign: 'center',
            height: 50,
            width: 340,
          }}
          placeholder='Password'
          onChangeText={(password) => setPassword(password)}
          autoCapitalize='none'
          autoCorrect={false}
          secureTextEntry={true}
        />

      </View>
      <TouchableOpacity
        onPress={() => loginUser(email, password)}
        style={{
          marginTop: 10,
          height: 50,
          width: 250,
          alignItems: 'center',
          justifyContent: "center",
          borderRadius: 50,
          backgroundColor: "green"
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 22 }}>
          Login
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("RegisterScreen")}
        style={{ marginTop: 20 }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          Don't have an account? Register Now
        </Text>
      </TouchableOpacity>
    </View>
   
  )
}

export default LoginScreen;
