import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Image,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { ChildInfo, DiagnosisInfo, Caregiver, EmergencyContact } from '../../services/profileService';

interface ProfileData {
  child: {
    name: string;
    age: number;
    birthDate: string;
    gender: string;
    weight: string;
    height: string;
    bloodType: string;
    allergies: string;
    photo: string;
  };
  diagnosis: {
    type: string;
    diagnosisDate: string;
    diagnosedBy: string;
    notes: string;
  };
  caregivers: Array<{
    id: string;
    name: string;
    relation: string;
    phone: string;
    email: string;
    isPrimary: boolean;
  }>;
  emergencyContacts: Array<{
    id: string;
    name: string;
    relation: string;
    phone: string;
  }>;
  settings: {
    notifications: boolean;
    dataSharing: boolean;
    locationTracking: boolean;
    darkMode: boolean;
    autoBackup: boolean;
  };
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, userData, logout } = useAuth();
  const { 
    profile, 
    loading, 
    saving,
    updateChildInfo, 
    updateDiagnosisInfo,
    addCaregiver,
    deleteCaregiver,
    addEmergencyContact,
    deleteEmergencyContact,
    updateSettings
  } = useProfile();
  const [activeSection, setActiveSection] = useState('child');
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState<any>({});

  // Debug info - remove in production
  useEffect(() => {
    if (__DEV__ && profile) {
      console.log('Current profile data:', profile);
    }
  }, [profile]);

  const handleToggleSetting = async (setting: keyof ProfileData['settings']) => {
    if (!profile) return;

    try {
      const updatedSettings = {
        [setting]: !profile.settings[setting]
      };
      await updateSettings(updatedSettings);
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
    if (!profile) return;

    try {
      await updateChildInfo(editingData);
      setIsEditing(false);
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
          <Image 
            source={{ uri: profile.child.photo }}
            className="w-20 h-20 rounded-full mr-4"
          />
          <View className="flex-1">
            {isEditing ? (
              <TextInput
                className="text-2xl font-bold text-slate-800 mb-1 border-b border-gray-300 pb-1"
                value={editingData.name}
                onChangeText={(text) => setEditingData({...editingData, name: text})}
                placeholder="Full Name"
              />
            ) : (
              <Text className="text-2xl font-bold text-slate-800 mb-1">{profile.child.name}</Text>
            )}
            <Text className="text-base text-slate-600">{profile.child.age} years old</Text>
            <Text className="text-base text-slate-600">{profile.child.gender}</Text>
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
            <View className="flex-1">
              <Text className="text-sm text-slate-600 mb-1">Blood Type</Text>
              {isEditing ? (
                <TextInput
                  className="text-base text-slate-800 font-medium border-b border-gray-300 pb-1"
                  value={editingData.bloodType}
                  onChangeText={(text) => setEditingData({...editingData, bloodType: text})}
                  placeholder="A+, B+, etc."
                />
              ) : (
                <Text className="text-base text-slate-800 font-medium">{profile.child.bloodType}</Text>
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
                  placeholder="26 kg"
                />
              ) : (
                <Text className="text-base text-slate-800 font-medium">
                  {profile.child.weight || 'Not specified'}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm text-slate-600 mb-1">Height</Text>
              {isEditing ? (
                <TextInput
                  className="text-base text-slate-800 font-medium border-b border-gray-300 pb-1"
                  value={editingData.height}
                  onChangeText={(text) => setEditingData({...editingData, height: text})}
                  placeholder="128 cm"
                />
              ) : (
                <Text className="text-base text-slate-800 font-medium">
                  {profile.child.height || 'Not specified'}
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
              className={`flex-1 rounded-lg p-4 items-center mr-2 ${saving ? 'bg-gray-400' : 'bg-green-500'}`}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-base font-medium">Save Changes</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-gray-500 rounded-lg p-4 items-center ml-2"
              onPress={() => setIsEditing(false)}
              disabled={saving}
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
  
  const renderDiagnosisSection = () => {
    if (!profile) return null;

    return (
      <View className="mb-6">
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row mb-4">
            <View className="flex-1">
              <Text className="text-sm text-slate-600 mb-1">Diagnosis Type</Text>
              <Text className="text-base text-slate-800 font-medium">
                {profile.diagnosis.type || 'Not specified'}
              </Text>
            </View>
          </View>
          
          <View className="flex-row mb-4">
            <View className="flex-1">
              <Text className="text-sm text-slate-600 mb-1">Diagnosis Date</Text>
              <Text className="text-base text-slate-800 font-medium">
                {profile.diagnosis.diagnosisDate || 'Not specified'}
              </Text>
            </View>
          </View>
          
          <View className="flex-row mb-4">
            <View className="flex-1">
              <Text className="text-sm text-slate-600 mb-1">Diagnosed By</Text>
              <Text className="text-base text-slate-800 font-medium">
                {profile.diagnosis.diagnosedBy || 'Not specified'}
              </Text>
            </View>
          </View>
          
          <View className="flex-row">
            <View className="flex-1">
              <Text className="text-sm text-slate-600 mb-1">Notes</Text>
              <Text className="text-base text-slate-800 font-medium">
                {profile.diagnosis.notes || 'No notes added'}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity className="bg-blue-500 rounded-lg p-4 flex-row items-center justify-center">
          <Ionicons name="create-outline" size={20} color="white" />
          <Text className="text-white text-base font-medium ml-2">Edit Diagnosis Information</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderCaregiversSection = () => {
    if (!profile) return null;

    return (
      <View className="mb-6">
        {profile.caregivers && profile.caregivers.length > 0 ? (
          profile.caregivers.map((caregiver) => (
            <View key={caregiver.id} className="bg-white rounded-xl p-4 mb-4 flex-row shadow-sm">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-lg font-bold text-slate-800 mb-1">{caregiver.name}</Text>
                  {caregiver.isPrimary && (
                    <View className="bg-blue-50 py-1 px-2 rounded ml-2">
                      <Text className="text-sm text-blue-500 font-medium">Primary</Text>
                    </View>
                  )}
                </View>
                <Text className="text-base text-slate-600 mb-2">{caregiver.relation}</Text>
                
                <View className="flex-row items-center mb-1">
                  <Ionicons name="call" size={16} color="#3B82F6" />
                  <Text className="text-base text-slate-800 ml-2">{caregiver.phone}</Text>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="mail" size={16} color="#3B82F6" />
                  <Text className="text-base text-slate-800 ml-2">{caregiver.email}</Text>
                </View>
              </View>
              
              <View className="justify-around">
                <TouchableOpacity className="p-2">
                  <Ionicons name="create-outline" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity 
                  className="p-2"
                  onPress={() => {
                    Alert.alert(
                      'Delete Caregiver',
                      `Are you sure you want to delete ${caregiver.name}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => deleteCaregiver(caregiver.id)
                        }
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-white rounded-xl p-8 mb-4 shadow-sm items-center">
            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            <Text className="text-lg text-gray-500 mt-2 text-center">No caregivers added yet</Text>
            <Text className="text-sm text-gray-400 mt-1 text-center">Add family members or caregivers</Text>
          </View>
        )}
        
        <TouchableOpacity className="bg-blue-500 rounded-lg p-4 flex-row items-center justify-center mt-2">
          <Ionicons name="add-circle" size={20} color="white" />
          <Text className="text-white text-base font-medium ml-2">Add Caregiver</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderEmergencyContactsSection = () => {
    if (!profile) return null;

    return (
      <View className="mb-6">
        {profile.emergencyContacts && profile.emergencyContacts.length > 0 ? (
          profile.emergencyContacts.map((contact) => (
            <View key={contact.id} className="bg-white rounded-xl p-4 mb-4 flex-row shadow-sm">
              <View className="flex-1">
                <Text className="text-lg font-bold text-slate-800 mb-1">{contact.name}</Text>
                <Text className="text-base text-slate-600 mb-2">{contact.relation}</Text>
                
                <View className="flex-row items-center">
                  <Ionicons name="call" size={16} color="#3B82F6" />
                  <Text className="text-base text-slate-800 ml-2">{contact.phone}</Text>
                </View>
              </View>
              
              <View className="justify-around">
                <TouchableOpacity className="p-2">
                  <Ionicons name="create-outline" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity 
                  className="p-2"
                  onPress={() => {
                    Alert.alert(
                      'Delete Emergency Contact',
                      `Are you sure you want to delete ${contact.name}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => deleteEmergencyContact(contact.id)
                        }
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-white rounded-xl p-8 mb-4 shadow-sm items-center">
            <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
            <Text className="text-lg text-gray-500 mt-2 text-center">No emergency contacts added</Text>
            <Text className="text-sm text-gray-400 mt-1 text-center">Add contacts for emergencies</Text>
          </View>
        )}
        
        <TouchableOpacity className="bg-blue-500 rounded-lg p-4 flex-row items-center justify-center mt-2">
          <Ionicons name="add-circle" size={20} color="white" />
          <Text className="text-white text-base font-medium ml-2">Add Emergency Contact</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderSettingsSection = () => {
    if (!profile) return null;

    return (
      <View className="mb-6">
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-1">
              <Text className="text-base font-medium text-slate-800 mb-1">Notifications</Text>
              <Text className="text-sm text-slate-600">Receive alerts and reminders</Text>
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
              <Text className="text-sm text-slate-600">Share data with healthcare providers</Text>
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
              <Text className="text-sm text-slate-600">Enable location for emergency alerts</Text>
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
            <Text className="text-base text-slate-800 font-medium">{userData?.email}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-sm text-slate-600 mb-1">Username</Text>
            <Text className="text-base text-slate-800 font-medium">{userData?.username}</Text>
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
  if (loading || !userData) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-slate-600">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show authentication required message
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="lock-closed" size={64} color="#E74C3C" />
          <Text className="text-xl font-bold text-slate-800 mt-4 mb-2">Authentication Required</Text>
          <Text className="text-lg text-gray-600 text-center">
            Please log in to view and manage your profile.
          </Text>
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
              activeSection === 'diagnosis' ? 'border-blue-500' : 'border-transparent'
            }`}
            onPress={() => setActiveSection('diagnosis')}
          >
            <Ionicons 
              name="medical" 
              size={20} 
              color={activeSection === 'diagnosis' ? '#3B82F6' : '#64748B'} 
            />
            <Text className={`text-base font-medium ml-2 ${
              activeSection === 'diagnosis' ? 'text-blue-500 font-bold' : 'text-slate-500'
            }`}>
              Medical
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`py-4 px-5 flex-row items-center border-b-2 ${
              activeSection === 'caregivers' ? 'border-blue-500' : 'border-transparent'
            }`}
            onPress={() => setActiveSection('caregivers')}
          >
            <Ionicons 
              name="people" 
              size={20} 
              color={activeSection === 'caregivers' ? '#3B82F6' : '#64748B'} 
            />
            <Text className={`text-base font-medium ml-2 ${
              activeSection === 'caregivers' ? 'text-blue-500 font-bold' : 'text-slate-500'
            }`}>
              Caregivers
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`py-4 px-5 flex-row items-center border-b-2 ${
              activeSection === 'emergency' ? 'border-blue-500' : 'border-transparent'
            }`}
            onPress={() => setActiveSection('emergency')}
          >
            <Ionicons 
              name="alert-circle" 
              size={20} 
              color={activeSection === 'emergency' ? '#3B82F6' : '#64748B'} 
            />
            <Text className={`text-base font-medium ml-2 ${
              activeSection === 'emergency' ? 'text-blue-500 font-bold' : 'text-slate-500'
            }`}>
              Emergency
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

      <ScrollView className="flex-1 p-4 mb-20" style={{ overflow: 'hidden' }}>
        {/* Debug info - remove in production */}
        {__DEV__ && (
          <View className="bg-blue-100 p-3 rounded-lg mb-4">
            <Text className="text-sm text-blue-800">
              User ID: {user?.uid || 'Not logged in'}
            </Text>
            <Text className="text-sm text-blue-800">
              Profile loaded: {profile ? 'Yes' : 'No'}
            </Text>
            <Text className="text-sm text-blue-800">
              Caregivers: {profile?.caregivers?.length || 0}
            </Text>
            <Text className="text-sm text-blue-800">
              Emergency Contacts: {profile?.emergencyContacts?.length || 0}
            </Text>
          </View>
        )}

        {activeSection === 'child' && renderChildSection()}
        {activeSection === 'diagnosis' && renderDiagnosisSection()}
        {activeSection === 'caregivers' && renderCaregiversSection()}
        {activeSection === 'emergency' && renderEmergencyContactsSection()}
        {activeSection === 'settings' && renderSettingsSection()}
      </ScrollView>
    </SafeAreaView>
  );
}