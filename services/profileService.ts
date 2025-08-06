import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase.config';

export interface ChildInfo {
  name: string;
  age: number;
  birthDate: string;
  gender: string;
  weight: string;
  height: string;
  bloodType: string;
  allergies: string;
  photo: string;
}

export interface DiagnosisInfo {
  type: string;
  diagnosisDate: string;
  diagnosedBy: string;
  notes: string;
}

export interface Caregiver {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface ProfileSettings {
  notifications: boolean;
  dataSharing: boolean;
  locationTracking: boolean;
  darkMode: boolean;
  autoBackup: boolean;
}

export interface ProfileData {
  userId: string;
  child: ChildInfo;
  diagnosis: DiagnosisInfo;
  caregivers: Caregiver[];
  emergencyContacts: EmergencyContact[];
  settings: ProfileSettings;
  createdAt?: any;
  updatedAt?: any;
}

export interface CreateProfileData {
  child: Partial<ChildInfo>;
  diagnosis: Partial<DiagnosisInfo>;
  caregivers?: Caregiver[];
  emergencyContacts?: EmergencyContact[];
  settings?: Partial<ProfileSettings>;
}

class ProfileService {
  private collectionName = 'profiles';

  // Get profile for a specific user
  async getUserProfile(userId: string): Promise<ProfileData | null> {
    try {
      const profileRef = doc(db, this.collectionName, userId);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        return {
          userId,
          ...profileDoc.data()
        } as ProfileData;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Create or update profile for a user
  async saveUserProfile(userId: string, profileData: CreateProfileData): Promise<void> {
    try {
      const profileRef = doc(db, this.collectionName, userId);
      
      // Get existing profile to merge with new data
      const existingProfile = await this.getUserProfile(userId);
      
      const updatedProfile: ProfileData = {
        userId,
        child: {
          ...existingProfile?.child,
          ...profileData.child
        } as ChildInfo,
        diagnosis: {
          ...existingProfile?.diagnosis,
          ...profileData.diagnosis
        } as DiagnosisInfo,
        caregivers: profileData.caregivers || existingProfile?.caregivers || [],
        emergencyContacts: profileData.emergencyContacts || existingProfile?.emergencyContacts || [],
        settings: {
          notifications: true,
          dataSharing: true,
          locationTracking: true,
          darkMode: false,
          autoBackup: true,
          ...existingProfile?.settings,
          ...profileData.settings
        } as ProfileSettings,
        createdAt: existingProfile?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Saving profile for user:', userId, updatedProfile);
      await setDoc(profileRef, updatedProfile, { merge: true });
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  // Update specific profile section
  async updateProfileSection(userId: string, section: keyof ProfileData, data: any): Promise<void> {
    try {
      const profileRef = doc(db, this.collectionName, userId);
      const updateData = {
        [section]: data,
        updatedAt: serverTimestamp()
      };

      console.log(`Updating ${section} for user:`, userId, updateData);
      await updateDoc(profileRef, updateData);
      console.log(`${section} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${section}:`, error);
      throw error;
    }
  }

  // Update child information
  async updateChildInfo(userId: string, childInfo: Partial<ChildInfo>): Promise<void> {
    try {
      const profileRef = doc(db, this.collectionName, userId);
      const updateData = {
        'child': childInfo,
        updatedAt: serverTimestamp()
      };

      console.log('Updating child info for user:', userId, updateData);
      await updateDoc(profileRef, updateData);
      console.log('Child info updated successfully');
    } catch (error) {
      console.error('Error updating child info:', error);
      throw error;
    }
  }

  // Update diagnosis information
  async updateDiagnosisInfo(userId: string, diagnosisInfo: Partial<DiagnosisInfo>): Promise<void> {
    try {
      const profileRef = doc(db, this.collectionName, userId);
      const updateData = {
        'diagnosis': diagnosisInfo,
        updatedAt: serverTimestamp()
      };

      console.log('Updating diagnosis info for user:', userId, updateData);
      await updateDoc(profileRef, updateData);
      console.log('Diagnosis info updated successfully');
    } catch (error) {
      console.error('Error updating diagnosis info:', error);
      throw error;
    }
  }

  // Add caregiver
  async addCaregiver(userId: string, caregiver: Omit<Caregiver, 'id'>): Promise<string> {
    try {
      const profileRef = doc(db, this.collectionName, userId);
      const caregiverId = Date.now().toString();
      const newCaregiver: Caregiver = {
        id: caregiverId,
        ...caregiver
      };

      const updateData = {
        caregivers: [...(await this.getUserProfile(userId))?.caregivers || [], newCaregiver],
        updatedAt: serverTimestamp()
      };

      console.log('Adding caregiver for user:', userId, newCaregiver);
      await updateDoc(profileRef, updateData);
      console.log('Caregiver added successfully');
      return caregiverId;
    } catch (error) {
      console.error('Error adding caregiver:', error);
      throw error;
    }
  }

  // Update caregiver
  async updateCaregiver(userId: string, caregiverId: string, caregiverData: Partial<Caregiver>): Promise<void> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) throw new Error('Profile not found');

      const updatedCaregivers = profile.caregivers.map(caregiver =>
        caregiver.id === caregiverId ? { ...caregiver, ...caregiverData } : caregiver
      );

      await this.updateProfileSection(userId, 'caregivers', updatedCaregivers);
      console.log('Caregiver updated successfully');
    } catch (error) {
      console.error('Error updating caregiver:', error);
      throw error;
    }
  }

  // Delete caregiver
  async deleteCaregiver(userId: string, caregiverId: string): Promise<void> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) throw new Error('Profile not found');

      const updatedCaregivers = profile.caregivers.filter(caregiver => caregiver.id !== caregiverId);
      await this.updateProfileSection(userId, 'caregivers', updatedCaregivers);
      console.log('Caregiver deleted successfully');
    } catch (error) {
      console.error('Error deleting caregiver:', error);
      throw error;
    }
  }

  // Add emergency contact
  async addEmergencyContact(userId: string, contact: Omit<EmergencyContact, 'id'>): Promise<string> {
    try {
      const profileRef = doc(db, this.collectionName, userId);
      const contactId = Date.now().toString();
      const newContact: EmergencyContact = {
        id: contactId,
        ...contact
      };

      const updateData = {
        emergencyContacts: [...(await this.getUserProfile(userId))?.emergencyContacts || [], newContact],
        updatedAt: serverTimestamp()
      };

      console.log('Adding emergency contact for user:', userId, newContact);
      await updateDoc(profileRef, updateData);
      console.log('Emergency contact added successfully');
      return contactId;
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      throw error;
    }
  }

  // Update emergency contact
  async updateEmergencyContact(userId: string, contactId: string, contactData: Partial<EmergencyContact>): Promise<void> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) throw new Error('Profile not found');

      const updatedContacts = profile.emergencyContacts.map(contact =>
        contact.id === contactId ? { ...contact, ...contactData } : contact
      );

      await this.updateProfileSection(userId, 'emergencyContacts', updatedContacts);
      console.log('Emergency contact updated successfully');
    } catch (error) {
      console.error('Error updating emergency contact:', error);
      throw error;
    }
  }

  // Delete emergency contact
  async deleteEmergencyContact(userId: string, contactId: string): Promise<void> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) throw new Error('Profile not found');

      const updatedContacts = profile.emergencyContacts.filter(contact => contact.id !== contactId);
      await this.updateProfileSection(userId, 'emergencyContacts', updatedContacts);
      console.log('Emergency contact deleted successfully');
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      throw error;
    }
  }

  // Update settings
  async updateSettings(userId: string, settings: Partial<ProfileSettings>): Promise<void> {
    try {
      await this.updateProfileSection(userId, 'settings', settings);
      console.log('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  // Listen to profile changes
  subscribeToProfile(userId: string, callback: (profile: ProfileData | null) => void) {
    const profileRef = doc(db, this.collectionName, userId);
    
    return onSnapshot(profileRef, (doc) => {
      if (doc.exists()) {
        const profile = {
          userId,
          ...doc.data()
        } as ProfileData;
        callback(profile);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error listening to profile:', error);
      callback(null);
    });
  }
}

export const profileService = new ProfileService(); 