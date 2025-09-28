import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { notificationService } from '../services/notificationService';

interface AppWrapperProps {
  children: React.ReactNode;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  // Initialize notifications on app start
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await notificationService.requestPermissions();
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  // Wrap with SafeAreaProvider for proper Android safe area handling
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaProvider>
  );
};