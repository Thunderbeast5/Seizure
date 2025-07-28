import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';

const Login: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Basic validation
    if (!username || !password) {
      Alert.alert('Validation Error', 'Please enter both username and password.');
      return;
    }
    
    console.log('Login button pressed with:', { username, password });
    
    // Here you would typically handle the authentication logic
    // For now, we'll just navigate to the main app on successful "login"
    try {
      router.replace('/(tabs)');
      console.log('Navigation to tabs attempted');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to the main app.');
    }
  };

  const handleSignUp = () => {
    // Navigate to the sign-up page
    // Make sure you have a '(auth)/signup.tsx' file or similar
    router.push('/signup'); 
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-5">
      <Text className="text-3xl font-bold mb-2.5 text-center">
        Welcome Back!
      </Text>
      <Text className="text-base text-gray-600 mb-10 text-center">
        Sign in to your account
      </Text>
      
      <TextInput
        className="w-full px-4 py-3 border border-gray-300 rounded-md mb-4"
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
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
        onPress={handleLogin}
      >
        <Text className="text-white text-lg font-semibold text-center">
          Login
        </Text>
      </TouchableOpacity>

      <View className="flex-row mt-8">
        <Text className="text-gray-600">Have an account? </Text>
        <TouchableOpacity onPress={handleSignUp}>
          <Text className="text-blue-500 font-semibold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;