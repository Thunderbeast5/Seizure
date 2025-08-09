import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { seizureService, Seizure, CreateSeizureData } from '../services/seizureService';

export const useSeizures = () => {
  const { user } = useAuth();
  const [seizures, setSeizures] = useState<Seizure[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSeizures = useCallback(async () => {
    if (!user?.uid) {
      setSeizures([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userSeizures = await seizureService.getUserSeizures(user.uid);
      setSeizures(userSeizures);
    } catch (error) {
      console.error('Error loading seizures:', error);
      Alert.alert('Error', 'Failed to load seizures. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const refreshSeizures = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setRefreshing(true);
      const userSeizures = await seizureService.getUserSeizures(user.uid);
      setSeizures(userSeizures);
    } catch (error) {
      console.error('Error refreshing seizures:', error);
      Alert.alert('Error', 'Failed to refresh seizures. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [user?.uid]);

  const addSeizure = useCallback(async (seizureData: CreateSeizureData) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      const seizureId = await seizureService.addSeizure(user.uid, seizureData);
      await loadSeizures(); // Reload to get the updated list
      return seizureId;
    } catch (error) {
      console.error('Error adding seizure:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user?.uid, loadSeizures]);

  const updateSeizure = useCallback(async (seizureId: string, updates: Partial<Seizure>) => {
    try {
      await seizureService.updateSeizure(seizureId, updates);
      await loadSeizures(); // Reload to get the updated list
    } catch (error) {
      console.error('Error updating seizure:', error);
      throw error;
    }
  }, [loadSeizures]);

  const deleteSeizure = useCallback(async (seizureId: string) => {
    try {
      await seizureService.deleteSeizure(seizureId);
      await loadSeizures(); // Reload to get the updated list
    } catch (error) {
      console.error('Error deleting seizure:', error);
      throw error;
    }
  }, [loadSeizures]);

  const getSeizureStats = useCallback(async () => {
    if (!user?.uid) {
      return {
        totalSeizures: 0,
        seizuresThisMonth: 0,
        mostCommonType: 'None',
        averageDuration: '0'
      };
    }

    try {
      return await seizureService.getSeizureStats(user.uid);
    } catch (error) {
      console.error('Error getting seizure stats:', error);
      throw error;
    }
  }, [user?.uid]);

  // Load seizures when user changes
  useEffect(() => {
    loadSeizures();
  }, [loadSeizures]);

  return {
    seizures,
    loading,
    refreshing,
    saving,
    loadSeizures,
    refreshSeizures,
    addSeizure,
    updateSeizure,
    deleteSeizure,
    getSeizureStats,
  };
}; 