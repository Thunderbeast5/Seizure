import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function ReportsScreen() {
  const handleGoHome = () => {
    router.push('/'); // Navigate to home screen
  };

  return (
    <View className="flex-1 bg-white">
      {/* Top Navigation Arrow - Fixed to be circular */}
      <View className="flex-row justify-start items-center pt-12 px-4 pb-4">
        <TouchableOpacity 
          onPress={handleGoHome}
          className="bg-blue-100 rounded-full w-14 h-14 items-center justify-center"
          activeOpacity={0.7}
        >
          <Text className="text-blue-600 text-3xl font-bold">←</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-gray-800">
          Reports Screen
        </Text>
        <Text className="text-gray-600 mt-2 text-center">
          Seizure reports and analytics will be displayed here
        </Text>
      </View>
    </View>
  );
}
