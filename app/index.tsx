import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

interface LandingProps {
  onGoNext?: () => void;
}

const Landing: React.FC<LandingProps> = ({ onGoNext }) => {
  const router = useRouter();

  const handleGoNext = () => {
    console.log('Landing Go Next button pressed');
    
    // If onGoNext prop is provided (from AppWrapper), call it
    // Otherwise use router navigation
    if (onGoNext) {
      onGoNext();
    } else {
      router.push('/login');
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-5">
      <Text className="text-3xl font-bold mb-2.5 text-center">
        Welcome to Your App
      </Text>
      <Text className="text-base text-gray-600 mb-10 text-center">
        Ready to get started?
      </Text>
      
      <TouchableOpacity 
        className="px-10 py-4 rounded-full shadow-lg active:opacity-80"
        style={{ backgroundColor: '#4A90E2' }}
        onPress={handleGoNext}
      >
        <Text className="text-white text-lg font-semibold">
          Go Next
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Landing;