import { View, Text, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';

const Login: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Basic validation
    if (!username.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both username and password.');
      return;
    }

    // Additional validation
    if (username.trim().length < 3) {
      Alert.alert('Validation Error', 'Username must be at least 3 characters long.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Login attempt with:', { username: username.trim(), password: '***' });
      
      // Simulate API call - replace with your actual authentication logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically:
      // 1. Make API call to your authentication endpoint
      // 2. Store authentication token
      // 3. Update user context/state
      
      // For demo purposes, let's simulate success
      const isSuccess = true; // Replace with actual authentication result
      
      if (isSuccess) {
        console.log('Login successful');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', 'Invalid username or password. Please try again.');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Error', 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/signup'); 
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-5">
      <Text className="text-3xl font-bold mb-2.5 text-center">
        Welcome Back!
      </Text>
      <Text className="text-base text-gray-600 mb-10 text-center">
        Sign in to your account
      </Text>
      
      <View className="w-full mb-4">
        <TextInput
          className="w-full px-4 py-3 border border-gray-300 rounded-md "
          placeholder="Username or Email"
          placeholderTextColor="#4B5563"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          editable={!isLoading}
        />
      </View>
      
      <View className="w-full mb-6 relative">
        <TextInput
          className="w-full px-4 py-3 border border-gray-300 rounded-md pr-12"
          placeholder="Password"
          placeholderTextColor="#4B5563"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoComplete="password"
          editable={!isLoading}
        />
        <TouchableOpacity 
          className="absolute right-3 top-3"
          onPress={togglePasswordVisibility}
          disabled={isLoading}
        >
          <Text className="text-gray-500 text-sm">
            {showPassword ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        className="w-full px-10 py-4 rounded-full shadow-lg active:opacity-80"
        style={{ 
          backgroundColor: isLoading ? '#9CA3AF' : '#4A90E2',
          opacity: isLoading ? 0.7 : 1 
        }}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <View className="flex-row justify-center items-center">
            <ActivityIndicator color="white" size="small" className="mr-2" />
            <Text className="text-white text-lg font-semibold">
              Signing In...
            </Text>
          </View>
        ) : (
          <Text className="text-white text-lg font-semibold text-center">
            Login
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity className="mt-4">
        <Text className="text-blue-500 font-semibold">
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <View className="flex-row mt-6">
        <Text className="text-gray-600">New User?</Text>
        <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
          <Text className="text-blue-500 font-semibold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;