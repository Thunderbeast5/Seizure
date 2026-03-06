import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { PatientManagement } from '../components/PatientManagement';
import { PageHeader } from '../components/Layout/PageHeader';

export const PatientPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();

  if (!patientId) {
    return <Navigate to="/patients" replace />;
  }

  return (
    <div>
      <PageHeader title="Patient Management" subtitle="View and manage patient records" />
      <PatientManagement patientId={patientId} />
    </div>
  );
};