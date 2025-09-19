import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAfphJ-3ANVn0ACzln4ZSOs6L1Z7vfxmE0",
  authDomain: "releaf-test-a31e7.firebaseapp.com",
  projectId: "releaf-test-a31e7",
  storageBucket: "releaf-test-a31e7.firebasestorage.app",
  messagingSenderId: "14461351427",
  appId: "1:14461351427:web:b8284e6c931b2a6af88036",
  measurementId: "G-6M5F0F7NR9"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Critical: force long‑polling in RN and disable fetch streams
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

export { app, auth, db };