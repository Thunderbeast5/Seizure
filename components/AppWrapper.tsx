import React, { useState } from 'react';
import { View } from 'react-native';
import Landing from '../app/landing'; // Adjust path as needed

interface AppWrapperProps {
  children: React.ReactNode;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const [showLanding, setShowLanding] = useState(true);

  const handleLandingComplete = () => {
    setShowLanding(false);
  };

  if (showLanding) {
    return <Landing onGoNext={handleLandingComplete} />;
  }

  return <View style={{ flex: 1 }}>{children}</View>;
};

