import {
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

export interface DoctorConnectionInfo {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  message?: string;
  createdAt: any;
}

export interface CreateConnectionRequestData {
  doctorId: string;
  patientId: string;
  message?: string;
}

class PatientConnectionService {
  private connectionCollection = 'patientConnections';
  private doctorsCollection = 'doctors';

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

  // Get doctor information for a connection request
  async getDoctorInfo(doctorId: string): Promise<any> {
    try {
      const doctorDoc = await getDoc(doc(db, this.doctorsCollection, doctorId));
      if (doctorDoc.exists()) {
        return {
          id: doctorDoc.id,
          ...doctorDoc.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching doctor info:', error);
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
          const profileRef = doc(db, 'profiles', requestData.patientId);
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

  // Get all connection requests with doctor information
  async getPatientConnectionRequestsWithDoctorInfo(patientId: string): Promise<DoctorConnectionInfo[]> {
    try {
      const requests = await this.getPatientConnectionRequests(patientId);
      const requestsWithDoctorInfo: DoctorConnectionInfo[] = [];
      
      for (const request of requests) {
        const doctorInfo = await this.getDoctorInfo(request.doctorId);
        if (doctorInfo) {
          requestsWithDoctorInfo.push({
            id: request.id!,
            name: doctorInfo.name,
            specialty: doctorInfo.specialty,
            hospital: doctorInfo.hospital,
            message: request.message,
            createdAt: request.createdAt
          });
        }
      }
      
      return requestsWithDoctorInfo;
    } catch (error) {
      console.error('Error fetching connection requests with doctor info:', error);
      throw error;
    }
  }
}

export const patientConnectionService = new PatientConnectionService();

