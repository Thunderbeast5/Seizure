import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
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
}

class DoctorService {
  private collectionName = 'doctors';

  // Get all doctors
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      const doctors: Doctor[] = [];
      
      querySnapshot.forEach((doc) => {
        doctors.push({
          id: doc.id,
          ...doc.data()
        } as Doctor);
      });
      
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
        
        // Get seizure count for this patient
        const seizuresQuery = query(
          collection(db, 'seizures'),
          where('userId', '==', profileDoc.id)
        );
        const seizuresSnapshot = await getDocs(seizuresQuery);
        
        // Get medications for this patient
        const medicationsQuery = query(
          collection(db, 'medications'),
          where('userId', '==', profileDoc.id),
          where('active', '==', true)
        );
        const medicationsSnapshot = await getDocs(medicationsQuery);
        const medications = medicationsSnapshot.docs.map(doc => doc.data().name);
        
        // Get last seizure date
        let lastSeizureDate: string | undefined;
        if (seizuresSnapshot.docs.length > 0) {
          const sortedSeizures = seizuresSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          lastSeizureDate = sortedSeizures[0].date;
        }
        
        patients.push({
          userId: profileDoc.id,
          name: profileData.child?.name || 'Unknown',
          age: profileData.child?.age || 0,
          gender: profileData.child?.gender || '',
          seizureType: profileData.diagnosis?.type || '',
          lastSeizureDate,
          totalSeizures: seizuresSnapshot.docs.length,
          medications
        });
      }
      
      return patients;
    } catch (error) {
      console.error('Error fetching assigned patients:', error);
      throw error;
    }
  }

  // Get patient details for doctor view
  async getPatientDetails(patientId: string): Promise<any> {
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
        where('userId', '==', patientId),
        orderBy('createdAt', 'desc')
      );
      const seizuresSnapshot = await getDocs(seizuresQuery);
      const seizures = seizuresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
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
