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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const { user, userData, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activeSection, setActiveSection] = useState('child');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>({});

  // Get color based on first letter
  const getAvatarColor = (name: string) => {
    const firstLetter = name.charAt(0).toUpperCase();
    const colors = [
      'bg-red-500',    // A-C
      'bg-blue-500',   // D-F  
      'bg-green-500',  // G-I
      'bg-purple-500', // J-L
      'bg-pink-500',   // M-O
      'bg-indigo-500', // P-R
      'bg-yellow-500', // S-U
      'bg-teal-500',   // V-X
      'bg-orange-500', // Y-Z
    ];
    const index = Math.floor((firstLetter.charCodeAt(0) - 65) / 3) % colors.length;
    return colors[index];
  };

  // Initialize default profile structure
  const initializeDefaultProfile = (currentUserData: any) => ({
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
      photo: `https://picsum.photos/80/80?random=1`
    },
    settings: {
      notifications: true,
      dataSharing: true,
      locationTracking: true,
      darkMode: false,
      autoBackup: true
    }
  });

  useEffect(() => {
    let unsubscribe: () => void;

    const setupProfileListener = async () => {
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
              const data = profileDoc.data() as ProfileData;
              setProfile(data);
            } else {
              // Create default profile with user data
              const defaultProfile = {
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
                  photo: `https://picsum.photos/80/80?random=1`
                },
                settings: {
                  notifications: true,
                  dataSharing: true,
                  locationTracking: true,
                  darkMode: false,
                  autoBackup: true
                }
              };
              
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
  }, [user]);

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

    return (
      <View className="mb-6">
        <View className="flex-row items-center mb-6">
          <View className={`w-20 h-20 rounded-full mr-4 items-center justify-center ${getAvatarColor(profile.child.name || 'User')}`}>
            <Text className="text-white text-2xl font-bold">
              {(profile.child.name || 'U').charAt(0).toUpperCase()}
            </Text>
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
      <SafeAreaView className="flex-1 bg-blue-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-slate-600">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text className="mt-4 text-slate-800 text-lg font-semibold text-center">
            Profile Loading Error
          </Text>
          <Text className="mt-2 text-slate-600 text-center">
            {error}
          </Text>
          <TouchableOpacity 
            className="mt-6 bg-blue-500 rounded-lg px-6 py-3"
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show message if no user but not loading
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="person-circle" size={64} color="#9CA3AF" />
          <Text className="mt-4 text-slate-800 text-lg font-semibold text-center">
            Please Sign In
          </Text>
          <Text className="mt-2 text-slate-600 text-center">
            You need to be signed in to view your profile
          </Text>
          <TouchableOpacity 
            className="mt-6 bg-blue-500 rounded-lg px-6 py-3"
            onPress={() => router.push('/login')}
          >
            <Text className="text-white font-medium">Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-blue-50 overflow-hidden">
      <View className="flex-row items-center justify-between p-4 bg-blue-50">
        <TouchableOpacity 
          className="p-2"
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="arrow-back" size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-slate-800">Profile</Text>
        <View className="w-10" />
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