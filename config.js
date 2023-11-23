import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyDNfmMXNGtEnKLMoHEPSuJWDCajKkc2pgE",
  authDomain: "adminapp-5fda7.firebaseapp.com",
  projectId: "adminapp-5fda7",
  storageBucket: "adminapp-5fda7.appspot.com",
  messagingSenderId: "960700266566",
  appId: "1:960700266566:web:1f32ccb9453663925a7247",
  measurementId: "G-5XHH37J9P0"
};
const AuthConfig = {
  apiKey: "AIzaSyDIZ8yweg2hWIsVnvp4NryB0MgPaQ_9UEM",
  authDomain: "userside-32ed4.firebaseapp.com",
  projectId: "userside-32ed4",
  storageBucket: "userside-32ed4.appspot.com",
  messagingSenderId: "253924604992",
  appId: "1:253924604992:web:7691842fb9812adf82b3a5",
  measurementId: "G-7QB9R6XCFB"
};

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    firebase.initializeApp(AuthConfig, 'UserSide');
  }

  const auth = firebase.auth();
  const firestore = firebase.firestore();
  const storage = firebase.storage();
  
  export const db = firebase.firestore();
  export const userDb = firebase.app('UserSide').firestore(); 
  export const userRef = userDb.collection('users');
  export { firebase, auth, firestore, storage };

  