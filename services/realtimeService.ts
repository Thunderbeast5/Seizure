import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  Unsubscribe 
} from 'firebase/firestore';
import { db } from '../firebase.config';

export interface SeizureData {
  id?: string;
  userId: string;
  date: string;
  time?: string;
  type: string;
  duration?: string;
  triggers?: string;
  severity?: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface MedicationData {
  id?: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface ProfileData {
  id: string;
  child?: {
    name: string;
    age: number;
    gender: string;
  };
  diagnosis?: {
    type: string;
    date: string;
  };
  doctorId?: string;
  createdAt?: any;
  updatedAt?: any;
}

class RealtimeService {
  // Real-time listener for user seizures
  subscribeToSeizures(userId: string, callback: (seizures: SeizureData[]) => void): Unsubscribe {
    const seizuresQuery = query(
      collection(db, 'seizures'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    return onSnapshot(seizuresQuery, (querySnapshot) => {
      const seizures: SeizureData[] = [];
      querySnapshot.forEach((doc) => {
        seizures.push({
          id: doc.id,
          ...doc.data()
        } as SeizureData);
      });
      callback(seizures);
    }, (error) => {
      console.error('Error in seizures real-time listener:', error);
    });
  }

  // Real-time listener for user medications
  subscribeToMedications(userId: string, callback: (medications: MedicationData[]) => void): Unsubscribe {
    const medicationsQuery = query(
      collection(db, 'medications'),
      where('userId', '==', userId),
      orderBy('startDate', 'desc')
    );
    
    return onSnapshot(medicationsQuery, (querySnapshot) => {
      const medications: MedicationData[] = [];
      querySnapshot.forEach((doc) => {
        medications.push({
          id: doc.id,
          ...doc.data()
        } as MedicationData);
      });
      callback(medications);
    }, (error) => {
      console.error('Error in medications real-time listener:', error);
    });
  }

  // Real-time listener for user profile
  subscribeToProfile(userId: string, callback: (profile: ProfileData | null) => void): Unsubscribe {
    const profileDocRef = doc(db, 'profiles', userId);
    
    return onSnapshot(profileDocRef, (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        } as ProfileData);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error in profile real-time listener:', error);
    });
  }

  // Real-time listener for connection requests (for doctors)
  subscribeToConnectionRequests(userId: string, callback: (requests: any[]) => void): Unsubscribe {
    const requestsQuery = query(
      collection(db, 'connectionRequests'),
      where('patientId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(requestsQuery, (querySnapshot) => {
      const requests: any[] = [];
      querySnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(requests);
    }, (error) => {
      console.error('Error in connection requests real-time listener:', error);
    });
  }
}

export const realtimeService = new RealtimeService();
