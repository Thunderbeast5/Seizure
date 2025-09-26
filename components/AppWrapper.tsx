import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface AppWrapperProps {
  children: React.ReactNode;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  // Wrap with SafeAreaProvider for proper Android safe area handling
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaProvider>
  );
};