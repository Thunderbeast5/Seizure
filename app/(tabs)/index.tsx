import { View, Text, TouchableOpacity, StatusBar, Alert, ScrollView, SafeAreaView, Platform, Animated, Dimensions, Modal } from "react-native";
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { BlurView } from 'expo-blur';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnimation = useRef(new Animated.Value(-screenWidth * 0.8)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // --- Handler for the menu button ---
  const handleMenuPress = () => {
    console.log('Menu button pressed!');
    setIsDrawerOpen(true);
    
    // Animate drawer slide in
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    // Animate drawer slide out
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: -screenWidth * 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsDrawerOpen(false);
    });
  };

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

  const DrawerMenu = () => (
    <Modal
      visible={isDrawerOpen}
      transparent={true}
      animationType="none"
      onRequestClose={closeDrawer}
    >
      {/* Blurred Background Overlay */}
      <Animated.View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: overlayOpacity,
        }}
      >
        <BlurView
          intensity={30}
          tint="dark"
          style={{
            flex: 1,
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={closeDrawer}
            activeOpacity={1}
          />
        </BlurView>
      </Animated.View>

      {/* Drawer Content */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: screenWidth * 0.9,
          transform: [{ translateX: slideAnimation }],
        }}
      >
        <BlurView
          intensity={80}
          tint="light"
          style={{
            flex: 1,
            paddingTop: Platform.OS === 'ios' ? 50 : 30,
            paddingHorizontal: 20,
            borderWidth: 0,
          }}
        >
          {/* Drawer Header */}
          <View className="flex-row items-center justify-between mb-8 pb-4  ">
            <Text className="text-2xl font-bold text-slate-800">Menu</Text>
            <TouchableOpacity onPress={closeDrawer} className="p-2">
              <Ionicons name="close" size={28} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity 
              className="flex-row items-center py-4 px-2 mb-2 rounded-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
              onPress={() => {
                closeDrawer();
                handleSeizureDiary();
              }}
            >
              <Ionicons name="calendar" size={24} color="#4A90E2" />
              <Text className="text-lg font-semibold text-slate-800 ml-4">
                Seizure Diary
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center py-4 px-2 mb-2 rounded-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
              onPress={() => {
                closeDrawer();
                handleMedicationReminder();
              }}
            >
              <Ionicons name="medical" size={24} color="#4A90E2" />
              <Text className="text-lg font-semibold text-slate-800 ml-4">
                Medication Reminder
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center py-4 px-2 mb-2 rounded-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
              onPress={() => {
                closeDrawer();
                handleDoctorConnect();
              }}
            >
              <Ionicons name="people" size={24} color="#4A90E2" />
              <Text className="text-lg font-semibold text-slate-800 ml-4">
                Doctor Connect
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center py-4 px-2 mb-2 rounded-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
              onPress={() => {
                closeDrawer();
                handleEducation();
              }}
            >
              <Ionicons name="book" size={24} color="#4A90E2" />
              <Text className="text-lg font-semibold text-slate-800 ml-4">
                Education
              </Text>
            </TouchableOpacity>

            {/* Additional Menu Items */}
            <TouchableOpacity 
              className="flex-row items-center py-4 px-2 mb-2 rounded-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
              onPress={() => {
                closeDrawer();
                Alert.alert('Settings', 'Settings screen coming soon!');
              }}
            >
              <Ionicons name="settings" size={24} color="#4A90E2" />
              <Text className="text-lg font-semibold text-slate-800 ml-4">
                Settings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center py-4 px-2 mb-2 rounded-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
              onPress={() => {
                closeDrawer();
                Alert.alert('Help', 'Help & Support coming soon!');
              }}
            >
              <Ionicons name="help-circle" size={24} color="#4A90E2" />
              <Text className="text-lg font-semibold text-slate-800 ml-4">
                Help & Support
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center py-4 px-2 mb-2 rounded-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
              onPress={() => {
                closeDrawer();
                Alert.alert('About', 'About Seizure Tracker coming soon!');
              }}
            >
              <Ionicons name="information-circle" size={24} color="#4A90E2" />
              <Text className="text-lg font-semibold text-slate-800 ml-4">
                About
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-row items-center py-4 px-2 mb-2 rounded-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
              onPress={() => {
                closeDrawer();
                Alert.alert('Logout', 'Logout coming soon!');
              }}
            >
              <Ionicons name="log-out-outline" size={28} color="red" />
              <Text className="text-lg font-semibold text-slate-800 ml-4">
                Logout
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </BlurView>
      </Animated.View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <StatusBar barStyle="dark-content" backgroundColor="#E6F3F8" />
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ flexGrow: 1 }}>
        {/* --- Updated Header --- */}
        <View 
          className={`flex-row items-center mt-8 mb-10 px-5 ${
            Platform.OS === 'android' ? 'justify-start' : 'justify-between'
          }`}
        >
          {/* Menu Icon (Left) */}
          <TouchableOpacity 
            onPress={handleMenuPress} 
            className={Platform.OS === 'android' ? 'mr-4' : ''}
          >
            <Ionicons name="menu" size={32} color="#4A90E2" />
          </TouchableOpacity>
          
          {/* Title and Subtitle (Center for iOS, Left for Android) */}
          <View className={Platform.OS === 'ios' ? 'items-center' : ''}>
            <Text className="text-3xl font-bold text-slate-800 text-center">
              Seizure Tracker
            </Text>
            <Text className="text-lg text-slate-500 text-center leading-6">
              Pediatric Seizure Monitoring
            </Text>
          </View>

          {/* Spacer View for iOS to keep title centered */}
          {Platform.OS === 'ios' && <View style={{ width: 32 }} />}
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

      {/* Drawer Component */}
      <DrawerMenu />
    </SafeAreaView>
  );
}