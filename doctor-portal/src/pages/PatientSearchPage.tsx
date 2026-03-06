import React from 'react';
import { PatientSearch } from '../components/PatientSearch';
import { PageHeader } from '../components/Layout/PageHeader';

export const PatientSearchPage: React.FC = () => {
  return (
    <div>
      <PageHeader title="Search Patients" subtitle="Find and connect with patients" />
      <PatientSearch />
    </div>
  );
};