import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../firebase.config';

export interface PatientSeizure {
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

export interface PatientMedication {
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

export interface PatientProfile {
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

class PatientDataService {
  private seizuresCollection = 'seizures';
  private medicationsCollection = 'medications';
  private profilesCollection = 'profiles';

  // ===== SEIZURE CRUD OPERATIONS =====

  // Get all seizures for a patient
  async getPatientSeizures(patientId: string): Promise<PatientSeizure[]> {
    try {
      const seizuresQuery = query(
        collection(db, this.seizuresCollection),
        where('userId', '==', patientId)
      );
      
      const querySnapshot = await getDocs(seizuresQuery);
      const seizures: PatientSeizure[] = [];
      
      querySnapshot.forEach((doc) => {
        seizures.push({
          id: doc.id,
          ...doc.data()
        } as PatientSeizure);
      });
      
      // Sort by date in JavaScript (descending)
      seizures.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return seizures;
    } catch (error) {
      console.error('Error fetching patient seizures:', error);
      throw error;
    }
  }

  // Add new seizure for patient
  async addPatientSeizure(patientId: string, seizureData: Omit<PatientSeizure, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const seizure: PatientSeizure = {
        ...seizureData,
        userId: patientId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.seizuresCollection), seizure);
      console.log('Seizure added successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding seizure:', error);
      throw error;
    }
  }

  // Update seizure
  async updatePatientSeizure(seizureId: string, seizureData: Partial<PatientSeizure>): Promise<void> {
    try {
      const seizureRef = doc(db, this.seizuresCollection, seizureId);
      await updateDoc(seizureRef, {
        ...seizureData,
        updatedAt: serverTimestamp()
      });
      console.log('Seizure updated successfully');
    } catch (error) {
      console.error('Error updating seizure:', error);
      throw error;
    }
  }

  // Delete seizure
  async deletePatientSeizure(seizureId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.seizuresCollection, seizureId));
      console.log('Seizure deleted successfully');
    } catch (error) {
      console.error('Error deleting seizure:', error);
      throw error;
    }
  }

  // ===== MEDICATION CRUD OPERATIONS =====

  // Get all medications for a patient
  async getPatientMedications(patientId: string): Promise<PatientMedication[]> {
    try {
      const medicationsQuery = query(
        collection(db, this.medicationsCollection),
        where('userId', '==', patientId)
      );
      
      const querySnapshot = await getDocs(medicationsQuery);
      const medications: PatientMedication[] = [];
      
      querySnapshot.forEach((doc) => {
        medications.push({
          id: doc.id,
          ...doc.data()
        } as PatientMedication);
      });
      
      // Sort by start date in JavaScript (descending)
      medications.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      
      return medications;
    } catch (error) {
      console.error('Error fetching patient medications:', error);
      throw error;
    }
  }

  // Add new medication for patient
  async addPatientMedication(patientId: string, medicationData: Omit<PatientMedication, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const medication: PatientMedication = {
        ...medicationData,
        userId: patientId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.medicationsCollection), medication);
      console.log('Medication added successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  }

  // Update medication
  async updatePatientMedication(medicationId: string, medicationData: Partial<PatientMedication>): Promise<void> {
    try {
      const medicationRef = doc(db, this.medicationsCollection, medicationId);
      await updateDoc(medicationRef, {
        ...medicationData,
        updatedAt: serverTimestamp()
      });
      console.log('Medication updated successfully');
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  }

  // Delete medication
  async deletePatientMedication(medicationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.medicationsCollection, medicationId));
      console.log('Medication deleted successfully');
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  }

  // ===== PROFILE OPERATIONS =====

  // Get patient profile
  async getPatientProfile(patientId: string): Promise<PatientProfile | null> {
    try {
      const profileDoc = await getDoc(doc(db, this.profilesCollection, patientId));
      
      if (!profileDoc.exists()) {
        return null;
      }
      
      return {
        id: profileDoc.id,
        ...profileDoc.data()
      } as PatientProfile;
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      throw error;
    }
  }

  // Update patient profile
  async updatePatientProfile(patientId: string, profileData: Partial<PatientProfile>): Promise<void> {
    try {
      const profileRef = doc(db, this.profilesCollection, patientId);
      await updateDoc(profileRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      });
      console.log('Patient profile updated successfully');
    } catch (error) {
      console.error('Error updating patient profile:', error);
      throw error;
    }
  }

  // ===== COMPREHENSIVE PATIENT DATA =====

  // Get complete patient data (profile + seizures + medications)
  async getCompletePatientData(patientId: string): Promise<{
    profile: PatientProfile | null;
    seizures: PatientSeizure[];
    medications: PatientMedication[];
  }> {
    try {
      const [profile, seizures, medications] = await Promise.all([
        this.getPatientProfile(patientId),
        this.getPatientSeizures(patientId),
        this.getPatientMedications(patientId)
      ]);

      return {
        profile,
        seizures,
        medications
      };
    } catch (error) {
      console.error('Error fetching complete patient data:', error);
      throw error;
    }
  }

  // ===== STATISTICS AND ANALYTICS =====

  // Get seizure statistics for a patient
  async getSeizureStatistics(patientId: string): Promise<{
    totalSeizures: number;
    lastSeizureDate: string | null;
    averageSeizuresPerMonth: number;
    seizureTypes: { [key: string]: number };
  }> {
    try {
      const seizures = await this.getPatientSeizures(patientId);
      
      const totalSeizures = seizures.length;
      const lastSeizureDate = seizures.length > 0 ? seizures[0].date : null;
      
      // Calculate average seizures per month (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const recentSeizures = seizures.filter(seizure => 
        new Date(seizure.date) >= sixMonthsAgo
      );
      
      const averageSeizuresPerMonth = recentSeizures.length / 6;
      
      // Count seizure types
      const seizureTypes: { [key: string]: number } = {};
      seizures.forEach(seizure => {
        seizureTypes[seizure.type] = (seizureTypes[seizure.type] || 0) + 1;
      });
      
      return {
        totalSeizures,
        lastSeizureDate,
        averageSeizuresPerMonth,
        seizureTypes
      };
    } catch (error) {
      console.error('Error calculating seizure statistics:', error);
      throw error;
    }
  }
}

export const patientDataService = new PatientDataService();
