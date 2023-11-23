import React, {useState} from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, StyleSheet, Alert, Platform, StatusBar, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Awesome from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import {firebase, storage} from '../config';
import * as FileSystem from 'expo-file-system';
import { Picker } from '@react-native-picker/picker';
import {ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage';



const AddScreen = () => {
  const navigation = useNavigation();
  const categoryOptions = ['Beach', 'Waterfall', 'Resorts', 'Hotel'];


  const [touristSpotName, setTouristSpotName] = useState('');
  const [direction, setDirection] = useState('');
  const [information, setInformation] = useState('');
  const [fare, setFare] = useState('');
  const [transportationMode, setTransportationMode] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [insertedImage, setInsertedImage] = useState(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

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
  
  const handleSave = async () => {
    try {
      if (!image) {
        Alert.alert("Error", "Please select an image before saving.");
        return;
      }
  
      if (!selectedCategory) {
        Alert.alert("Error", "Please select a category before saving.");
        return;
      }
  
      setUploading(true);
      const imageUrl = await uploadMedia(image, "image");
  
      const touristSpotsRef = firebase.firestore().collection("touristSpots");
  
      await touristSpotsRef.add({
        touristSpotName,
        direction,
        information,
        fare,
        transportationMode,
        destinationLocation,
        imageUrl,
        category: selectedCategory,
        latitude,
        longitude,
      });
  
      // Clear form fields and image state after successful save
      setTouristSpotName("");
      setDirection("");
      setInformation("");
      setFare("");
      setTransportationMode("");
      setDestinationLocation("");
      setSelectedCategory("");
      setImage(null);
      setLatitude("");
      setLongitude("");
      setUploading(false);
  
      Alert.alert("Success", "Tourist spot added successfully.");
    } catch (error) {
      console.error("Error adding tourist spot: ", error);
      setUploading(false);
      Alert.alert(
        "Error",
        "Failed to add tourist spot. Please try again."
      );
    }
  };
  
  


  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor:"#D2E9E9" }}>
      <View style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, }}>
        <Text style={styles.header}>Add Tourist Spot</Text>
      </View>
      <View style={styles.imageUpload}>
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          {image ? null : <Text>Insert Image</Text>}
          {image && <Image source={{ uri: image }} style={{ width: 140, height: 100, borderRadius: 20 }} />}
        </TouchableOpacity>  
      </View>
      <View>
        <Text style={styles.label}>Tourist Spot Name:</Text>
        <TextInput
        multiline={true}
        returnKeyType="next"
          style={styles.input}
          value={touristSpotName}
          onChangeText={setTouristSpotName}
        />
        <Text style={styles.label}>Information:</Text>
        <TextInput
        returnKeyType="next"
        multiline={true}
          style={styles.input}
          value={information}
          onChangeText={setInformation}
        />
        <Text style={styles.label}>Duration:</Text>
        <TextInput
        returnKeyType="next"
        multiline={true}
          style={styles.input}
          value={direction}
          onChangeText={setDirection}
        />
        <Text style={styles.label}>Estimated transport fare and travel duration:</Text>
        <TextInput
        returnKeyType="next"
        multiline={true}
          style={styles.input}
          value={fare}
          onChangeText={setFare}
        />
        <Text style={styles.label}>Modes of transportation:</Text>
        <TextInput
        returnKeyType="next"
        multiline={true}
          style={styles.input}
          value={transportationMode}
          onChangeText={setTransportationMode}
        />
        <Text style={styles.label}>Destination Location:</Text>
        <TextInput
        returnKeyType="next"
        multiline={true}
          style={styles.input}
          value={destinationLocation}
          onChangeText={setDestinationLocation}
        />
        <Text style={styles.label}>Latitude:</Text>
        <TextInput
        returnKeyType="next"
        multiline={true}
         style={styles.input}
         value={latitude}
         onChangeText={setLatitude}
        />
        <Text style={styles.label}>Longitude:</Text>
        <TextInput
        returnKeyType="next"
        multiline={true}
        style={styles.input}
        value={longitude}
        onChangeText={setLongitude}
        />
      </View>
      <Text style={styles.label}>Select a Category:</Text>
      <Picker
      selectedValue={selectedCategory}
      onValueChange={(itemValue, itemIndex) => setSelectedCategory(itemValue)}
      style={styles.picker}
      >
      <Picker.Item label="Select a category" value="" />
      {categoryOptions.map((category, index) => (
      <Picker.Item key={index} label={category} value={category} />
      ))}
</Picker>


      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

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
    backgroundColor: '#32AFA9',
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
});

export default AddScreen;
