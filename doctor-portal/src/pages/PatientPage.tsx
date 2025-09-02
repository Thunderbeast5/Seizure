import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { PatientManagement } from '../components/PatientManagement';

export const PatientPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();

  if (!patientId) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <PatientManagement patientId={patientId} />
      </div>
    </div>
  );
};
