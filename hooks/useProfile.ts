import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { 
  profileService, 
  ProfileData, 
  ChildInfo, 
  DiagnosisInfo, 
  Caregiver, 
  EmergencyContact, 
  ProfileSettings,
  CreateProfileData 
} from '../services/profileService';

export const useProfile = () => {
  const { user, userData } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialize default profile structure
  const initializeDefaultProfile = useCallback((): ProfileData => {
    return {
      userId: user?.uid || '',
      child: {
        name: userData?.name || '',
        age: userData?.age || 0,
        birthDate: '',
        gender: userData?.gender || '',
        weight: '',
        height: '',
        bloodType: userData?.bloodGroup || '',
        allergies: '',
        photo: `https://api.dicebear.com/7.x/initials/svg?seed=${userData?.name || 'User'}`
      },
      diagnosis: {
        type: userData?.seizureType || '',
        diagnosisDate: '',
        diagnosedBy: '',
        notes: ''
      },
      caregivers: [],
      emergencyContacts: [],
      settings: {
        notifications: true,
        dataSharing: true,
        locationTracking: true,
        darkMode: false,
        autoBackup: true
      }
    };
  }, [user?.uid, userData]);

  const loadProfile = useCallback(async () => {
    if (!user?.uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userProfile = await profileService.getUserProfile(user.uid);
      
      if (userProfile) {
        setProfile(userProfile);
      } else {
        // Create default profile if none exists
        const defaultProfile = initializeDefaultProfile();
        await profileService.saveUserProfile(user.uid, defaultProfile);
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
      // Fallback to default profile
      const defaultProfile = initializeDefaultProfile();
      setProfile(defaultProfile);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, initializeDefaultProfile]);

  const updateChildInfo = useCallback(async (childInfo: Partial<ChildInfo>) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      await profileService.updateChildInfo(user.uid, childInfo);
      
      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        child: { ...prev.child, ...childInfo }
      } : null);
      
      Alert.alert('Success', 'Child information updated successfully!');
    } catch (error) {
      console.error('Error updating child info:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user?.uid]);

  const updateDiagnosisInfo = useCallback(async (diagnosisInfo: Partial<DiagnosisInfo>) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      await profileService.updateDiagnosisInfo(user.uid, diagnosisInfo);
      
      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        diagnosis: { ...prev.diagnosis, ...diagnosisInfo }
      } : null);
      
      Alert.alert('Success', 'Diagnosis information updated successfully!');
    } catch (error) {
      console.error('Error updating diagnosis info:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user?.uid]);

  const addCaregiver = useCallback(async (caregiver: Omit<Caregiver, 'id'>) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      const caregiverId = await profileService.addCaregiver(user.uid, caregiver);
      
      // Update local state
      const newCaregiver: Caregiver = { id: caregiverId, ...caregiver };
      setProfile(prev => prev ? {
        ...prev,
        caregivers: [...prev.caregivers, newCaregiver]
      } : null);
      
      Alert.alert('Success', 'Caregiver added successfully!');
      return caregiverId;
    } catch (error) {
      console.error('Error adding caregiver:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user?.uid]);

  const updateCaregiver = useCallback(async (caregiverId: string, caregiverData: Partial<Caregiver>) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      await profileService.updateCaregiver(user.uid, caregiverId, caregiverData);
      
      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        caregivers: prev.caregivers.map(caregiver =>
          caregiver.id === caregiverId ? { ...caregiver, ...caregiverData } : caregiver
        )
      } : null);
      
      Alert.alert('Success', 'Caregiver updated successfully!');
    } catch (error) {
      console.error('Error updating caregiver:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user?.uid]);

  const deleteCaregiver = useCallback(async (caregiverId: string) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      await profileService.deleteCaregiver(user.uid, caregiverId);
      
      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        caregivers: prev.caregivers.filter(caregiver => caregiver.id !== caregiverId)
      } : null);
      
      Alert.alert('Success', 'Caregiver deleted successfully!');
    } catch (error) {
      console.error('Error deleting caregiver:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user?.uid]);

  const addEmergencyContact = useCallback(async (contact: Omit<EmergencyContact, 'id'>) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      const contactId = await profileService.addEmergencyContact(user.uid, contact);
      
      // Update local state
      const newContact: EmergencyContact = { id: contactId, ...contact };
      setProfile(prev => prev ? {
        ...prev,
        emergencyContacts: [...prev.emergencyContacts, newContact]
      } : null);
      
      Alert.alert('Success', 'Emergency contact added successfully!');
      return contactId;
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user?.uid]);

  const updateEmergencyContact = useCallback(async (contactId: string, contactData: Partial<EmergencyContact>) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      await profileService.updateEmergencyContact(user.uid, contactId, contactData);
      
      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        emergencyContacts: prev.emergencyContacts.map(contact =>
          contact.id === contactId ? { ...contact, ...contactData } : contact
        )
      } : null);
      
      Alert.alert('Success', 'Emergency contact updated successfully!');
    } catch (error) {
      console.error('Error updating emergency contact:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user?.uid]);

  const deleteEmergencyContact = useCallback(async (contactId: string) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      await profileService.deleteEmergencyContact(user.uid, contactId);
      
      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        emergencyContacts: prev.emergencyContacts.filter(contact => contact.id !== contactId)
      } : null);
      
      Alert.alert('Success', 'Emergency contact deleted successfully!');
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user?.uid]);

  const updateSettings = useCallback(async (settings: Partial<ProfileSettings>) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      await profileService.updateSettings(user.uid, settings);
      
      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        settings: { ...prev.settings, ...settings }
      } : null);
      
      Alert.alert('Success', 'Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user?.uid]);

  // Subscribe to profile changes
  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    console.log('Setting up profile listener for user:', user.uid);
    
    const unsubscribe = profileService.subscribeToProfile(user.uid, (profileData) => {
      console.log('Profile data updated:', profileData);
      if (profileData) {
        setProfile(profileData);
      } else {
        // Create default profile if none exists
        const defaultProfile = initializeDefaultProfile();
        setProfile(defaultProfile);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, initializeDefaultProfile]);

  return {
    profile,
    loading,
    saving,
    loadProfile,
    updateChildInfo,
    updateDiagnosisInfo,
    addCaregiver,
    updateCaregiver,
    deleteCaregiver,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    updateSettings,
  };
}; 