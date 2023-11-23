import React, {useState, useEffect} from 'react';
import { View, Text, Image, ScrollView, StatusBar, Platform, TouchableOpacity, Alert} from 'react-native';
import { Avatar } from '../assets';
import { Dialog } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import Awesome from 'react-native-vector-icons/FontAwesome5';
import * as ImagePicker from 'expo-image-picker';
import { auth, firestore, storage, firebase, userDb } from '../config';
import * as FileSystem from 'expo-file-system';
import {ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage';


import Recommend from '../components/Recommend';
import Categories from '../components/categories';

const HomeScreen = ({item}) => {
  const [userCount, setUserCount] = useState(0); // State for admin users count
  const [touristSpotCount, setTouristSpotCount] = useState(0); 

  useEffect(() => {
    const userRef = userDb.collection('users');
  
    const unsubscribe = userRef.onSnapshot((querySnapshot) => {
      let count = 0;
  
      querySnapshot.forEach((doc) => {
        count++; // Increment for each user document
      });
  
      setUserCount(count); // Update the state with the count
    });
  
    return () => {
      unsubscribe(); // Cleanup the listener when the component unmounts
    };
  }, []);

  useEffect(() => {
    const touristSpotRef = firestore.collection('touristSpots');
  
    const unsubscribe = touristSpotRef.onSnapshot((querySnapshot) => {
      let count = 0;
  
      querySnapshot.forEach((doc) => {
        count++; // Increment for each tourist spot document
      });
  
      setTouristSpotCount(count); // Update the state with the count
    });
  
    return () => {
      unsubscribe(); // Cleanup the listener when the component unmounts
    };
  }, []);
  

  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);


  const hideDialog = () => {
    setOpenDialog(!openDialog)
  }

  const hideEditDialog = () => {
    setOpenEditDialog(!openEditDialog)
  }

  const [avatar, setAvatar] = useState(null);
  const [insert, setInsert] = useState(null);
  const [upload, setUpload] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [userData, setUserData ] = useState([]);


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
      setInsert(result.assets[0].uri); 
  }
};
  

const uploadMedia = async (uri) => {
  setUpload(true);

  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, `Avatars/${new Date().getTime()}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is ", progress + "% Done");
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((avatarUrl) => {
              console.log("File Available at", avatarUrl);
              resolve(avatarUrl);
            })
            .catch((error) => reject(error));
        }
      );
    });
  } catch (error) {
    throw new Error("Error uploading image: " + error.message);
  }
};

const handleUpload = async () => {
  try {
    if (!avatar) {
      Alert.alert('Error', 'Please select an image before saving.');
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    const userId = user.uid;

    // Ensure the avatar is uploaded and the state is updated
    const avatarUrl = await uploadMedia(avatar);

    // Update Firestore with the avatar URL
    const avatarRef = firestore.collection('adminUsers');
    await avatarRef.doc(userId).update({
      avatarUrl,
    });

    // Reset the avatar state after successful upload
    setAvatar(null);

    Alert.alert('Success', 'Avatar uploaded successfully.');
  } catch (error) {
    console.error('Error uploading avatar: ', error);
    Alert.alert('Error', 'Failed to upload avatar. Please try again.');
  }
};



useEffect(() => {
  const userRef = firestore.collection('adminUsers');

  const unsubscribe = userRef.onSnapshot((querySnapshot) => {
    const userData = [];
    querySnapshot.forEach((doc) => {
      const { email, username, avatarUrl } = doc.data();
      userData.push({
        id: doc.id,
        username,
        email,
        avatarUrl,
      });
    });
    setUserData(userData);
  });

  return () => {
    unsubscribe(); // Cleanup the listener when the component unmounts
  };
}, []);
  

  
  
  


  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#D2E9E9',
        position: 'relative',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10  }}>
        <View style={{flexDirection: "row"}}>
          <Text style={{ fontWeight: 'bold', fontSize: 32, color: "#0B646B" }}>Welcome, </Text>
          {userData
  .filter((user) => user.id === firebase.auth().currentUser.uid)
  .map((item) => ( <Text key={item.id} style={{fontSize:32, fontWeight:"bold"}}>{item.username}</Text>))}
        </View>

        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }} onPress={hideDialog}>
        <Image source={Avatar} style={{ width: '100%', height: '100%', borderRadius: 24, resizeMode: 'cover' }} />
      </TouchableOpacity>
        </View>
      </View>

     <View style={{padding: 16,marginTop: -20}}>
     <Text style={{ fontSize: 32, fontWeight: 'bold', marginLeft: 8 }}>Dashboard</Text>
     <View style={{marginBottom: 1, flexDirection: "row", justifyContent: 'space-between', marginBottom: 8}}>
     <TouchableOpacity style={{backgroundColor: '#32AFA9', 
     borderRadius: 12, 
     justifyContent: 'center', 
     alignItems: 'center', 
     width: 180, height: 120,
     elevation: 3,
     shadowColor: 'black', // for iOS shadow
     shadowOffset: { width: 0, height: 2 }, // for iOS shadow
     shadowOpacity: 1, // for iOS shadow
     shadowRadius: 2,
      }}>
      <Icon name="users" size={24} color="white" style={{ marginRight: 120 }} />
      <Text style={{ fontSize: 48, fontWeight: 'bold', color: "white" }}>{userCount}</Text>
     </TouchableOpacity>
     <TouchableOpacity style={{backgroundColor: '#32AFA9', 
     borderRadius: 12, 
     justifyContent: 'center', 
     alignItems: 'center', 
     width: 180, height: 120, 
     elevation: 3,
     shadowColor: 'black', // for iOS shadow
     shadowOffset: { width: 0, height: 2 }, // for iOS shadow
     shadowOpacity: 1, // for iOS shadow
     shadowRadius: 2,}}>
      <Awesome name='map-marked-alt' size={24} color="white" style={{ marginRight: 120 }} />
      <Text style={{ fontSize: 48, fontWeight: 'bold', color: "white" }}>{touristSpotCount}</Text>
     </TouchableOpacity>
     </View>
     <View style={{marginBottom: 1, flexDirection: "row", justifyContent: 'space-between'}}>
     <TouchableOpacity style={{backgroundColor: '#32AFA9', 
     borderRadius: 12, 
     justifyContent: 'center', 
     alignItems: 'center',  
     width: 240, height: 120, 
     elevation: 3,
     shadowColor: 'black', // for iOS shadow
     shadowOffset: { width: 0, height: 2 }, // for iOS shadow
     shadowOpacity: 1, // for iOS shadow
     shadowRadius: 2,}}>
      
      <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>Top Rated</Text>
     </TouchableOpacity>
     </View>
     </View>

      <View>
      <ScrollView showsHorizontalScrollIndicator={false}>
      <Categories/>
      </ScrollView>
      </View>
      {userData
  .filter((user) => user.id === firebase.auth().currentUser.uid)
  .map((item) => (
  <Dialog
  key={item.id}
  visible={openDialog}
  onDismiss={hideDialog}
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
    backgroundColor:"#FFEFEF"
  }}
          >
            <View style={{ width: 150, height: 150, borderRadius: 100, backgroundColor: 'white', alignItems: 'center', flexDirection: 'row' }}>
              {/* Adjust Avatar and Camera icon */}
              {avatar || item.avatarUrl ? (
                <Image
                  source={{ uri: avatar || item.avatarUrl }}
                style={{ width: '100%', height: '100%', borderRadius: 100, resizeMode: 'cover' }}
              />): null}
            
              <TouchableOpacity
                style={{ marginLeft: -15 }}
                onPress={pickImage}
              >
                <Icon name="camera" size={30} color="#32AFA9" />
              </TouchableOpacity>
            </View>
            {avatar && !imageUploaded ? (
              <TouchableOpacity
                style={{ backgroundColor: 'white', width: 150, height: 30, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}
                onPress={handleUpload}
              >
                <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Save and Upload</Text>
              </TouchableOpacity>
            ) : null}
           <Text style={{fontSize: 28, fontWeight: 'bold'}} > {item.username} </Text>
    <Text style={{fontSize: 16, fontWeight:'300'}} > {item.email} </Text>
    <TouchableOpacity
    style={{
      backgroundColor: '#32AFA9',
      width: 200,
      height: 40,
      borderRadius: 20, 
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20
    }} 
    onPress={() => firebase.auth().signOut()}
    >
      <Text style={{fontWeight:'bold', fontSize: 20}} >Logout</Text>
    </TouchableOpacity>
          </Dialog>
        ))}

    </View>
  );
}

export default HomeScreen;