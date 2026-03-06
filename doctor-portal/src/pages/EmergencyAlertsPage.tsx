import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EmergencyAlerts } from '../components/EmergencyAlerts';
import { PageHeader } from '../components/Layout/PageHeader';
import { LoadingPage } from '../components/Layout/LoadingPage';

export const EmergencyAlertsPage: React.FC = () => {
  const { user } = useAuth();

  if (!user?.uid) return <LoadingPage />;

  return (
    <div>
      <PageHeader title="Emergency Alerts" subtitle="Real-time patient emergency monitoring" />
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl">
        <EmergencyAlerts doctorId={user.uid} />
      </div>
    </div>
  );
};