import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { medicationService, Medication, CreateMedicationData } from '../services/medicationService';

export const useMedications = () => {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMedications = useCallback(async () => {
    if (!user?.uid) {
      setMedications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userMedications = await medicationService.getUserMedications(user.uid);
      setMedications(userMedications);
    } catch (error) {
      console.error('Error loading medications:', error);
      Alert.alert('Error', 'Failed to load medications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const refreshMedications = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setRefreshing(true);
      const userMedications = await medicationService.getUserMedications(user.uid);
      setMedications(userMedications);
    } catch (error) {
      console.error('Error refreshing medications:', error);
      Alert.alert('Error', 'Failed to refresh medications. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [user?.uid]);

  const addMedication = useCallback(async (medicationData: CreateMedicationData) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      const medicationId = await medicationService.addMedication(user.uid, medicationData);
      await loadMedications(); // Reload to get the updated list
      return medicationId;
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  }, [user?.uid, loadMedications]);

  const updateMedication = useCallback(async (medicationId: string, updates: Partial<Medication>) => {
    try {
      await medicationService.updateMedication(medicationId, updates);
      await loadMedications(); // Reload to get the updated list
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  }, [loadMedications]);

  const deleteMedication = useCallback(async (medicationId: string) => {
    try {
      await medicationService.deleteMedication(medicationId);
      await loadMedications(); // Reload to get the updated list
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  }, [loadMedications]);

  const toggleMedicationStatus = useCallback(async (medicationId: string, currentActive: boolean) => {
    try {
      await medicationService.toggleMedicationStatus(medicationId, !currentActive);
      
      // Update local state immediately for better UX
      setMedications(prev => 
        prev.map(med => 
          med.id === medicationId ? { ...med, active: !currentActive } : med
        )
      );
    } catch (error) {
      console.error('Error toggling medication status:', error);
      throw error;
    }
  }, []);

  // Load medications when user changes
  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  return {
    medications,
    loading,
    refreshing,
    loadMedications,
    refreshMedications,
    addMedication,
    updateMedication,
    deleteMedication,
    toggleMedicationStatus,
  };
}; 