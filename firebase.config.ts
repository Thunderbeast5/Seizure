// firebase.config.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdGx6v716ekZRbTUP9KU7wdmFs1FcUERc",
  authDomain: "seizure-tracker-166f0.firebaseapp.com",
  projectId: "seizure-tracker-166f0",
  storageBucket: "seizure-tracker-166f0.firebasestorage.app",
  messagingSenderId: "596929603017",
  appId: "1:596929603017:web:881986f40201a8043fb418"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth with AsyncStorage persistence for React Native
let auth;
try {
  // Try to get existing auth instance first
  auth = getAuth(app);
} catch (error) {
  // If no auth instance exists, initialize with persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore
const db = getFirestore(app);

// Note: If you're using Firestore emulator in development, uncomment the following:
// if (__DEV__ && !db._delegate._terminated) {
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//   } catch (error) {
//     console.log('Firestore emulator already connected');
//   }
// }

export { auth, db };
export default app;