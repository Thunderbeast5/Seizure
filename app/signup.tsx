import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';

const SignUp: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    // Basic validation
    if (!username || !email || !password) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Alert.alert('Validation Error', 'Please enter a valid email address.');
        return;
    }
    
    console.log('Sign Up button pressed with:', { username, email, password });
    
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

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
    >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View className="flex-1 justify-center items-center bg-white p-5">
                <Text className="text-3xl font-bold mb-2.5 text-center">
                    Create Account
                </Text>
                <Text className="text-base text-gray-600 mb-10 text-center">
                    Get started by creating a new account
                </Text>
                
                <TextInput
                    className="w-full px-4 py-3 border border-gray-300 rounded-md mb-4"
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                <TextInput
                    className="w-full px-4 py-3 border border-gray-300 rounded-md mb-4"
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                
                <TextInput
                    className="w-full px-4 py-3 border border-gray-300 rounded-md mb-6"
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
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