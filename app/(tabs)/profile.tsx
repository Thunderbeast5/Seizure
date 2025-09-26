import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';

interface ProfileData {
  child: {
    name: string;
    username: string;
    age: number;
    birthDate: string;
    gender: string;
    weight: string;
    height: string;
    bloodType: string;
    seizureType: string;
    allergies: string;
    photo: string;
    email: string;
  };
  settings: {
    notifications: boolean;
    dataSharing: boolean;
    locationTracking: boolean;
    darkMode: boolean;
    autoBackup: boolean;
  };
}

export default function ProfileScreen() {
  // All hooks must be called at the top level
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activeSection, setActiveSection] = useState('child');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>({});
  const [imageError, setImageError] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Get auth context - this must be called at the top level
  const authContext = useAuth();
  const { user, userData, logout } = authContext || { user: null, userData: null, logout: () => Promise.resolve() };

  // Generate different avatar for each user using Robohash (working option)
  const generateUserAvatar = (userId: string, userName: string) => {
    // Use user ID as seed for consistent avatars
    return `https://robohash.org/${userName}.png?size=80x80&set=set1`;   
  };

  // Initialize default profile structure - using useCallback to fix lint warning
  const initializeDefaultProfile = React.useCallback((currentUserData: any) => {
    return {
      child: {
        name: currentUserData?.name || user?.displayName || '',
        username: currentUserData?.username || '',
        age: currentUserData?.age || 0,
        birthDate: '',
        gender: currentUserData?.gender || '',
        weight: '',
        height: '',
        bloodType: currentUserData?.bloodGroup || '',
        seizureType: currentUserData?.seizureType || '',
        allergies: '',
        email: currentUserData?.email || user?.email || '',
        photo: '' // We'll use the local image as fallback
      },
      settings: {
        notifications: true,
        dataSharing: true,
        locationTracking: true,
        darkMode: false,
        autoBackup: true
      }
    };
  }, [user]);

  // Convert UserData format to ProfileData format - using useCallback to avoid recreation
  const convertUserDataToProfile = React.useCallback((userData: any): ProfileData => {
    return {
      child: {
        name: userData?.name || '',
        username: userData?.username || '',
        age: userData?.age || 0,
        birthDate: userData?.birthDate || '',
        gender: userData?.gender || '',
        weight: userData?.weight || '',
        height: userData?.height || '',
        bloodType: userData?.bloodGroup || '',
        seizureType: userData?.seizureType || '',
        allergies: userData?.allergies || '',
        email: userData?.email || '',
        photo: userData?.photo || ''
      },
      settings: userData?.settings || {
        notifications: true,
        dataSharing: true,
        locationTracking: true,
        darkMode: false,
        autoBackup: true
      }
    };
  }, []);

  useEffect(() => {
    let unsubscribe: () => void;

    const setupProfileListener = async () => {
      // Handle case where auth context is not available
      if (!authContext) {
        setLoading(false);
        setError('Authentication not available');
        return;
      }
      
      if (!user) {
        setLoading(false);
        setError('No authenticated user found');
        return;
      }

      setError(null);

      try {
        let currentUserData = userData;
        if (!currentUserData) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              currentUserData = userDoc.data() as any;
            }
          } catch (userError) {
            console.log('Could not fetch userData:', userError);
          }
        }

        unsubscribe = onSnapshot(
          doc(db, 'profiles', user.uid),
          async (profileDoc) => {
            if (profileDoc.exists()) {
              const data = profileDoc.data();
              
              // Check if data has the expected ProfileData structure (with child property)
              if (data && data.child) {
                setProfile(data as ProfileData);
              } else {
                // Convert UserData format to ProfileData format
                const convertedProfile = convertUserDataToProfile(data);
                setProfile(convertedProfile);
                
                // Update the document to use the new structure
                try {
                  await setDoc(doc(db, 'profiles', user.uid), convertedProfile, { merge: true });
                } catch (updateError) {
                  console.error('Error updating profile structure:', updateError);
                }
              }
            } else {
              // Create default profile with user data
              const defaultProfile = initializeDefaultProfile(currentUserData);
              
              try {
                await setDoc(doc(db, 'profiles', user.uid), defaultProfile);
                setProfile(defaultProfile);
              } catch (createError) {
                console.error('Error creating default profile:', createError);
                setProfile(defaultProfile);
              }
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error listening to profile:', error);
            setError('Failed to load profile data');
            const defaultProfile = initializeDefaultProfile(currentUserData);
            setProfile(defaultProfile);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Error setting up profile listener:', error);
        setError('Failed to initialize profile');
        setLoading(false);
      }
    };

    setupProfileListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, userData, authContext, convertUserDataToProfile, initializeDefaultProfile]);

  const handleToggleSetting = async (setting: keyof ProfileData['settings']) => {
    if (!user || !profile) return;

    const updatedSettings = {
      ...profile.settings,
      [setting]: !profile.settings[setting]
    };

    const updatedProfile = {
      ...profile,
      settings: updatedSettings
    };

    try {
      await updateDoc(doc(db, 'profiles', user.uid), updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setEditingData({ ...profile?.child });
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    try {
      const updatedProfile = {
        ...profile,
        child: { ...editingData }
      };

      await updateDoc(doc(db, 'profiles', user.uid), updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderChildSection = () => {
    if (!profile) return null;

    // Generate unique avatar for this user
    const userAvatarUrl = generateUserAvatar(user?.uid || 'default', profile.child.name || 'User');

    return (
      <View className="mb-6">
        <View className="flex-row items-center mb-6">
          {/* Avatar with Local Default Image */}
          <View className="w-20 h-20 rounded-full mr-4 items-center justify-center bg-gray-200 shadow-md overflow-hidden">
            {profile.child.photo && !imageError ? (
              // If user has uploaded a custom photo, try to show it first
              <Image
                source={{ uri: profile.child.photo }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                }}
                onError={(error) => {
                  console.log('Image load error:', error);
                  setImageError(true);
                }}
                onLoad={() => {
                  setImageError(false);
                }}
              />
            ) : (
              // Default to generated avatar unique to each user
              <Image
                source={{ uri: userAvatarUrl }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                }}
                resizeMode="cover"
                onError={(error) => {
                  console.log('Generated avatar load error:', error);
                  // Fallback to a basic UI avatar if the generated one fails
                }}
                onLoadStart={() => console.log('Loading generated avatar...')}
                onLoad={() => console.log('Generated avatar loaded successfully')}
              />
            )}
          </View>
          
          <View className="flex-1">
            {isEditing ? (
              <TextInput
                className="text-2xl font-bold text-slate-800 mb-1 border-b border-gray-300 pb-1"
                value={editingData.name}
                onChangeText={(text) => setEditingData({...editingData, name: text})}
                placeholder="Full Name"
              />
            ) : (
              <Text className="text-2xl font-bold text-slate-800 mb-1">{profile.child.name || 'No name set'}</Text>
            )}
            <Text className="text-base text-slate-600">{profile.child.age} years old</Text>
            <Text className="text-base text-slate-600">{profile.child.gender || 'Gender not specified'}</Text>
            {profile.child.username && (
              <Text className="text-base text-blue-600">@{profile.child.username}</Text>
            )}
          </View>
        </View>
        
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row mb-4">
            <View className="flex-1">
              <Text className="text-sm text-slate-600 mb-1">Birth Date</Text>
              {isEditing ? (
                <TextInput
                  className="text-base text-slate-800 font-medium border-b border-gray-300 pb-1"
                  value={editingData.birthDate}
                  onChangeText={(text) => setEditingData({...editingData, birthDate: text})}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <Text className="text-base text-slate-800 font-medium">
                  {profile.child.birthDate || 'Not specified'}
                </Text>
              )}
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-sm text-slate-600 mb-1">Blood Type</Text>
              {isEditing ? (
                <TextInput
                  className="text-base text-slate-800 font-medium border-b border-gray-300 pb-1"
                  value={editingData.bloodType}
                  onChangeText={(text) => setEditingData({...editingData, bloodType: text})}
                  placeholder="O+"
                />
              ) : (
                <Text className="text-base text-slate-800 font-medium">
                  {profile.child.bloodType || 'Not specified'}
                </Text>
              )}
            </View>
          </View>
          
          <View className="flex-row mb-4">
            <View className="flex-1">
              <Text className="text-sm text-slate-600 mb-1">Weight</Text>
              {isEditing ? (
                <TextInput
                  className="text-base text-slate-800 font-medium border-b border-gray-300 pb-1"
                  value={editingData.weight}
                  onChangeText={(text) => setEditingData({...editingData, weight: text})}
                  placeholder="kg"
                />
              ) : (
                <Text className="text-base text-slate-800 font-medium">
                  {profile.child.weight || 'Not specified'}
                </Text>
              )}
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-sm text-slate-600 mb-1">Height</Text>
              {isEditing ? (
                <TextInput
                  className="text-base text-slate-800 font-medium border-b border-gray-300 pb-1"
                  value={editingData.height}
                  onChangeText={(text) => setEditingData({...editingData, height: text})}
                  placeholder="cm"
                />
              ) : (
                <Text className="text-base text-slate-800 font-medium">
                  {profile.child.height || 'Not specified'}
                </Text>
              )}
            </View>
          </View>
          
          <View className="flex-row mb-4">
            <View className="flex-1">
              <Text className="text-sm text-slate-600 mb-1">Seizure Type</Text>
              {isEditing ? (
                <TextInput
                  className="text-base text-slate-800 font-medium border-b border-gray-300 pb-1"
                  value={editingData.seizureType}
                  onChangeText={(text) => setEditingData({...editingData, seizureType: text})}
                  placeholder="e.g., Focal Seizures"
                />
              ) : (
                <Text className="text-base text-slate-800 font-medium">
                  {profile.child.seizureType || 'Not specified'}
                </Text>
              )}
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-sm text-slate-600 mb-1">Username</Text>
              {isEditing ? (
                <TextInput
                  className="text-base text-slate-800 font-medium border-b border-gray-300 pb-1"
                  value={editingData.username}
                  onChangeText={(text) => setEditingData({...editingData, username: text})}
                  placeholder="username"
                />
              ) : (
                <Text className="text-base text-slate-800 font-medium">
                  {profile.child.username || 'Not specified'}
                </Text>
              )}
            </View>
          </View>
          
          <View className="flex-row">
            <View className="flex-1">
              <Text className="text-sm text-slate-600 mb-1">Allergies</Text>
              {isEditing ? (
                <TextInput
                  className="text-base text-slate-800 font-medium border-b border-gray-300 pb-1"
                  value={editingData.allergies}
                  onChangeText={(text) => setEditingData({...editingData, allergies: text})}
                  placeholder="None known"
                  multiline
                />
              ) : (
                <Text className="text-base text-slate-800 font-medium">
                  {profile.child.allergies || 'None specified'}
                </Text>
              )}
            </View>
          </View>
        </View>
        
        {isEditing ? (
          <View className="flex-row space-x-3">
            <TouchableOpacity 
              className="flex-1 bg-green-500 rounded-lg p-4 items-center mr-2"
              onPress={handleSaveProfile}
            >
              <Text className="text-white text-base font-medium">Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-gray-500 rounded-lg p-4 items-center ml-2"
              onPress={() => setIsEditing(false)}
            >
              <Text className="text-white text-base font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            className="bg-blue-500 rounded-lg p-4 flex-row items-center justify-center"
            onPress={handleEditProfile}
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <Text className="text-white text-base font-medium ml-2">Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  const renderSettingsSection = () => {
    if (!profile) return null;

    return (
      <View className="mb-6">
        {/* Privacy & Data Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-slate-800 mb-4">Privacy & Data</Text>
          
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-1">
              <Text className="text-base font-medium text-slate-800 mb-1">Notifications</Text>
              <Text className="text-sm text-slate-600">Receive app notifications</Text>
            </View>
            <Switch
              value={profile.settings.notifications}
              onValueChange={() => handleToggleSetting('notifications')}
              trackColor={{ false: '#E0E0E0', true: '#BDE3FF' }}
              thumbColor={profile.settings.notifications ? '#3B82F6' : '#F4F3F4'}
            />
          </View>
          
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-1">
              <Text className="text-base font-medium text-slate-800 mb-1">Data Sharing</Text>
              <Text className="text-sm text-slate-600">Share anonymized data for research</Text>
            </View>
            <Switch
              value={profile.settings.dataSharing}
              onValueChange={() => handleToggleSetting('dataSharing')}
              trackColor={{ false: '#E0E0E0', true: '#BDE3FF' }}
              thumbColor={profile.settings.dataSharing ? '#3B82F6' : '#F4F3F4'}
            />
          </View>
          
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-1">
              <Text className="text-base font-medium text-slate-800 mb-1">Location Tracking</Text>
              <Text className="text-sm text-slate-600">Allow location-based features</Text>
            </View>
            <Switch
              value={profile.settings.locationTracking}
              onValueChange={() => handleToggleSetting('locationTracking')}
              trackColor={{ false: '#E0E0E0', true: '#BDE3FF' }}
              thumbColor={profile.settings.locationTracking ? '#3B82F6' : '#F4F3F4'}
            />
          </View>
          
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-1">
              <Text className="text-base font-medium text-slate-800 mb-1">Dark Mode</Text>
              <Text className="text-sm text-slate-600">Use dark theme for the app</Text>
            </View>
            <Switch
              value={profile.settings.darkMode}
              onValueChange={() => handleToggleSetting('darkMode')}
              trackColor={{ false: '#E0E0E0', true: '#BDE3FF' }}
              thumbColor={profile.settings.darkMode ? '#3B82F6' : '#F4F3F4'}
            />
          </View>
          
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-1">
              <Text className="text-base font-medium text-slate-800 mb-1">Auto Backup</Text>
              <Text className="text-sm text-slate-600">Automatically backup your data</Text>
            </View>
            <Switch
              value={profile.settings.autoBackup}
              onValueChange={() => handleToggleSetting('autoBackup')}
              trackColor={{ false: '#E0E0E0', true: '#BDE3FF' }}
              thumbColor={profile.settings.autoBackup ? '#3B82F6' : '#F4F3F4'}
            />
          </View>
        </View>
        
        {/* Account Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-slate-800 mb-4">Account</Text>
          
          <View className="mb-3">
            <Text className="text-sm text-slate-600 mb-1">Email</Text>
            <Text className="text-base text-slate-800 font-medium">
              {profile.child.email || userData?.email || user?.email || 'No email'}
            </Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-sm text-slate-600 mb-1">Username</Text>
            <Text className="text-base text-slate-800 font-medium">
              {profile.child.username || userData?.username || 'No username'}
            </Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-sm text-slate-600 mb-1">Member Since</Text>
            <Text className="text-base text-slate-800 font-medium">
              {userData?.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          className="bg-red-500 rounded-lg p-4 flex-row items-center justify-center mt-2"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text className="text-white text-base font-medium ml-2">Log Out</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView 
        style={{ 
          flex: 1, 
          backgroundColor: '#E6F3F8',
          paddingTop: Platform.OS === 'android' ? 0 : undefined 
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#E6F3F8" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={{ marginTop: 16, color: '#64748B', fontSize: 16 }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView 
        style={{ 
          flex: 1, 
          backgroundColor: '#E6F3F8',
          paddingTop: Platform.OS === 'android' ? 0 : undefined 
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#E6F3F8" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={{ marginTop: 16, color: '#1E293B', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
            Profile Loading Error
          </Text>
          <Text style={{ marginTop: 8, color: '#64748B', textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity 
            style={{
              marginTop: 24,
              backgroundColor: '#4A90E2',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text style={{ color: 'white', fontWeight: '500' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show message if no user but not loading
  if (!user) {
    return (
      <SafeAreaView 
        style={{ 
          flex: 1, 
          backgroundColor: '#E6F3F8',
          paddingTop: Platform.OS === 'android' ? 0 : undefined 
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#E6F3F8" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <Ionicons name="person-circle" size={64} color="#9CA3AF" />
          <Text style={{ marginTop: 16, color: '#1E293B', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
            Please Sign In
          </Text>
          <Text style={{ marginTop: 8, color: '#64748B', textAlign: 'center' }}>
            You need to be signed in to view your profile
          </Text>
          <TouchableOpacity 
            style={{
              marginTop: 24,
              backgroundColor: '#4A90E2',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
            onPress={() => router.push('/login')}
          >
            <Text style={{ color: 'white', fontWeight: '500' }}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView 
      style={{ 
        flex: 1, 
        backgroundColor: '#E6F3F8',
        paddingTop: Platform.OS === 'android' ? 0 : undefined 
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#E6F3F8" />
      {/* Header */}
      <View 
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: Platform.OS === 'android' ? Math.max(insets.top + 20, 40) : 32,
          marginBottom: Platform.OS === 'android' ? 15 : 10,
          paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
          justifyContent: 'space-between',
          backgroundColor: Platform.OS === 'android' ? 'transparent' : undefined,
          width: '100%',
        }}
      >
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)')}
          style={{
            padding: Platform.OS === 'android' ? 12 : 0,
            minWidth: Platform.OS === 'android' ? 48 : 32,
            minHeight: Platform.OS === 'android' ? 48 : 32,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Platform.OS === 'android' ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
            borderRadius: Platform.OS === 'android' ? 8 : 0,
          }}
        >
          <Ionicons name="arrow-back" size={Platform.OS === 'android' ? 28 : 32} color="#4A90E2" />
        </TouchableOpacity>
        
        {/* Title */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text 
            style={{
              fontSize: Platform.OS === 'android' ? 26 : 30,
              fontWeight: 'bold',
              color: '#1E293B',
              textAlign: 'center',
            }}
          >
            Profile
          </Text>
        </View>
        
        {/* Spacer */}
        <View style={{ width: Platform.OS === 'android' ? 48 : 32 }} />
      </View>

      <View className="bg-blue-50">
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          <TouchableOpacity 
            className={`py-4 px-5 flex-row items-center border-b-2 ${
              activeSection === 'child' ? 'border-blue-500' : 'border-transparent'
            }`}
            onPress={() => setActiveSection('child')}
          >
            <Ionicons 
              name="person" 
              size={20} 
              color={activeSection === 'child' ? '#3B82F6' : '#64748B'} 
            />
            <Text className={`text-base font-medium ml-2 ${
              activeSection === 'child' ? 'text-blue-500 font-bold' : 'text-slate-500'
            }`}>
              Profile
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`py-4 px-5 flex-row items-center border-b-2 ${
              activeSection === 'settings' ? 'border-blue-500' : 'border-transparent'
            }`}
            onPress={() => setActiveSection('settings')}
          >
            <Ionicons 
              name="settings" 
              size={20} 
              color={activeSection === 'settings' ? '#3B82F6' : '#64748B'} 
            />
            <Text className={`text-base font-medium ml-2 ${
              activeSection === 'settings' ? 'text-blue-500 font-bold' : 'text-slate-500'
            }`}>
              Settings
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView className="flex-1 p-4">
        {activeSection === 'child' && renderChildSection()}
        {activeSection === 'settings' && renderSettingsSection()}
      </ScrollView>
     
    </SafeAreaView>
  );
}