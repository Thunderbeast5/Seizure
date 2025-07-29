import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import React, { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

const SignUp: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [seizureType, setSeizureType] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Dropdown states
  const [genderDropdownVisible, setGenderDropdownVisible] = useState(false);
  const [bloodGroupDropdownVisible, setBloodGroupDropdownVisible] = useState(false);
  const [seizureTypeDropdownVisible, setSeizureTypeDropdownVisible] = useState(false);
  
  // Animation values
  const genderAnimation = useRef(new Animated.Value(0)).current;
  const bloodGroupAnimation = useRef(new Animated.Value(0)).current;
  const seizureTypeAnimation = useRef(new Animated.Value(0)).current;
  
  // Dropdown options
  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const seizureTypeOptions = [
    'Focal Seizures',
    'Generalized Tonic-Clonic',
    'Absence Seizures',
    'Myoclonic Seizures',
    'Atonic Seizures',
    'Tonic Seizures',
    'Clonic Seizures',
    'Unknown',
    'Multiple Types',
    'No History of Seizures'
  ];

  const animateDropdown = (animation: Animated.Value, toValue: number) => {
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const toggleDropdown = (type: 'gender' | 'bloodGroup' | 'seizureType') => {
    // Close all other dropdowns first
    if (type !== 'gender') {
      setGenderDropdownVisible(false);
      animateDropdown(genderAnimation, 0);
    }
    if (type !== 'bloodGroup') {
      setBloodGroupDropdownVisible(false);
      animateDropdown(bloodGroupAnimation, 0);
    }
    if (type !== 'seizureType') {
      setSeizureTypeDropdownVisible(false);
      animateDropdown(seizureTypeAnimation, 0);
    }

    // Toggle the selected dropdown
    switch (type) {
      case 'gender':
        const newGenderState = !genderDropdownVisible;
        setGenderDropdownVisible(newGenderState);
        animateDropdown(genderAnimation, newGenderState ? 1 : 0);
        break;
      case 'bloodGroup':
        const newBloodGroupState = !bloodGroupDropdownVisible;
        setBloodGroupDropdownVisible(newBloodGroupState);
        animateDropdown(bloodGroupAnimation, newBloodGroupState ? 1 : 0);
        break;
      case 'seizureType':
        const newSeizureTypeState = !seizureTypeDropdownVisible;
        setSeizureTypeDropdownVisible(newSeizureTypeState);
        animateDropdown(seizureTypeAnimation, newSeizureTypeState ? 1 : 0);
        break;
    }
  };

  const selectOption = (type: 'gender' | 'bloodGroup' | 'seizureType', value: string) => {
    switch (type) {
      case 'gender':
        setGender(value);
        setGenderDropdownVisible(false);
        animateDropdown(genderAnimation, 0);
        break;
      case 'bloodGroup':
        setBloodGroup(value);
        setBloodGroupDropdownVisible(false);
        animateDropdown(bloodGroupAnimation, 0);
        break;
      case 'seizureType':
        setSeizureType(value);
        setSeizureTypeDropdownVisible(false);
        animateDropdown(seizureTypeAnimation, 0);
        break;
    }
  };

  const handleSignUp = () => {
    // Basic validation
    if (!name.trim() || !email.trim() || !username.trim() || !age.trim() || !gender || !bloodGroup || !seizureType || !password || !confirmPassword) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    // Age validation
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      Alert.alert('Validation Error', 'Please enter a valid age (1-120).');
      return;
    }

    // Username validation
    if (username.trim().length < 3) {
      Alert.alert('Validation Error', 'Username must be at least 3 characters long.');
      return;
    }

    // Password validation
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }
    
    console.log('Sign Up button pressed with:', { 
      name: name.trim(), 
      email: email.trim(), 
      username: username.trim(), 
      age: ageNum, 
      gender, 
      bloodGroup, 
      seizureType, 
      password: '***' 
    });
    
    // Add your user creation logic here (e.g., API call)
    
    // For now, we'll just show an alert and navigate to the login page
    Alert.alert(
      'Success',
      'Account created successfully! Please log in.',
      [
        { text: 'OK', onPress: () => router.replace('/login') }
      ]
    );
  };

  const handleGoToLogin = () => {
    router.replace('/login'); 
  };

  const DropdownMenu = ({ 
    visible, 
    animation, 
    options, 
    onSelect, 
    type 
  }: {
    visible: boolean;
    animation: Animated.Value;
    options: string[];
    onSelect: (value: string) => void;
    type: 'gender' | 'bloodGroup' | 'seizureType';
  }) => {
    if (!visible) return null;

    const maxHeight = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, Math.min(options.length * 50, 200)],
    });

    const opacity = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View 
        style={{ 
          maxHeight, 
          opacity,
          overflow: 'hidden',
        }}
        className="absolute top-full left-0 right-0 z-50 rounded-b-md"
      >
        <BlurView intensity={80} tint="light" className="rounded-b-md overflow-hidden">
          <View className="bg-white bg-opacity-90 rounded-b-md border-l border-r border-b border-gray-300">
            <ScrollView 
              className="max-h-48"
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  className="px-4 py-3 border-b border-gray-100 active:bg-blue-50"
                  onPress={() => onSelect(option)}
                  activeOpacity={0.7}
                >
                  <Text className="text-base text-gray-800">{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </BlurView>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <View className="flex-1 justify-center items-center bg-white p-5">
          <Text className="text-3xl font-bold mb-2.5 text-center">
            Create Account
          </Text>
          <Text className="text-base text-gray-600 mb-10 text-center">
            Get started by creating a new account
          </Text>
          
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-md mb-4"
            placeholder="Full Name"
            placeholderTextColor="#4B5563"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-md mb-4"
            placeholder="Email"
            placeholderTextColor="#4B5563"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-md mb-4"
            placeholder="Username"
            placeholderTextColor="#4B5563"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoComplete="username"
          />

          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-md mb-4"
            placeholder="Age"
            placeholderTextColor="#4B5563"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            maxLength={3}
          />

          {/* Gender Dropdown */}
          <View className="w-full mb-4 relative z-30">
            <TouchableOpacity
              className={`w-full px-4 py-3 border border-gray-300 ${genderDropdownVisible ? 'rounded-t-md' : 'rounded-md'} justify-center bg-white`}
              onPress={() => toggleDropdown('gender')}
              activeOpacity={0.7}
            >
              <View className="flex-row justify-between items-center">
                <Text className={gender ? "text-black" : "text-gray-500"}>
                  {gender || "Select Gender"}
                </Text>
              </View>
            </TouchableOpacity>
            <DropdownMenu
              visible={genderDropdownVisible}
              animation={genderAnimation}
              options={genderOptions}
              onSelect={(value) => selectOption('gender', value)}
              type="gender"
            />
          </View>

          {/* Blood Group Dropdown */}
          <View className="w-full mb-4 relative z-20">
            <TouchableOpacity
              className={`w-full px-4 py-3 border border-gray-300 ${bloodGroupDropdownVisible ? 'rounded-t-md' : 'rounded-md'} justify-center bg-white`}
              onPress={() => toggleDropdown('bloodGroup')}
              activeOpacity={0.7}
            >
              <View className="flex-row justify-between items-center">
                <Text className={bloodGroup ? "text-black" : "text-gray-500"}>
                  {bloodGroup || "Select Blood Group"}
                </Text>
              </View>
            </TouchableOpacity>
            <DropdownMenu
              visible={bloodGroupDropdownVisible}
              animation={bloodGroupAnimation}
              options={bloodGroupOptions}
              onSelect={(value) => selectOption('bloodGroup', value)}
              type="bloodGroup"
            />
          </View>

          {/* Seizure Type Dropdown */}
          <View className="w-full mb-4 relative z-10">
            <TouchableOpacity
              className={`w-full px-4 py-3 border border-gray-300 ${seizureTypeDropdownVisible ? 'rounded-t-md' : 'rounded-md'} justify-center bg-white`}
              onPress={() => toggleDropdown('seizureType')}
              activeOpacity={0.7}
            >
              <View className="flex-row justify-between items-center">
                <Text className={seizureType ? "text-black" : "text-gray-500"}>
                  {seizureType || "Select Seizure Type"}
                </Text>
              </View>
            </TouchableOpacity>
            <DropdownMenu
              visible={seizureTypeDropdownVisible}
              animation={seizureTypeAnimation}
              options={seizureTypeOptions}
              onSelect={(value) => selectOption('seizureType', value)}
              type="seizureType"
            />
          </View>
          
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-md mb-4"
            placeholder="Password"
            placeholderTextColor="#4B5563"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
          />

          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-md mb-6"
            placeholder="Confirm Password"
            placeholderTextColor="#4B5563"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="new-password"
          />

          <TouchableOpacity 
            className="w-full px-10 py-4 rounded-full shadow-lg active:opacity-80"
            style={{ backgroundColor: '#4A90E2' }}
            onPress={handleSignUp}
          >
            <Text className="text-white text-lg font-semibold text-center">
              Sign Up
            </Text>
          </TouchableOpacity>

          <View className="flex-row mt-8">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={handleGoToLogin}>
              <Text className="text-blue-500 font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;