// firebase.config.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdGx6v716ekZRbTUP9KU7wdmFs1FcUERc",
  authDomain: "seizure-tracker-166f0.firebaseapp.com",
  projectId: "seizure-tracker-166f0",
  storageBucket: "seizure-tracker-166f0.firebasestorage.app",
  messagingSenderId: "596929603017",
  appId: "1:596929603017:web:881986f40201a8043fb418"
  // Remove measurementId to avoid analytics issues
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth with AsyncStorage persistence
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;