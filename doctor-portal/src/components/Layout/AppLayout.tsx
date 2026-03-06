import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { NotificationPanel } from './NotificationPanel';

export const AppLayout: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNotificationClick = useCallback(() => {
    setShowNotifications((prev) => !prev);
    if (!showNotifications) setUnreadCount(0);
  }, [showNotifications]);

  const incrementUnread = useCallback(() => {
    setUnreadCount((c) => c + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar
        unreadCount={unreadCount}
        onNotificationClick={handleNotificationClick}
      />

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet context={{ incrementUnread }} />
      </main>

      <Footer />
    </div>
  );
};