import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration (same as patient app)
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

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;

