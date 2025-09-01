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

export interface Doctor {
  id?: string;
  email: string;
  name: string;
  specialty: string;
  hospital: string;
  phone: string;
  licenseNumber: string;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface CreateDoctorData {
  email: string;
  name: string;
  specialty: string;
  hospital: string;
  phone: string;
  licenseNumber: string;
  isActive?: boolean;
}

export interface PatientSummary {
  userId: string;
  name: string;
  age: number;
  gender: string;
  seizureType: string;
  lastSeizureDate?: string;
  totalSeizures: number;
  medications: string[];
  bloodType: string;
  allergies: string;
}

export interface PatientDetails {
  profile: any;
  seizures: any[];
  medications: any[];
}

class DoctorService {
  private collectionName = 'doctors';

  // Get all doctors
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const doctors: Doctor[] = [];
      
      querySnapshot.forEach((doc) => {
        doctors.push({
          id: doc.id,
          ...doc.data()
        } as Doctor);
      });
      
      // Sort by name in JavaScript
      doctors.sort((a, b) => a.name.localeCompare(b.name));
      
      return doctors;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  }

  // Get doctor by ID
  async getDoctorById(doctorId: string): Promise<Doctor | null> {
    try {
      const doctorDoc = await getDoc(doc(db, this.collectionName, doctorId));
      if (doctorDoc.exists()) {
        return {
          id: doctorDoc.id,
          ...doctorDoc.data()
        } as Doctor;
      }
      return null;
    } catch (error) {
      console.error('Error fetching doctor:', error);
      throw error;
    }
  }

  // Get patients assigned to a doctor
  async getAssignedPatients(doctorId: string): Promise<PatientSummary[]> {
    try {
      // Get all profiles where doctorId matches
      const q = query(
        collection(db, 'profiles'),
        where('doctorId', '==', doctorId)
      );
      
      const querySnapshot = await getDocs(q);
      const patients: PatientSummary[] = [];
      
      for (const profileDoc of querySnapshot.docs) {
        const profileData = profileDoc.data();
        
        // Create a basic patient summary without additional queries
        // This avoids permission issues with seizures/medications collections
        patients.push({
          userId: profileDoc.id,
          name: profileData.child?.name || 'Unknown',
          age: profileData.child?.age || 0,
          gender: profileData.child?.gender || '',
          seizureType: profileData.diagnosis?.type || '',
          lastSeizureDate: undefined, // Will be populated when needed
          totalSeizures: 0, // Will be populated when needed
          medications: [], // Will be populated when needed
          bloodType: profileData.child?.bloodType || '',
          allergies: profileData.child?.allergies || ''
        });
      }
      
      return patients;
    } catch (error) {
      console.error('Error fetching assigned patients:', error);
      throw error;
    }
  }

  // Get patient details for doctor view
  async getPatientDetails(patientId: string): Promise<PatientDetails> {
    try {
      // Get profile
      const profileDoc = await getDoc(doc(db, 'profiles', patientId));
      if (!profileDoc.exists()) {
        throw new Error('Patient not found');
      }
      
      const profileData = profileDoc.data();
      
      // Get seizures
      const seizuresQuery = query(
        collection(db, 'seizures'),
        where('userId', '==', patientId)
      );
      const seizuresSnapshot = await getDocs(seizuresQuery);
      const seizures = seizuresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt in JavaScript (descending)
      seizures.sort((a: any, b: any) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime.getTime() - aTime.getTime();
      });
      
      // Get medications
      const medicationsQuery = query(
        collection(db, 'medications'),
        where('userId', '==', patientId)
      );
      const medicationsSnapshot = await getDocs(medicationsQuery);
      const medications = medicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return {
        profile: profileData,
        seizures,
        medications
      };
    } catch (error) {
      console.error('Error fetching patient details:', error);
      throw error;
    }
  }

  // Create new doctor
  async createDoctor(doctorData: CreateDoctorData): Promise<string> {
    try {
      const cleanDoctorData = {
        ...doctorData,
        isActive: doctorData.isActive ?? true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collectionName), cleanDoctorData);
      console.log('Doctor created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating doctor:', error);
      throw error;
    }
  }

  // Update doctor
  async updateDoctor(doctorId: string, doctorData: Partial<CreateDoctorData>): Promise<void> {
    try {
      const doctorRef = doc(db, this.collectionName, doctorId);
      const updateData = {
        ...doctorData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doctorRef, updateData);
      console.log('Doctor updated successfully');
    } catch (error) {
      console.error('Error updating doctor:', error);
      throw error;
    }
  }

  // Delete doctor
  async deleteDoctor(doctorId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, doctorId));
      console.log('Doctor deleted successfully');
    } catch (error) {
      console.error('Error deleting doctor:', error);
      throw error;
    }
  }
}

export const doctorService = new DoctorService();
