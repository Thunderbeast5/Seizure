import {
    User,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase.config';

interface DoctorData {
  uid: string;
  email: string;
  name: string;
  specialty: string;
  hospital: string;
  phone: string;
  licenseNumber: string;
  isActive: boolean;
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  doctorData: DoctorData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (doctorData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  specialty: string;
  hospital: string;
  phone: string;
  licenseNumber: string;
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
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
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
        // Fetch additional doctor data from Firestore
        try {
          console.log('Fetching doctor data for:', user.uid);
          const doctorDoc = await getDoc(doc(db, 'doctors', user.uid));
          if (doctorDoc.exists()) {
            const data = doctorDoc.data() as DoctorData;
            console.log('Doctor data fetched:', data);
            setDoctorData(data);
          } else {
            console.log('No doctor document found');
            setDoctorData(null);
          }
        } catch (error) {
          console.error('Error fetching doctor data:', error);
          setDoctorData(null);
        }
      } else {
        setDoctorData(null);
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.uid);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (registerData: RegisterData) => {
    if (!auth || !db) {
      throw new Error('Firebase services not initialized');
    }
    
    try {
      const { email, password, ...otherData } = registerData;
      
      console.log('Creating doctor account for:', email);
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Doctor account created:', user.uid);

      // Save additional doctor data to Firestore
      const doctorData: DoctorData = {
        uid: user.uid,
        email: user.email!,
        ...otherData,
        isActive: true,
        createdAt: serverTimestamp()
      };

      console.log('Saving doctor data to Firestore:', doctorData);
      
      // Use merge: true to ensure the document is created or updated
      await setDoc(doc(db, 'doctors', user.uid), doctorData, { merge: true });
      
      console.log('Doctor data saved successfully');
      
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
      setDoctorData(null); // Clear doctor data on logout
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    doctorData,
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
