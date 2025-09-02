// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  getIdToken
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase.config';

interface UserData {
  uid: string;
  email: string;
  name: string;
  username: string;
  age: number;
  gender: string;
  bloodGroup: string;
  seizureType: string;
  createdAt: any; // Using any to handle both Date and serverTimestamp
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | undefined>;
}

interface RegisterData {
  name: string;
  email: string;
  username: string;
  age: number;
  gender: string;
  bloodGroup: string;
  seizureType: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.error('Auth is not initialized');
      setLoading(false);
      return;
    }

    // Set persistence to local storage for session persistence
    setPersistence(auth, browserLocalPersistence).then(() => {
      console.log('Auth persistence set to local');
    }).catch((error) => {
      console.error('Error setting auth persistence:', error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.uid);
      setUser(user);
      
      if (user) {
        try {
          console.log('Setting up real-time listener for user data:', user.uid);
          const userDocRef = doc(db, 'profiles', user.uid);
          
          // Set up real-time listener for user data
          const unsubscribeUserData = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              const data = doc.data() as UserData;
              console.log('User data updated:', data);
              setUserData(data);
            } else {
              console.log('No user document found');
              setUserData(null);
            }
            setLoading(false);
          }, (error) => {
            console.error('Error in user data real-time listener:', error);
            setUserData(null);
            setLoading(false);
          });
          
          // Store unsubscribe function for cleanup
          return () => unsubscribeUserData();
        } catch (error) {
          console.error('Error setting up user data listener:', error);
          setUserData(null);
          setLoading(false);
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Authentication not initialized');
    }
    try {
      console.log('Attempting login for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful for:', userCredential.user.uid);
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  const register = async (registerData: RegisterData) => {
    if (!auth || !db) {
      throw new Error('Firebase services not initialized');
    }
    
    try {
      const { email, password, ...otherData } = registerData;
      
      console.log('Creating user account for:', email);
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('User account created:', user.uid);

      // Update user profile
      await updateProfile(user, {
        displayName: registerData.name
      });
      
      console.log('Profile updated');

      // Save additional user data to Firestore
      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        ...otherData,
        createdAt: serverTimestamp() // Use server timestamp instead of new Date()
      };

      console.log('Saving user data to Firestore:', userData);
      
      // Use merge: true to ensure the document is created or updated
      await setDoc(doc(db, 'profiles', user.uid), userData, { merge: true });
      
      console.log('User data saved successfully');
      
    } catch (error) {
      console.error('Registration error in context:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) {
      throw new Error('Authentication not initialized');
    }
    try {
      await signOut(auth);
      setUserData(null); // Clear user data on logout
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const refreshToken = async () => {
    if (user) {
      try {
        const token = await getIdToken(user, true); // Force refresh
        console.log('Token refreshed successfully');
        return token;
      } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
      }
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    login,
    register,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};