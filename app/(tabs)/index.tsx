import { View, Text, TouchableOpacity, StatusBar, Alert, ScrollView, SafeAreaView } from "react-native";
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
    <SafeAreaView className="flex-1 bg-blue-50">
      <StatusBar barStyle="dark-content" backgroundColor="#E6F3F8" />
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="items-center mt-8 mb-10 px-5">
          <Text className="text-3xl font-bold text-slate-800 mb-2 text-center">
            Seizure Tracker
          </Text>
          <Text className="text-lg text-slate-500 text-center leading-6">
            Pediatric Seizure Monitoring
          </Text>
        </View>

        {/* Feature Buttons Grid */}
        <View className="flex-row flex-wrap justify-between mt-8 pb-10">
          <TouchableOpacity 
            className="bg-white w-[48%] p-7 rounded-2xl mb-6 items-center shadow-lg"
            style={{ minHeight: 220 }}
            onPress={handleSeizureDiary}
          >
            <View className="mb-4 p-2">
              <Ionicons name="calendar" size={60} color="#4A90E2" />
            </View>
            <Text className="text-xl font-bold text-slate-800 mb-2 text-center">
              Seizure Diary
            </Text>
            <Text className="text-base text-slate-500 text-center leading-5">
              Log and track seizures
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-white w-[48%] p-7 rounded-2xl mb-6 items-center shadow-lg"
            style={{ minHeight: 220 }}
            onPress={handleMedicationReminder}
          >
            <View className="mb-4 p-2">
              <Ionicons name="medical" size={60} color="#4A90E2" />
            </View>
            <Text className="text-xl font-bold text-slate-800 mb-2 text-center">
              Medication Reminder
            </Text>
            <Text className="text-base text-slate-500 text-center leading-5">
              Track and set reminders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-white w-[48%] p-6 rounded-2xl mb-6 items-center shadow-lg"
            style={{ minHeight: 220 }}
            onPress={handleDoctorConnect}
          >
            <View className="mb-4 p-2">
              <Ionicons name="people" size={60} color="#4A90E2" />
            </View>
            <Text className="text-xl font-bold text-slate-800 mb-2 text-center">
              Doctor Connect
            </Text>
            <Text className="text-base text-slate-500 text-center leading-5">
              Share data with doctors
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-white w-[48%] p-6 rounded-2xl mb-6 items-center shadow-lg"
            style={{ minHeight: 220 }}
            onPress={handleEducation}
          >
            <View className="mb-4 p-2">
              <Ionicons name="book" size={60} color="#4A90E2" />
            </View>
            <Text className="text-xl font-bold text-slate-800 mb-2 text-center">
              Education
            </Text>
            <Text className="text-base text-slate-500 text-center leading-5">
              Articles and tips
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}