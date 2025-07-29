import { View, Text, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseError } from 'firebase/app';

const Login: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getFirebaseErrorMessage = (error: FirebaseError) => {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials.';
      default:
        return 'An error occurred during login. Please try again.';
    }
  };

  const handleLogin = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email.trim(), password);
      console.log('Login successful');
      router.replace('/(tabs)');
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof FirebaseError) {
        Alert.alert('Login Failed', getFirebaseErrorMessage(error));
      } else {
        Alert.alert('Login Error', 'An unexpected error occurred. Please try again.');
      }
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
          className="w-full px-4 py-3 border border-gray-300 rounded-md"
          placeholder="Email"
          placeholderTextColor="#4B5563"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
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
        <Text className="text-gray-600">New User? </Text>
        <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
          <Text className="text-blue-500 font-semibold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;