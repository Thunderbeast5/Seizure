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

export interface PatientConnectionRequest {
  id?: string;
  doctorId: string;
  patientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface PatientSearchResult {
  userId: string;
  name: string;
  age: number;
  gender: string;
  seizureType: string;
  hasConnectionRequest: boolean;
  connectionStatus?: 'pending' | 'accepted' | 'rejected';
}

export interface CreateConnectionRequestData {
  doctorId: string;
  patientId: string;
  message?: string;
}

class PatientConnectionService {
  private connectionCollection = 'patientConnections';
  private profilesCollection = 'profiles';

  // Search for patients by name or other criteria
  async searchPatients(searchTerm: string, doctorId: string): Promise<PatientSearchResult[]> {
    try {
      // Get all profiles and filter by search term
      const profilesQuery = query(collection(db, this.profilesCollection));
      const profilesSnapshot = await getDocs(profilesQuery);
      
      const patients: PatientSearchResult[] = [];
      
      for (const profileDoc of profilesSnapshot.docs) {
        const profileData = profileDoc.data();
        const patientName = profileData.child?.name || '';
        const patientId = profileDoc.id;
        
        // Check if patient name matches search term (case-insensitive) or if it's a direct ID match
        if (patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            patientId.toLowerCase().includes(searchTerm.toLowerCase())) {
          
          // Check if there's already a connection request
          const connectionQuery = query(
            collection(db, this.connectionCollection),
            where('doctorId', '==', doctorId),
            where('patientId', '==', patientId)
          );
          const connectionSnapshot = await getDocs(connectionQuery);
          
          let hasConnectionRequest = false;
          let connectionStatus: 'pending' | 'accepted' | 'rejected' | undefined;
          
          if (!connectionSnapshot.empty) {
            hasConnectionRequest = true;
            connectionStatus = connectionSnapshot.docs[0].data().status;
          }
          
          patients.push({
            userId: patientId,
            name: patientName || 'Unknown Patient',
            age: profileData.child?.age || 0,
            gender: profileData.child?.gender || '',
            seizureType: profileData.diagnosis?.type || '',
            hasConnectionRequest,
            connectionStatus
          });
        }
      }
      
      return patients;
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }

  // Alternative: Search by patient ID (if doctor knows the patient ID)
  async searchPatientById(patientId: string, doctorId: string): Promise<PatientSearchResult | null> {
    try {
      // Try to get the patient profile
      const profileDoc = await getDoc(doc(db, this.profilesCollection, patientId));
      
      if (!profileDoc.exists()) {
        return null;
      }
      
      const profileData = profileDoc.data();
      
      // Check if there's already a connection request
      const connectionQuery = query(
        collection(db, this.connectionCollection),
        where('doctorId', '==', doctorId),
        where('patientId', '==', patientId)
      );
      const connectionSnapshot = await getDocs(connectionQuery);
      
      let hasConnectionRequest = false;
      let connectionStatus: 'pending' | 'accepted' | 'rejected' | undefined;
      
      if (!connectionSnapshot.empty) {
        hasConnectionRequest = true;
        connectionStatus = connectionSnapshot.docs[0].data().status;
      }
      
      return {
        userId: patientId,
        name: profileData.child?.name || 'Unknown',
        age: profileData.child?.age || 0,
        gender: profileData.child?.gender || '',
        seizureType: profileData.diagnosis?.type || '',
        hasConnectionRequest,
        connectionStatus
      };
    } catch (error) {
      console.error('Error searching patient by ID:', error);
      throw error;
    }
  }

  // Send connection request to a patient
  async sendConnectionRequest(requestData: CreateConnectionRequestData): Promise<string> {
    try {
      const connectionRequest: PatientConnectionRequest = {
        ...requestData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.connectionCollection), connectionRequest);
      console.log('Connection request sent successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  }

  // Get all connection requests for a doctor
  async getDoctorConnectionRequests(doctorId: string): Promise<PatientConnectionRequest[]> {
    try {
      const q = query(
        collection(db, this.connectionCollection),
        where('doctorId', '==', doctorId)
      );
      
      const querySnapshot = await getDocs(q);
      const requests: PatientConnectionRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data()
        } as PatientConnectionRequest);
      });
      
      return requests;
    } catch (error) {
      console.error('Error fetching connection requests:', error);
      throw error;
    }
  }

  // Get all connection requests for a patient
  async getPatientConnectionRequests(patientId: string): Promise<PatientConnectionRequest[]> {
    try {
      const q = query(
        collection(db, this.connectionCollection),
        where('patientId', '==', patientId)
      );
      
      const querySnapshot = await getDocs(q);
      const requests: PatientConnectionRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data()
        } as PatientConnectionRequest);
      });
      
      return requests;
    } catch (error) {
      console.error('Error fetching patient connection requests:', error);
      throw error;
    }
  }

  // Update connection request status (accept/reject)
  async updateConnectionStatus(
    requestId: string, 
    status: 'accepted' | 'rejected'
  ): Promise<void> {
    try {
      const requestRef = doc(db, this.connectionCollection, requestId);
      await updateDoc(requestRef, {
        status,
        updatedAt: serverTimestamp()
      });
      
      // If accepted, update the patient's profile with doctorId
      if (status === 'accepted') {
        const requestDoc = await getDoc(requestRef);
        if (requestDoc.exists()) {
          const requestData = requestDoc.data() as PatientConnectionRequest;
          const profileRef = doc(db, this.profilesCollection, requestData.patientId);
          await updateDoc(profileRef, {
            doctorId: requestData.doctorId,
            updatedAt: serverTimestamp()
          });
        }
      }
      
      console.log('Connection request status updated successfully');
    } catch (error) {
      console.error('Error updating connection status:', error);
      throw error;
    }
  }

  // Remove connection request
  async removeConnectionRequest(requestId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.connectionCollection, requestId));
      console.log('Connection request removed successfully');
    } catch (error) {
      console.error('Error removing connection request:', error);
      throw error;
    }
  }

  // Get patient details for accepted connections
  async getConnectedPatientDetails(patientId: string): Promise<any> {
    try {
      // Check if there's an accepted connection
      const connectionQuery = query(
        collection(db, this.connectionCollection),
        where('patientId', '==', patientId),
        where('status', '==', 'accepted')
      );
      const connectionSnapshot = await getDocs(connectionQuery);
      
      if (connectionSnapshot.empty) {
        throw new Error('No accepted connection found for this patient');
      }
      
      // Get patient profile
      const profileDoc = await getDoc(doc(db, this.profilesCollection, patientId));
      if (!profileDoc.exists()) {
        throw new Error('Patient profile not found');
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
      console.error('Error fetching connected patient details:', error);
      throw error;
    }
  }
}

export const patientConnectionService = new PatientConnectionService();
