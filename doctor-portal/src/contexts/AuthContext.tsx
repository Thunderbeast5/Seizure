import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, setPersistence, browserLocalPersistence, getIdToken } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase.config';

interface DoctorData {
  name: string;
  specialty: string;
  hospital: string;
  phone: string;
  licenseNumber: string;
}

interface DoctorRegistrationData {
  email: string;
  password: string;
  name: string;
  specialty: string;
  hospital: string;
  phone: string;
  licenseNumber: string;
}

interface AuthContextType {
  user: User | null;
  doctorData: DoctorData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  register: (data: DoctorRegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set persistence to local storage for session persistence
    setPersistence(auth, browserLocalPersistence).then(() => {
      console.log('Auth persistence set to local');
    }).catch((error) => {
      console.error('Error setting auth persistence:', error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Always set mock data first to prevent loading state
          setDoctorData({
            name: 'Dr. ' + (user.email?.split('@')[0] || 'Doctor'),
            specialty: 'Neurologist',
            hospital: 'General Hospital',
            phone: '+1 (555) 123-4567',
            licenseNumber: 'MD123456'
          });
          
          // Then try to fetch real doctor data from Firestore
          const doctorDocRef = doc(db, 'doctors', user.uid);
          const doctorDoc = await getDoc(doctorDocRef);
          
          if (doctorDoc.exists()) {
            const doctorInfo = doctorDoc.data() as DoctorData;
            setDoctorData(doctorInfo);
            
            // Set up real-time listener for doctor data updates
            onSnapshot(doctorDocRef, (doc) => {
              if (doc.exists()) {
                setDoctorData(doc.data() as DoctorData);
              }
            });
          }
        } catch (error) {
          console.error('Error fetching doctor data:', error);
          // Keep the mock data that was already set
        }
      } else {
        setDoctorData(null);
      }
      
      // Always set loading to false after processing
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const register = async (data: DoctorRegistrationData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Create doctor profile in Firestore using the user's UID as document ID
      const doctorData = {
        email: data.email,
        name: data.name,
        specialty: data.specialty,
        hospital: data.hospital,
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'doctors', userCredential.user.uid), doctorData);
      console.log('Doctor registered and profile created:', userCredential.user.uid, data);
    } catch (error) {
      console.error('Error during doctor registration:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
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
    doctorData,
    loading,
    signIn,
    signUp,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
