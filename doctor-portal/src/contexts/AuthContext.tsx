import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.config';

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // For now, set mock doctor data. In a real app, you'd fetch this from Firestore
        setDoctorData({
          name: 'Dr. ' + (user.email?.split('@')[0] || 'Doctor'),
          specialty: 'Neurologist',
          hospital: 'General Hospital',
          phone: '+1 (555) 123-4567',
          licenseNumber: 'MD123456'
        });
      } else {
        setDoctorData(null);
      }
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
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    // Here you could store additional doctor profile data in Firestore
    // For now, we'll just create the auth account
    console.log('Doctor registered:', userCredential.user.uid, data);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value: AuthContextType = {
    user,
    doctorData,
    loading,
    signIn,
    signUp,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
