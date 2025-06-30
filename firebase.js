// Import Firebase SDK (web-compatible)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

// Initialize
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
