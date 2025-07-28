import React from 'react';
import { View } from 'react-native';

interface AppWrapperProps {
  children: React.ReactNode;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  // Simply return the children without any landing logic
  // Let the router handle the navigation flow
  return <View style={{ flex: 1 }}>{children}</View>;
};