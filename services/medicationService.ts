import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase.config';

export interface Medication {
  id?: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  notes?: string | null;
  active: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface CreateMedicationData {
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  notes?: string | null;
  active?: boolean;
}

class MedicationService {
  private collectionName = 'medications';

  // Get all medications for a specific user
  async getUserMedications(userId: string): Promise<Medication[]> {
    try {
      // First try with ordering by createdAt
      try {
        const q = query(
          collection(db, this.collectionName),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const medications: Medication[] = [];
        
        querySnapshot.forEach((doc) => {
          medications.push({
            id: doc.id,
            ...doc.data()
          } as Medication);
        });
        
        return medications;
      } catch (indexError: any) {
        // If index doesn't exist, fall back to simple query without ordering
        console.log('Index not found, using simple query:', indexError.message);
        
        const q = query(
          collection(db, this.collectionName),
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        const medications: Medication[] = [];
        
        querySnapshot.forEach((doc) => {
          medications.push({
            id: doc.id,
            ...doc.data()
          } as Medication);
        });
        
        // Sort locally by createdAt if available
        return medications.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toDate ? b.createdAt.toDate() - a.createdAt.toDate() : 0;
          }
          return 0;
        });
      }
    } catch (error) {
      console.error('Error fetching user medications:', error);
      throw error;
    }
  }

  // Add a new medication for a user
  async addMedication(userId: string, medicationData: CreateMedicationData): Promise<string> {
    try {
      // Filter out undefined values and empty strings for notes
      const cleanMedicationData = {
        ...medicationData,
        notes: medicationData.notes && medicationData.notes.trim() !== '' ? medicationData.notes.trim() : null
      };

      const medication: Omit<Medication, 'id'> = {
        userId,
        ...cleanMedicationData,
        active: medicationData.active ?? true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Remove any undefined values from the medication object
      const cleanMedication = Object.fromEntries(
        Object.entries(medication).filter(([_, value]) => value !== undefined)
      );

      console.log('Adding medication for user:', userId, cleanMedication);
      const docRef = await addDoc(collection(db, this.collectionName), cleanMedication);
      console.log('Medication added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  }

  // Update an existing medication
  async updateMedication(medicationId: string, updates: Partial<Medication>): Promise<void> {
    try {
      const medicationRef = doc(db, this.collectionName, medicationId);
      await updateDoc(medicationRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  }

  // Delete a medication
  async deleteMedication(medicationId: string): Promise<void> {
    try {
      const medicationRef = doc(db, this.collectionName, medicationId);
      await deleteDoc(medicationRef);
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  }

  // Toggle medication active status
  async toggleMedicationStatus(medicationId: string, active: boolean): Promise<void> {
    try {
      await this.updateMedication(medicationId, { active });
    } catch (error) {
      console.error('Error toggling medication status:', error);
      throw error;
    }
  }

  // Get a single medication by ID
  async getMedicationById(medicationId: string): Promise<Medication | null> {
    try {
      const medicationRef = doc(db, this.collectionName, medicationId);
      const medicationDoc = await getDoc(medicationRef);
      
      if (medicationDoc.exists()) {
        return {
          id: medicationDoc.id,
          ...medicationDoc.data()
        } as Medication;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching medication by ID:', error);
      throw error;
    }
  }
}

export const medicationService = new MedicationService(); 