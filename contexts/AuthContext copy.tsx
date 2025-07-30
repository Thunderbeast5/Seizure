// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
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

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.uid);
      setUser(user);
      
      if (user) {
        // Fetch additional user data from Firestore
        try {
          console.log('Fetching user data for UID:', user.uid);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            console.log('User data found:', userDoc.data());
            setUserData(userDoc.data() as UserData);
          } else {
            console.log('No user data found in Firestore for UID:', user.uid);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Authentication not initialized');
    }
    try {
      console.log('Attempting to login with email:', email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (registerData: RegisterData) => {
    if (!auth) {
      throw new Error('Authentication not initialized');
    }
    
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    try {
      console.log('Starting registration process...');
      const { email, password, ...otherData } = registerData;
      
      // Create user account
      console.log('Creating user account for email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User account created with UID:', user.uid);

      // Update user profile
      console.log('Updating user profile...');
      await updateProfile(user, {
        displayName: registerData.name
      });
      console.log('User profile updated');

      // Prepare user data for Firestore
      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        ...otherData,
        createdAt: new Date()
      };

      console.log('Saving user data to Firestore:', userData);
      
      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('User data saved to Firestore successfully');
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) {
      throw new Error('Authentication not initialized');
    }
    try {
      console.log('Logging out...');
      await signOut(auth);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};