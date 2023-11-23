import { useState, useEffect } from 'react';
import { firebase } from '../config';

export const categoriesData = [
  {name: "All", image: require("../assets/All.png")},
  {name: "Beach", image: require("../assets/Beach.png")},
  {name: "Waterfall", image: require("../assets/Waterfall.png")},
  {name: "Resorts", image: require("../assets/Resort.png")},
  {name: "Hotel", image: require("../assets/Hotel.png")}
];

export async function fetchDestinationsData(setTouristSpots) {
  const touristRef = firebase.firestore().collection('touristSpots');
  let unsubscribe;

  try {
    const querySnapshot = await touristRef.get();

    const users = [];
    querySnapshot.forEach((doc) => {
      const {
        category,
        destinationLocation,
        direction,
        fare,
        imageUrl,
        information,
        touristSpotName,
        transportationMode,
        latitude,
        longitude
      } = doc.data();
      users.push({
        id: doc.id,
        category,
        destinationLocation,
        direction,
        fare,
        imageUrl,
        information,
        touristSpotName,
        transportationMode,
        latitude,
        longitude
      });
    });

    
    unsubscribe = touristRef.onSnapshot((querySnapshot) => {
      const updatedTouristSpots = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Updated Tourist Spots:', updatedTouristSpots);
      setTouristSpots(updatedTouristSpots);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}


