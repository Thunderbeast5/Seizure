import { View, Text, TouchableOpacity, StatusBar, Linking } from "react-native";
import { router } from 'expo-router';

export default function SOSScreen() {
  const handleEmergencyCall = () => {
    // Replace with your local emergency number
    Linking.openURL('tel:911');
  };

  const handleGoHome = () => {
    router.push('/'); // Navigate to home screen
  };

  return (
    <>
      <StatusBar backgroundColor="#dc2626" barStyle="light-content" />
      <View className="flex-1 bg-red-600 px-6 py-8">
        
        {/* Top Navigation Arrow */}
        <View className="flex-row justify-start items-center pb-4">
          <TouchableOpacity 
            onPress={handleGoHome}
            className="bg-red-800 rounded-full w-14 h-14 items-center justify-center"
            activeOpacity={0.7}
          >
            <Text className="text-white text-3xl font-bold">←</Text>
          </TouchableOpacity>
        </View>
        
        {/* Emergency Header */}
        <View className="items-center mb-8">
          <Text className="text-5xl mb-4">🚨</Text>
          <Text className="text-4xl font-bold text-white text-center">
            EMERGENCY
          </Text>
          <Text className="text-xl text-red-100 text-center mt-2">
            Seizure Emergency Protocol
          </Text>
        </View>

        {/* Emergency Actions */}
        <View className="flex-1 justify-center space-y-6">
          
          {/* Call Emergency */}
          <TouchableOpacity 
            className="bg-white rounded-xl p-8 shadow-lg"
            onPress={handleEmergencyCall}
            activeOpacity={0.8}
          >
            <View className="items-center">
              <Text className="text-6xl mb-4">📞</Text>
              <Text className="text-2xl font-bold text-red-600 text-center">
                CALL EMERGENCY
              </Text>
              <Text className="text-lg text-gray-700 text-center mt-2">
                Call 911 (or your local emergency number)
              </Text>
            </View>
          </TouchableOpacity>

          {/* Quick Actions */}
          <View className="bg-white rounded-xl p-6 shadow-lg">
            <Text className="text-xl font-bold text-gray-800 text-center mb-4">
              Emergency Instructions
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-700">• Stay calm and time the seizure</Text>
              <Text className="text-gray-700">• Ensure person is safe from harm</Text>
              <Text className="text-gray-700">• Do not restrain or put anything in mouth</Text>
              <Text className="text-gray-700">• Turn person on their side after seizure</Text>
              <Text className="text-gray-700">• Call emergency if seizure lasts over 5 minutes</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
