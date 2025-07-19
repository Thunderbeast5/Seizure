import { View, Text, TouchableOpacity, StatusBar, Alert } from "react-native";
import { router } from 'expo-router';

export default function HomeScreen() {
  const handleSeizureDiary = () => {
    console.log('Attempting to navigate to seizure diary...');
    try {
      router.navigate('/screens/seizure-diary');
      console.log('Navigation to seizure diary attempted');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to seizure diary');
    }
  };

  const handleMedicationReminder = () => {
    console.log('Attempting to navigate to medication reminder...');
    try {
      router.navigate('/screens/medication-reminder');
      console.log('Navigation to medication reminder attempted');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to medication reminder');
    }
  };

  const handleDoctorConnect = () => {
    console.log('Attempting to navigate to doctor connect...');
    try {
      router.navigate('/screens/doctor-connect');
      console.log('Navigation to doctor connect attempted');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to doctor connect');
    }
  };

  const handleEducation = () => {
    console.log('Attempting to navigate to education...');
    try {
      router.navigate('/screens/education');
      console.log('Navigation to education attempted');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to education');
    }
  };

  return (
    <>
      <StatusBar hidden={true} />
      <View className="flex-1 bg-blue-50 px-6 py-8">
        
        {/* App Title */}
        <View className="items-center mb-12 mt-4">
          <Text className="text-3xl font-bold text-blue-800 tracking-wide">
            Seizure Tracker
          </Text>
        </View>

        {/* Main Action Buttons Grid */}
        <View className="flex-1 justify-center">
          
          {/* First Row */}
          <View className="flex-row justify-between mb-6">
            <TouchableOpacity 
              className="bg-white rounded-xl p-6 flex-1 mr-3 shadow-lg border border-blue-100"
              onPress={handleSeizureDiary}
              activeOpacity={0.7}
            >
              <View className="items-center">
                <Text className="text-4xl mb-3">📝</Text>
                <Text className="text-lg font-semibold text-gray-800 text-center">
                  Seizure Diary
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-xl p-6 flex-1 ml-3 shadow-lg border border-blue-100"
              onPress={handleMedicationReminder}
              activeOpacity={0.7}
            >
              <View className="items-center">
                <Text className="text-4xl mb-3">💊</Text>
                <Text className="text-lg font-semibold text-gray-800 text-center">
                  Medication Reminder
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Second Row */}
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="bg-white rounded-xl p-6 flex-1 mr-3 shadow-lg border border-blue-100"
              onPress={handleDoctorConnect}
              activeOpacity={0.7}
            >
              <View className="items-center">
                <Text className="text-4xl mb-3">👨‍⚕️</Text>
                <Text className="text-lg font-semibold text-gray-800 text-center">
                  Doctor Connect
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-xl p-6 flex-1 ml-3 shadow-lg border border-blue-100"
              onPress={handleEducation}
              activeOpacity={0.7}
            >
              <View className="items-center">
                <Text className="text-4xl mb-3">📚</Text>
                <Text className="text-lg font-semibold text-gray-800 text-center">
                  Education
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Contact Info */}
        {/* <View className="mt-8 mb-4">
          <Text className="text-center text-gray-600 text-sm">
            For medical emergencies, call your local emergency number
          </Text>
        </View> */}
      </View>
    </>
  );
}