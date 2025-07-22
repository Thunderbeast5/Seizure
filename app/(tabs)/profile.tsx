import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Image,
  TextInput,
  Switch,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Mock profile data
const INITIAL_PROFILE = {
  child: {
    name: 'Emma Thompson',
    age: 8,
    birthDate: '2017-03-15',
    gender: 'Female',
    weight: '26 kg',
    height: '128 cm',
    bloodType: 'A+',
    allergies: 'None',
    photo: 'https://api.a0.dev/assets/image?text=Emma&aspect=1:1'
  },
  diagnosis: {
    type: 'Absence Epilepsy',
    diagnosisDate: '2023-05-10',
    diagnosedBy: 'Dr. Sarah Johnson',
    notes: 'Typical absence seizures, 5-10 seconds duration'
  },
  caregivers: [
    {
      id: '1',
      name: 'Robert Thompson',
      relation: 'Father',
      phone: '555-123-4567',
      email: 'robert@example.com',
      isPrimary: true
    },
    {
      id: '2',
      name: 'Jennifer Thompson',
      relation: 'Mother',
      phone: '555-987-6543',
      email: 'jennifer@example.com',
      isPrimary: true
    },
   
  ],
  emergencyContacts: [
    {
      id: '1',
      name: 'Robert Thompson',
      relation: 'Father',
      phone: '555-123-4567'
    },
    {
      id: '2',
      name: 'Jennifer Thompson',
      relation: 'Mother',
      phone: '555-987-6543'
    },
    {
      id: '3',
      name: 'Dr. Sarah Johnson',
      relation: 'Neurologist',
      phone: '555-111-2222'
    }
  ],
  settings: {
    notifications: true,
    dataSharing: true,
    locationTracking: true,
    darkMode: false,
    autoBackup: true
  }
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [activeSection, setActiveSection] = useState('child'); // 'child', 'diagnosis', 'caregivers', 'emergency', 'settings'
  const [isEditing, setIsEditing] = useState(false);
  
  const handleToggleSetting = (setting) => {
    setProfile({
      ...profile,
      settings: {
        ...profile.settings,
        [setting]: !profile.settings[setting]
      }
    });
  };
  
  const handleEditProfile = () => {
    setIsEditing(true);
  };
  
  const handleSaveProfile = () => {
    // In a real app, this would save to the backend
    Alert.alert('Profile Updated', 'Your changes have been saved successfully.');
    setIsEditing(false);
  };
  
  const renderChildSection = () => (
    <View className="mb-6">
      <View className="flex-row items-center mb-6">
        <Image 
          source={{ uri: profile.child.photo }}
          className="w-20 h-20 rounded-full mr-4"
        />
        <View className="flex-1">
          <Text className="text-2xl font-bold text-slate-800 mb-1">{profile.child.name}</Text>
          <Text className="text-base text-slate-600">{profile.child.age} years old</Text>
          <Text className="text-base text-slate-600">{profile.child.gender}</Text>
        </View>
      </View>
      
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <View className="flex-row mb-4">
          <View className="flex-1">
            <Text className="text-sm text-slate-600 mb-1">Birth Date</Text>
            <Text className="text-base text-slate-800 font-medium">{profile.child.birthDate}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm text-slate-600 mb-1">Blood Type</Text>
            <Text className="text-base text-slate-800 font-medium">{profile.child.bloodType}</Text>
          </View>
        </View>
        
        <View className="flex-row mb-4">
          <View className="flex-1">
            <Text className="text-sm text-slate-600 mb-1">Weight</Text>
            <Text className="text-base text-slate-800 font-medium">{profile.child.weight}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm text-slate-600 mb-1">Height</Text>
            <Text className="text-base text-slate-800 font-medium">{profile.child.height}</Text>
          </View>
        </View>
        
        <View className="flex-row">
          <View className="flex-1">
            <Text className="text-sm text-slate-600 mb-1">Allergies</Text>
            <Text className="text-base text-slate-800 font-medium">{profile.child.allergies}</Text>
          </View>
        </View>
      </View>
      
      {isEditing ? (
        <TouchableOpacity 
          className="bg-green-500 rounded-lg p-4 items-center"
          onPress={handleSaveProfile}
        >
          <Text className="text-white text-base font-medium">Save Changes</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          className="bg-blue-500 rounded-lg p-4 flex-row items-center justify-center"
          onPress={handleEditProfile}
        >
          <Ionicons name="create-outline" size={28} color="white" />
          <Text className="text-white text-base font-medium ml-2">Edit Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  const renderDiagnosisSection = () => (
    <View className="mb-6">
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <View className="flex-row mb-4">
          <View className="flex-1">
            <Text className="text-sm text-slate-600 mb-1">Diagnosis Type</Text>
            <Text className="text-base text-slate-800 font-medium">{profile.diagnosis.type}</Text>
          </View>
        </View>
        
        <View className="flex-row mb-4">
          <View className="flex-1">
            <Text className="text-sm text-slate-600 mb-1">Diagnosis Date</Text>
            <Text className="text-base text-slate-800 font-medium">{profile.diagnosis.diagnosisDate}</Text>
          </View>
        </View>
        
        <View className="flex-row mb-4">
          <View className="flex-1">
            <Text className="text-sm text-slate-600 mb-1">Diagnosed By</Text>
            <Text className="text-base text-slate-800 font-medium">{profile.diagnosis.diagnosedBy}</Text>
          </View>
        </View>
        
        <View className="flex-row">
          <View className="flex-1">
            <Text className="text-sm text-slate-600 mb-1">Notes</Text>
            <Text className="text-base text-slate-800 font-medium">{profile.diagnosis.notes}</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity className="bg-blue-500 rounded-lg p-4 flex-row items-center justify-center">
        <Ionicons name="create-outline" size={28} color="white" />
        <Text className="text-white text-base font-medium ml-2">Edit Diagnosis Information</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderCaregiversSection = () => (
    <View className="mb-6">
      {profile.caregivers.map((caregiver) => (
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
              <Ionicons name="call" size={28} color="#3B82F6" />
              <Text className="text-base text-slate-800 ml-2">{caregiver.phone}</Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="mail" size={28} color="#3B82F6" />
              <Text className="text-base text-slate-800 ml-2">{caregiver.email}</Text>
            </View>
          </View>
          
          <View className="justify-around">
            <TouchableOpacity className="p-2">
              <Ionicons name="create-outline" size={28} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2">
              <Ionicons name="trash-outline" size={28} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      
      <TouchableOpacity className="bg-blue-500 rounded-lg p-4 flex-row items-center justify-center mt-2">
        <Ionicons name="add-circle" size={28} color="white" />
        <Text className="text-white text-base font-medium ml-2">Add Caregiver</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderEmergencyContactsSection = () => (
    <View className="mb-6">
      {profile.emergencyContacts.map((contact) => (
        <View key={contact.id} className="bg-white rounded-xl p-4 mb-4 flex-row shadow-sm">
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-800 mb-1">{contact.name}</Text>
            <Text className="text-base text-slate-600 mb-2">{contact.relation}</Text>
            
            <View className="flex-row items-center">
              <Ionicons name="call" size={28} color="#3B82F6" />
              <Text className="text-base text-slate-800 ml-2">{contact.phone}</Text>
            </View>
          </View>
          
          <View className="justify-around">
            <TouchableOpacity className="p-2">
              <Ionicons name="create-outline" size={28} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2">
              <Ionicons name="trash-outline" size={28} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      
      <TouchableOpacity className="bg-blue-500 rounded-lg p-4 flex-row items-center justify-center mt-2">
        <Ionicons name="add-circle" size={28} color="white" />
        <Text className="text-white text-base font-medium ml-2">Add Emergency Contact</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderSettingsSection = () => (
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
      
      <TouchableOpacity className="bg-red-500 rounded-lg p-4 flex-row items-center justify-center mt-2">
        <Ionicons name="log-out-outline" size={28} color="white" />
        <Text className="text-white text-base font-medium ml-2">Log Out</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-blue-50 overflow-hidden">
      <View className="flex-row items-center justify-between p-4 bg-blue-50 ">
        <TouchableOpacity 
          className="p-2"
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="arrow-back" size={28} color="#3B82F6" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-slate-800">Profile</Text>
        <View className="w-10" />
      </View>

      <View className="bg-blue-50 ">
        
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
              size={28} 
              color={activeSection === 'child' ? '#3B82F6' : '#64748B'} 
            />
            <Text className={`text-base font-medium ml-2 ${
              activeSection === 'child' ? 'text-blue-500 font-bold' : 'text-slate-500'
            }`}>
              Child
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
              size={28} 
              color={activeSection === 'diagnosis' ? '#3B82F6' : '#64748B'} 
            />
            <Text className={`text-base font-medium ml-2 ${
              activeSection === 'diagnosis' ? 'text-blue-500 font-bold' : 'text-slate-500'
            }`}>
              Diagnosis
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
              size={28} 
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
              size={28} 
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
              size={28} 
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
        {activeSection === 'child' && renderChildSection()}
        {activeSection === 'diagnosis' && renderDiagnosisSection()}
        {activeSection === 'caregivers' && renderCaregiversSection()}
        {activeSection === 'emergency' && renderEmergencyContactsSection()}
        {activeSection === 'settings' && renderSettingsSection()}
      </ScrollView>
    </SafeAreaView>
  );
}