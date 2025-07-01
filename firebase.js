import {initializeApp} from 'firebase/app';
import {initializeAuth, getReactNativePersistence} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBAgR6FRoDWkVrdP3eOebVryYoaiNVMZUc",
  authDomain: "testko-77f00.firebaseapp.com",
  projectId: "testko-77f00",
  storageBucket: "testko-77f00.appspot.com",
  messagingSenderId: "435348983669",
  appId: "1:435348983669:web:1e2b3acebd83aacb330d3c",
  measurementId: "G-99S5557WCX"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export {auth};
