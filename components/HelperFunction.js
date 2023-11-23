import { showMessage, hideMessage } from "react-native-flash-message";
import { PermissionsAndroid,Platform } from "react-native";
import Geolocation from 'react-native-geolocation-service';


export const getCurrentLocation = () => 
new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
        position => {
            const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            resolve(coords);
        },
        error => {
            reject(error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, minimumAge: 10000 },
    )
    .catch(error => {
        reject(error.message); // Handle promise rejection here.
    });
});

export const locationPermission = () => new Promise(async(resolve, reject) => {
    if(Platform.OS === 'ios'){
        try {
            const permissionStatus = await Geolocation.requestAuthorization('whenInUse');
            if(permissionStatus === 'granted'){
                return resolve('granted')
            }
            reject("permission not granted")
        } catch (error) {
            return reject(error)
        }
    }
    return PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ).then((granted) => {
        if(granted === PermissionsAndroid.RESULTS.GRANTED){
            resolve('granted')
        }
        return reject('Location permission denied');
    }).catch((error) => {
        console.log('Ask Location: ', error);
        return reject(error)
    });
});

const showError = (message) => {
    showMessage({
        message,
        type:'danger',
        icon: 'danger'
    })
}

const showSuccess = ( message ) => {
    showMessage({
        message,
        type: 'success',
        icon: 'success'
    })
} 

export {
    showError,
    showSuccess
}