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

export interface Seizure {
  id?: string;
  userId: string;
  date: string;
  time: string;
  type: string;
  duration: string;
  triggers?: string | null;
  notes?: string | null;
  videoUrl?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

export interface CreateSeizureData {
  date: string;
  time: string;
  type: string;
  duration: string;
  triggers?: string | null;
  notes?: string | null;
  videoUrl?: string | null;
}

class SeizureService {
  private collectionName = 'seizures';

  // Get all seizures for a specific user
  async getUserSeizures(userId: string): Promise<Seizure[]> {
    try {
      // First try with ordering by createdAt
      try {
        const q = query(
          collection(db, this.collectionName),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const seizures: Seizure[] = [];
        
        querySnapshot.forEach((doc) => {
          seizures.push({
            id: doc.id,
            ...doc.data()
          } as Seizure);
        });
        
        return seizures;
      } catch (indexError: any) {
        // If index doesn't exist, fall back to simple query without ordering
        console.log('Index not found, using simple query:', indexError.message);
        
        const q = query(
          collection(db, this.collectionName),
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        const seizures: Seizure[] = [];
        
        querySnapshot.forEach((doc) => {
          seizures.push({
            id: doc.id,
            ...doc.data()
          } as Seizure);
        });
        
        // Sort locally by date and time
        return seizures.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateB.getTime() - dateA.getTime();
        });
      }
    } catch (error) {
      console.error('Error fetching user seizures:', error);
      throw error;
    }
  }

  // Add a new seizure for a user
  async addSeizure(userId: string, seizureData: CreateSeizureData): Promise<string> {
    try {
      // Filter out undefined values and empty strings
      const cleanSeizureData = {
        ...seizureData,
        triggers: seizureData.triggers && seizureData.triggers.trim() !== '' ? seizureData.triggers.trim() : null,
        notes: seizureData.notes && seizureData.notes.trim() !== '' ? seizureData.notes.trim() : null,
        videoUrl: seizureData.videoUrl && seizureData.videoUrl.trim() !== '' ? seizureData.videoUrl.trim() : null
      };

      const seizure: Omit<Seizure, 'id'> = {
        userId,
        ...cleanSeizureData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Remove any undefined values from the seizure object
      const cleanSeizure = Object.fromEntries(
        Object.entries(seizure).filter(([_, value]) => value !== undefined)
      );

      console.log('Adding seizure for user:', userId, cleanSeizure);
      const docRef = await addDoc(collection(db, this.collectionName), cleanSeizure);
      console.log('Seizure added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding seizure:', error);
      throw error;
    }
  }

  // Update an existing seizure
  async updateSeizure(seizureId: string, updates: Partial<Seizure>): Promise<void> {
    try {
      const seizureRef = doc(db, this.collectionName, seizureId);
      await updateDoc(seizureRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating seizure:', error);
      throw error;
    }
  }

  // Delete a seizure
  async deleteSeizure(seizureId: string): Promise<void> {
    try {
      const seizureRef = doc(db, this.collectionName, seizureId);
      await deleteDoc(seizureRef);
    } catch (error) {
      console.error('Error deleting seizure:', error);
      throw error;
    }
  }

  // Get a single seizure by ID
  async getSeizureById(seizureId: string): Promise<Seizure | null> {
    try {
      const seizureRef = doc(db, this.collectionName, seizureId);
      const seizureDoc = await getDoc(seizureRef);
      
      if (seizureDoc.exists()) {
        return {
          id: seizureDoc.id,
          ...seizureDoc.data()
        } as Seizure;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching seizure by ID:', error);
      throw error;
    }
  }

  // Get seizures by date range
  async getSeizuresByDateRange(userId: string, startDate: string, endDate: string): Promise<Seizure[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const seizures: Seizure[] = [];
      
      querySnapshot.forEach((doc) => {
        seizures.push({
          id: doc.id,
          ...doc.data()
        } as Seizure);
      });
      
      return seizures;
    } catch (error) {
      console.error('Error fetching seizures by date range:', error);
      throw error;
    }
  }

  // Get seizure statistics for a user
  async getSeizureStats(userId: string): Promise<{
    totalSeizures: number;
    seizuresThisMonth: number;
    mostCommonType: string;
    averageDuration: string;
  }> {
    try {
      const seizures = await this.getUserSeizures(userId);
      
      if (seizures.length === 0) {
        return {
          totalSeizures: 0,
          seizuresThisMonth: 0,
          mostCommonType: 'None',
          averageDuration: '0'
        };
      }

      const now = new Date();
      const thisMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
      
      const seizuresThisMonth = seizures.filter(seizure => 
        seizure.date.startsWith(thisMonth)
      ).length;

      // Count seizure types
      const typeCount: { [key: string]: number } = {};
      seizures.forEach(seizure => {
        typeCount[seizure.type] = (typeCount[seizure.type] || 0) + 1;
      });

      const mostCommonType = Object.keys(typeCount).reduce((a, b) => 
        typeCount[a] > typeCount[b] ? a : b
      );

      // Calculate average duration (simplified - assumes duration is in minutes)
      const durations = seizures.map(seizure => {
        const duration = seizure.duration.toLowerCase();
        if (duration.includes('minute')) {
          return parseInt(duration.match(/\d+/)?.[0] || '0');
        } else if (duration.includes('second')) {
          return parseInt(duration.match(/\d+/)?.[0] || '0') / 60;
        }
        return 0;
      });

      const averageMinutes = durations.reduce((a, b) => a + b, 0) / durations.length;
      const averageDuration = averageMinutes >= 1 ? 
        `${Math.round(averageMinutes)} minutes` : 
        `${Math.round(averageMinutes * 60)} seconds`;

      return {
        totalSeizures: seizures.length,
        seizuresThisMonth,
        mostCommonType,
        averageDuration
      };
    } catch (error) {
      console.error('Error calculating seizure stats:', error);
      throw error;
    }
  }
}

export const seizureService = new SeizureService(); 