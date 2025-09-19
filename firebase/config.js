// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace this with your own Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfphJ-3ANVn0ACzln4ZSOs6L1Z7vfxmE0",
  authDomain: "releaf-test-a31e7.firebaseapp.com",
  projectId: "releaf-test-a31e7",
  storageBucket: "releaf-test-a31e7.firebasestorage.app",
  messagingSenderId: "14461351427",
  appId: "1:14461351427:web:b8284e6c931b2a6af88036",
  measurementId: "G-6M5F0F7NR9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { app, auth, db };