import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform, Animated, ActivityIndicator } from 'react-native';
import React, { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseError } from 'firebase/app';

// Validation types and interfaces
interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  username?: string;
  age?: string;
  gender?: string;
  bloodGroup?: string;
  seizureType?: string;
  password?: string;
  confirmPassword?: string;
}

interface FormValidationRules {
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
    pattern?: RegExp;
  };
  email: {
    required: boolean;
    pattern: RegExp;
  };
  username: {
    required: boolean;
    minLength: number;
    maxLength: number;
    pattern: RegExp;
  };
  age: {
    required: boolean;
    min: number;
    max: number;
  };
  password: {
    required: boolean;
    minLength: number;
    pattern: RegExp;
  };
}

const SignUp: React.FC = () => {
  const router = useRouter();
  const { register, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [seizureType, setSeizureType] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form validation state
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
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

  // Comprehensive validation rules
  const validationRules: FormValidationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s.'-]+$/
    },
    email: {
      required: true,
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    username: {
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_-]+$/
    },
    age: {
      required: true,
      min: 1,
      max: 120
    },
    password: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    }
  };

  // Validation functions
  const validateName = (value: string): ValidationResult => {
    const trimmed = value.trim();
    
    if (!trimmed) {
      return { isValid: false, error: 'Name is required' };
    }
    
    if (trimmed.length < validationRules.name.minLength) {
      return { isValid: false, error: `Name must be at least ${validationRules.name.minLength} characters long` };
    }
    
    if (trimmed.length > validationRules.name.maxLength) {
      return { isValid: false, error: `Name must be no more than ${validationRules.name.maxLength} characters long` };
    }
    
    if (!validationRules.name.pattern?.test(trimmed)) {
      return { isValid: false, error: 'Name can only contain letters, spaces, dots, hyphens, and apostrophes' };
    }
    
    return { isValid: true };
  };

  const validateEmail = (value: string): ValidationResult => {
    const trimmed = value.trim().toLowerCase();
    
    if (!trimmed) {
      return { isValid: false, error: 'Email is required' };
    }
    
    if (!validationRules.email.pattern.test(trimmed)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    return { isValid: true };
  };

  const validateUsername = (value: string): ValidationResult => {
    const trimmed = value.trim();
    
    if (!trimmed) {
      return { isValid: false, error: 'Username is required' };
    }
    
    if (trimmed.length < validationRules.username.minLength) {
      return { isValid: false, error: `Username must be at least ${validationRules.username.minLength} characters long` };
    }
    
    if (trimmed.length > validationRules.username.maxLength) {
      return { isValid: false, error: `Username must be no more than ${validationRules.username.maxLength} characters long` };
    }
    
    if (!validationRules.username.pattern.test(trimmed)) {
      return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
    }
    
    return { isValid: true };
  };

  const validateAge = (value: string): ValidationResult => {
    const trimmed = value.trim();
    
    if (!trimmed) {
      return { isValid: false, error: 'Age is required' };
    }
    
    const ageNum = parseInt(trimmed);
    
    if (isNaN(ageNum)) {
      return { isValid: false, error: 'Age must be a valid number' };
    }
    
    if (ageNum < validationRules.age.min) {
      return { isValid: false, error: `Age must be at least ${validationRules.age.min}` };
    }
    
    if (ageNum > validationRules.age.max) {
      return { isValid: false, error: `Age must be no more than ${validationRules.age.max}` };
    }
    
    return { isValid: true };
  };

  const validatePassword = (value: string): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'Password is required' };
    }
    
    if (value.length < validationRules.password.minLength) {
      return { isValid: false, error: `Password must be at least ${validationRules.password.minLength} characters long` };
    }
    
    if (!validationRules.password.pattern.test(value)) {
      return { 
        isValid: false, 
        error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)' 
      };
    }
    
    return { isValid: true };
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
    if (!confirmPassword) {
      return { isValid: false, error: 'Please confirm your password' };
    }
    
    if (password !== confirmPassword) {
      return { isValid: false, error: 'Passwords do not match' };
    }
    
    return { isValid: true };
  };

  const validateDropdownField = (value: string, fieldName: string): ValidationResult => {
    if (!value) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    
    return { isValid: true };
  };

  // Real-time field validation
  const validateField = (field: keyof FormErrors, value: string, additionalValue?: string): void => {
    let result: ValidationResult;
    
    switch (field) {
      case 'name':
        result = validateName(value);
        break;
      case 'email':
        result = validateEmail(value);
        break;
      case 'username':
        result = validateUsername(value);
        break;
      case 'age':
        result = validateAge(value);
        break;
      case 'password':
        result = validatePassword(value);
        break;
      case 'confirmPassword':
        result = validateConfirmPassword(additionalValue || password, value);
        break;
      case 'gender':
        result = validateDropdownField(value, 'Gender');
        break;
      case 'bloodGroup':
        result = validateDropdownField(value, 'Blood Group');
        break;
      case 'seizureType':
        result = validateDropdownField(value, 'Seizure Type');
        break;
      default:
        return;
    }
    
    setFormErrors(prev => ({
      ...prev,
      [field]: result.isValid ? undefined : result.error
    }));
  };

  // Validate all fields
  const validateAllFields = (): boolean => {
    const errors: FormErrors = {};
    
    const nameResult = validateName(name);
    if (!nameResult.isValid) errors.name = nameResult.error;
    
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) errors.email = emailResult.error;
    
    const usernameResult = validateUsername(username);
    if (!usernameResult.isValid) errors.username = usernameResult.error;
    
    const ageResult = validateAge(age);
    if (!ageResult.isValid) errors.age = ageResult.error;
    
    const passwordResult = validatePassword(password);
    if (!passwordResult.isValid) errors.password = passwordResult.error;
    
    const confirmPasswordResult = validateConfirmPassword(password, confirmPassword);
    if (!confirmPasswordResult.isValid) errors.confirmPassword = confirmPasswordResult.error;
    
    const genderResult = validateDropdownField(gender, 'Gender');
    if (!genderResult.isValid) errors.gender = genderResult.error;
    
    const bloodGroupResult = validateDropdownField(bloodGroup, 'Blood Group');
    if (!bloodGroupResult.isValid) errors.bloodGroup = bloodGroupResult.error;
    
    const seizureTypeResult = validateDropdownField(seizureType, 'Seizure Type');
    if (!seizureTypeResult.isValid) errors.seizureType = seizureTypeResult.error;
    
    setFormErrors(errors);
    
    return Object.keys(errors).length === 0;
  };

  const getFirebaseErrorMessage = (error: FirebaseError) => {
    console.log('Firebase error code:', error.code);
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        console.log('Unknown error:', error.message);
        return `Registration error: ${error.message}`;
    }
  };

  const animateDropdown = (animation: Animated.Value, toValue: number) => {
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const toggleDropdown = (type: 'gender' | 'bloodGroup' | 'seizureType') => {
    if (isLoading) return;
    
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
        validateField('gender', value);
        break;
      case 'bloodGroup':
        setBloodGroup(value);
        setBloodGroupDropdownVisible(false);
        animateDropdown(bloodGroupAnimation, 0);
        validateField('bloodGroup', value);
        break;
      case 'seizureType':
        setSeizureType(value);
        setSeizureTypeDropdownVisible(false);
        animateDropdown(seizureTypeAnimation, 0);
        validateField('seizureType', value);
        break;
    }
  };

  const handleSignUp = async () => {
    console.log('Starting registration validation...');
    
    // Comprehensive validation
    const isFormValid = validateAllFields();
    
    if (!isFormValid) {
      
      // Find the first error to show
      const firstError = Object.entries(formErrors).find(([_, error]) => error);
      if (firstError) {
        Alert.alert('Validation Error', firstError[1]);
      }
      return;
    }
    
    console.log('All validation passed, proceeding with registration...');
    
    setIsLoading(true);
    
    try {
      console.log('Starting registration process...');
      
      // Convert age to number here
      const ageNum = parseInt(age.trim());
      
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim(),
        age: ageNum,
        gender,
        bloodGroup,
        seizureType,
        password
      });
      
      console.log('Registration completed successfully');
      
      Alert.alert(
        'Success',
        'Account created successfully! You are now logged in.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Small delay to ensure auth state is updated
              setTimeout(() => {
                router.replace('/(tabs)');
              }, 500);
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof FirebaseError) {
        Alert.alert('Registration Failed', getFirebaseErrorMessage(error));
      } else if (error instanceof Error) {
        Alert.alert('Registration Error', error.message);
      } else {
        Alert.alert('Registration Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    if (!isLoading && !authLoading) {
      router.replace('/login');
    }
  };

  // Error text component
  const ErrorText = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <Text className="text-red-500 text-xs mb-2 ml-1">{error}</Text>
    );
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
        <View className="bg-white rounded-b-md border-l border-r border-b border-gray-300 shadow-lg">
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
                disabled={isLoading}
              >
                <Text className="text-base text-gray-800">{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>
    );
  };

  // Show loading if auth is still initializing
  if (authLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text className="mt-4 text-gray-600">Initializing...</Text>
      </View>
    );
  }

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
          
          <View className="w-full mb-4">
            <TextInput
              className={`w-full px-4 py-3 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Full Name"
              placeholderTextColor="#4B5563"
              value={name}
              onChangeText={(text) => {
                setName(text);
                validateField('name', text);
              }}
              onBlur={() => validateField('name', name)}
              autoCapitalize="words"
              editable={!isLoading}
            />
            <ErrorText error={formErrors.name} />
          </View>

          <View className="w-full mb-4">
            <TextInput
              className={`w-full px-4 py-3 border rounded-md ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Email"
              placeholderTextColor="#4B5563"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                validateField('email', text);
              }}
              onBlur={() => validateField('email', email)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />
            <ErrorText error={formErrors.email} />
          </View>

          <View className="w-full mb-4">
            <TextInput
              className={`w-full px-4 py-3 border rounded-md ${formErrors.username ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Username"
              placeholderTextColor="#4B5563"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                validateField('username', text);
              }}
              onBlur={() => validateField('username', username)}
              autoCapitalize="none"
              autoComplete="username"
              editable={!isLoading}
            />
            <ErrorText error={formErrors.username} />
          </View>

          <View className="w-full mb-4">
            <TextInput
              className={`w-full px-4 py-3 border rounded-md ${formErrors.age ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Age"
              placeholderTextColor="#4B5563"
              value={age}
              onChangeText={(text) => {
                setAge(text);
                validateField('age', text);
              }}
              onBlur={() => validateField('age', age)}
              keyboardType="numeric"
              maxLength={3}
              editable={!isLoading}
            />
            <ErrorText error={formErrors.age} />
          </View>

          {/* Gender Dropdown */}
          <View className="w-full mb-4 relative z-30">
            <TouchableOpacity
              className={`w-full px-4 py-3 border ${formErrors.gender ? 'border-red-500' : 'border-gray-300'} ${genderDropdownVisible ? 'rounded-t-md' : 'rounded-md'} justify-center bg-white ${isLoading ? 'opacity-50' : ''}`}
              onPress={() => toggleDropdown('gender')}
              activeOpacity={0.7}
              disabled={isLoading}
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
            <ErrorText error={formErrors.gender} />
          </View>

          {/* Blood Group Dropdown */}
          <View className="w-full mb-4 relative z-20">
            <TouchableOpacity
              className={`w-full px-4 py-3 border ${formErrors.bloodGroup ? 'border-red-500' : 'border-gray-300'} ${bloodGroupDropdownVisible ? 'rounded-t-md' : 'rounded-md'} justify-center bg-white ${isLoading ? 'opacity-50' : ''}`}
              onPress={() => toggleDropdown('bloodGroup')}
              activeOpacity={0.7}
              disabled={isLoading}
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
            <ErrorText error={formErrors.bloodGroup} />
          </View>

          {/* Seizure Type Dropdown */}
          <View className="w-full mb-4 relative z-10">
            <TouchableOpacity
              className={`w-full px-4 py-3 border ${formErrors.seizureType ? 'border-red-500' : 'border-gray-300'} ${seizureTypeDropdownVisible ? 'rounded-t-md' : 'rounded-md'} justify-center bg-white ${isLoading ? 'opacity-50' : ''}`}
              onPress={() => toggleDropdown('seizureType')}
              activeOpacity={0.7}
              disabled={isLoading}
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
            <ErrorText error={formErrors.seizureType} />
          </View>
          
          <View className="w-full mb-4">
            <TextInput
              className={`w-full px-4 py-3 border rounded-md ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Password"
              placeholderTextColor="#4B5563"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                validateField('password', text);
              }}
              onBlur={() => validateField('password', password)}
              secureTextEntry
              autoComplete="new-password"
              editable={!isLoading}
            />
            <ErrorText error={formErrors.password} />
          </View>

          <View className="w-full mb-6">
            <TextInput
              className={`w-full px-4 py-3 border rounded-md ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Confirm Password"
              placeholderTextColor="#4B5563"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                validateField('confirmPassword', text, password);
              }}
              onBlur={() => validateField('confirmPassword', confirmPassword, password)}
              secureTextEntry
              autoComplete="new-password"
              editable={!isLoading}
            />
            <ErrorText error={formErrors.confirmPassword} />
          </View>

          <TouchableOpacity 
            className="w-full px-10 py-4 rounded-full shadow-lg active:opacity-80"
            style={{ 
              backgroundColor: isLoading ? '#9CA3AF' : '#4A90E2',
              opacity: isLoading ? 0.7 : 1 
            }}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator color="white" size="small" className="mr-2" />
                <Text className="text-white text-lg font-semibold">
                  Creating Account...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-lg font-semibold text-center">
                Sign Up
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row mt-8">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={handleGoToLogin} disabled={isLoading || authLoading}>
              <Text className="text-blue-500 font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;