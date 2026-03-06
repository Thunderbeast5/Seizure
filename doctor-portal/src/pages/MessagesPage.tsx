import React from 'react';
import { ChatList } from '../components/ChatList';
import { PageHeader } from '../components/Layout/PageHeader';

export const MessagesPage: React.FC = () => {
  return (
    <div>
      <PageHeader title="Messages" subtitle="Patient conversations and communications" />
      <ChatList />
    </div>
  );
};