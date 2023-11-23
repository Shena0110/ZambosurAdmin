import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, Alert, StyleSheet } from 'react-native';
import { useNavigation, } from '@react-navigation/native';
import { firebase, storage } from '../config';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import {ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage';

const EditScreen = (props) => {
  const item = props.route.params;
  const navigation = useNavigation();


  const [touristSpotData, setTouristSpotData] = useState({
    touristSpotName: '',
    direction: '',
    information: '',
    fare: '',
    transportationMode: '',
    destinationLocation: '',
    imageUrl: '',
    category: '',
    latitude: '',
    longitude: '',
  });

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [insertedImage, setInsertedImage] = useState(null);

  useEffect(() => {
    const touristSpotsRef = firebase.firestore().collection('touristSpots');

    touristSpotsRef
      .doc(item.id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          setTouristSpotData(data);
          setImage(data.imageUrl);
        } else {
          Alert.alert('Error', 'Tourist spot not found.');
          navigation.goBack();
        }
      })
      .catch((error) => {
        console.error('Error fetching tourist spot data:', error);
        Alert.alert('Error', 'Failed to fetch tourist spot data. Please try again.');
        navigation.goBack();
      });
  }, [item.id]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setInsertedImage(result.assets[0].uri);
    }
  };

  const uploadMedia = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
  
      const storageRef = ref(storage, `Images/${new Date().getTime()}`);
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
              .then((imageUrl) => {
                console.log("File Available at", imageUrl);
                resolve(imageUrl);
              })
              .catch((error) => reject(error));
          }
        );
      });
    } catch (error) {
      throw new Error("Error uploading image: " + error.message);
    }
  };

  const updateTouristSpot = async () => {
    const touristSpotsRef = firebase.firestore().collection('touristSpots');
    

    try {
        if (!image) {
          Alert.alert("Error", "Please select an image before saving.");
          return;
        }
    
        setUploading(true);
        const imageUrl = await uploadMedia(image, "image");
    
      // Update the tourist spot information in Firestore
      await touristSpotsRef.doc(item.id).update({
        touristSpotName: touristSpotData.touristSpotName,
        direction: touristSpotData.direction,
        information: touristSpotData.information,
        fare: touristSpotData.fare,
        transportationMode: touristSpotData.transportationMode,
        destinationLocation: touristSpotData.destinationLocation,
        imageUrl,
        category: touristSpotData.category,
        latitude: touristSpotData.latitude,
        longitude: touristSpotData.longitude,
      });

      Alert.alert('Success', 'Tourist spot updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating tourist spot:', error);
      setUploading(false);
      Alert.alert('Error', 'Failed to update tourist spot. Please try again.');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View>
        <Text  style={styles.header}>Edit Tourist Spot</Text>
      </View>
      <View style={styles.imageUpload}>
        <TouchableOpacity style={{ borderWidth: 1, width: 140, height: 100, borderRadius: 20 }} onPress={pickImage}>
          {image ? <Image source={{ uri: image }} style={{ width: 140, height: 100, borderRadius: 20 }} /> : <Text>Insert Image</Text>}
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.label}>Tourist Spot Name:</Text>
        <TextInput
        multiline={true}
        style={styles.input}
          value={touristSpotData.touristSpotName}
          onChangeText={(text) => setTouristSpotData({ ...touristSpotData, touristSpotName: text })}
        />
        <Text style={styles.label}>Direction:</Text>
  <TextInput
  multiline={true}
  style={styles.input}
    value={touristSpotData.direction}
    onChangeText={(text) => setTouristSpotData({ ...touristSpotData, direction: text })}
  />
</View>
<View>
  <Text style={styles.label}>Information:</Text>
  <TextInput
  multiline={true}
    style={styles.input}
    value={touristSpotData.information}
    onChangeText={(text) => setTouristSpotData({ ...touristSpotData, information: text })}
  />
</View>
<View>
  <Text style={styles.label}>Fare:</Text>
  <TextInput
  multiline={true}
  style={styles.input}
    value={touristSpotData.fare}
    onChangeText={(text) => setTouristSpotData({ ...touristSpotData, fare: text })}
  />
</View>
<View>
  <Text style={styles.label}>Transportation Mode:</Text>
  <TextInput
  multiline={true}
  style={styles.input}
    value={touristSpotData.transportationMode}
    onChangeText={(text) => setTouristSpotData({ ...touristSpotData, transportationMode: text })}
  />
</View>
<View>
  <Text style={styles.label}>Destination Location:</Text>
  <TextInput
  multiline={true}
    value={touristSpotData.destinationLocation}
    onChangeText={(text) => setTouristSpotData({ ...touristSpotData, destinationLocation: text })}
  />
</View>
<View>
  <Text style={styles.label}>Latitude:</Text>
  <TextInput
  multiline={true}
  style={styles.input}
    value={touristSpotData.latitude}
    onChangeText={(text) => setTouristSpotData({ ...touristSpotData, latitude: text })}
  />
</View>
<View>
  <Text style={styles.label}>Longitude:</Text>
  <TextInput
  multiline={true}
    style={styles.input}
    value={touristSpotData.longitude}
    onChangeText={(text) => setTouristSpotData({ ...touristSpotData, longitude: text })}
  />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={updateTouristSpot}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  imageUpload: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    
  },
  uploadButton: {
    backgroundColor: '#ccc',
    height: 100,
    width: 140,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop:20
  },
  saveButton: {
    backgroundColor: '#00cc00',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    width:100,
    height: 40,
    alignItems:'center'
  },
  cancelButton: {
    backgroundColor: '#ff0000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    width:100,
    height: 40,
    alignItems:'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },

})

export default EditScreen;
