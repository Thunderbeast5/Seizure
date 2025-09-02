import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { realtimeService, SeizureData, MedicationData, ProfileData } from '../services/realtimeService';

interface RealtimeDataContextType {
  seizures: SeizureData[];
  medications: MedicationData[];
  profile: ProfileData | null;
  connectionRequests: any[];
  loading: boolean;
}

const RealtimeDataContext = createContext<RealtimeDataContextType | null>(null);

export const useRealtimeData = () => {
  const context = useContext(RealtimeDataContext);
  if (!context) {
    throw new Error('useRealtimeData must be used within a RealtimeDataProvider');
  }
  return context;
};

export const RealtimeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [seizures, setSeizures] = useState<SeizureData[]>([]);
  const [medications, setMedications] = useState<MedicationData[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [connectionRequests, setConnectionRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setSeizures([]);
      setMedications([]);
      setProfile(null);
      setConnectionRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Set up real-time listeners
    const unsubscribeSeizures = realtimeService.subscribeToSeizures(user.uid, (seizures) => {
      setSeizures(seizures);
      setLoading(false);
    });

    const unsubscribeMedications = realtimeService.subscribeToMedications(user.uid, (medications) => {
      setMedications(medications);
    });

    const unsubscribeProfile = realtimeService.subscribeToProfile(user.uid, (profile) => {
      setProfile(profile);
    });

    const unsubscribeRequests = realtimeService.subscribeToConnectionRequests(user.uid, (requests) => {
      setConnectionRequests(requests);
    });

    // Cleanup function
    return () => {
      unsubscribeSeizures();
      unsubscribeMedications();
      unsubscribeProfile();
      unsubscribeRequests();
    };
  }, [user?.uid]);

  const value: RealtimeDataContextType = {
    seizures,
    medications,
    profile,
    connectionRequests,
    loading
  };

  return (
    <RealtimeDataContext.Provider value={value}>
      {children}
    </RealtimeDataContext.Provider>
  );
};
