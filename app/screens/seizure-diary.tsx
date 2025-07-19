import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { router } from "expo-router";

export default function SeizureDiaryScreen() {
  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <>
      <StatusBar hidden={true} />
      <View className="flex-1 bg-blue-50 px-6 py-8">
         <View className="flex-row justify-start items-center pt-4 pb-4">
          <TouchableOpacity 
            onPress={handleGoHome}
            className="bg-blue-100 rounded-full w-14 h-14 items-center justify-center"
            activeOpacity={0.7}
          >
            <Text className="text-blue-600 text-3xl font-bold">←</Text>
          </TouchableOpacity>
        </View>
        
        {/* Header */}
        <View className="items-center mb-8 mt-4">
          <Text className="text-3xl font-bold text-blue-800 tracking-wide">
            Seizure Diary
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1 justify-center">
          <View className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
            <Text className="text-xl font-semibold text-gray-800 text-center mb-4">
              📝 Record Your Seizures
            </Text>
            <Text className="text-gray-600 text-center">
              Track seizure events, symptoms, triggers, and recovery details to help manage your condition better.
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}
