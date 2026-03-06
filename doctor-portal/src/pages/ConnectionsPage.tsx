import React from 'react';
import { ConnectionRequests } from '../components/ConnectionRequests';
import { PageHeader } from '../components/Layout/PageHeader';

export const ConnectionsPage: React.FC = () => {
  return (
    <div>
      <PageHeader title="Connection Requests" subtitle="Manage patient connection requests" />
      <ConnectionRequests />
    </div>
  );
};