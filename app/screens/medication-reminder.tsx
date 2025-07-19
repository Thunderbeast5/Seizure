import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { router } from "expo-router";

export default function MedicationReminderScreen() {
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
            Medication Reminder
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1 justify-center">
          <View className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
            <Text className="text-xl font-semibold text-gray-800 text-center mb-4">
              💊 Manage Your Medications
            </Text>
            <Text className="text-gray-600 text-center">
              Set reminders for your seizure medications, track dosages, and maintain your medication schedule.
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}
