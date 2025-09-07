import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, isSupported, onMessage, Messaging } from 'firebase/messaging';

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

// Initialize Messaging (web push) if supported
let messaging: Messaging | undefined;
let messagingSupported = false;

(async () => {
  try {
    messagingSupported = await isSupported();
    if (messagingSupported) {
      messaging = getMessaging(app);
    }
  } catch (e) {
    messagingSupported = false;
  }
})();

// Request browser notification permission and get FCM token
export const requestFcmToken = async (vapidKey: string): Promise<string | undefined> => {
  try {
    if (!messaging || !messagingSupported) return undefined;
    const token = await getToken(messaging, { vapidKey });
    return token || undefined;
  } catch (e) {
    console.error('Error getting FCM token:', e);
    return undefined;
  }
};

// Foreground message handler registration
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (messaging && messagingSupported) {
    onMessage(messaging, callback);
  }
};

export { auth, db };
export default app;

