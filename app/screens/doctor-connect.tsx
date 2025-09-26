import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConnectionRequests } from '../../components/ConnectionRequests';
import { PatientIdDisplay } from '../../components/PatientIdDisplay';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { doctorService } from '../../services/doctorService';

export default function DoctorConnect() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { profile, assignDoctor, removeDoctor } = useProfile();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadDoctors();
    }
  }, [user?.uid]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      // Doctor loading logic if needed
    } catch (error) {
      console.error('Error loading doctors:', error);
      Alert.alert('Error', 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchDoctors = async () => {
    if (!searchTerm.trim()) return;
    try {
      setSearching(true);
      const results = await doctorService.getAllDoctors();
      const filteredResults = results.filter((doctor) =>
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching doctors:', error);
      Alert.alert('Error', 'Failed to search doctors');
    } finally {
      setSearching(false);
    }
  };

  const handleAssignDoctor = async (doctorId: string) => {
    try {
      await assignDoctor(doctorId);
      Alert.alert('Success', 'Doctor assigned successfully!');
    } catch (error) {
      console.error('Error assigning doctor:', error);
      Alert.alert('Error', 'Failed to assign doctor');
    }
  };

  const handleRemoveDoctor = async () => {
    Alert.alert(
      'Remove Doctor',
      'Are you sure you want to remove your current doctor?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeDoctor();
              Alert.alert('Success', 'Doctor removed successfully!');
            } catch (error) {
              console.error('Error removing doctor:', error);
              Alert.alert('Error', 'Failed to remove doctor');
            }
          },
        },
      ]
    );
  };

  const renderCurrentDoctor = () => (
    <View className="bg-white rounded-xl p-5 mb-6 shadow">
      <Text className="text-xl font-bold mb-4 text-slate-800">Current Doctor</Text>
      {profile?.doctorId ? (
        <View>
          <View className="flex-row items-center mb-4">
            <View className="w-14 h-14 rounded-full bg-blue-50 justify-center items-center mr-4">
              <Text className="text-2xl font-bold text-blue-600">D</Text>
            </View>
            <View>
              <Text className="text-lg font-bold text-slate-800 mb-1">Connected Doctor</Text>
              <Text className="text-base text-green-500 font-semibold mb-1">Status: Connected</Text>
              <Text className="text-base text-slate-700">Your doctor can now view your medical data and provide care.</Text>
            </View>
          </View>
          <TouchableOpacity
            className="bg-red-500 py-3 px-6 rounded-lg items-center mt-2"
            onPress={handleRemoveDoctor}
          >
            <Text className="text-white font-semibold text-lg">Remove Doctor</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="bg-slate-50 rounded-xl p-6 items-center border-2 border-slate-200">
          <Text className="text-lg font-bold mb-1 text-slate-800">No Doctor Assigned</Text>
          <Text className="text-base text-slate-600 text-center">
            Search for doctors and send connection requests to get started.
          </Text>
        </View>
      )}
    </View>
  );

  const renderDoctorSearch = () => (
    <View className="bg-white rounded-xl p-5 mb-6 shadow">
      <Text className="text-xl font-bold mb-4 text-slate-800">Search & Connect with Doctors</Text>
      <View className="flex-row mb-3">
        <View className="flex-1 mr-2">
          <TextInput
            className="border border-slate-300 rounded-lg px-4 py-2 text-base text-slate-900 bg-white"
            placeholder="Search doctors by name..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearchDoctors}
          />
        </View>
        <TouchableOpacity
          className={`bg-blue-600 rounded-lg px-4 py-2 justify-center items-center ${searching || !searchTerm.trim() ? 'opacity-50' : ''}`}
          onPress={handleSearchDoctors}
          disabled={searching || !searchTerm.trim()}
        >
          {searching ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold">Search</Text>
          )}
        </TouchableOpacity>
      </View>
      {searchResults.length > 0 && (
        <View className="mt-2">
          <Text className="text-base mb-2 text-slate-700">
            Found {searchResults.length} doctor(s)
          </Text>
          {searchResults.map((doctor) => (
            <View key={doctor.id} className="bg-slate-50 rounded-xl p-4 mb-3 flex-row items-center justify-between border border-slate-200">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-blue-50 justify-center items-center mr-3">
                  <Text className="text-xl font-bold text-blue-600">
                    {doctor.name?.charAt(0).toUpperCase() || 'D'}
                  </Text>
                </View>
                <View>
                  <Text className="font-bold text-slate-800">{doctor.name || 'Unknown'}</Text>
                  <Text className="text-slate-600">{doctor.specialty || 'General'}</Text>
                  <Text className="text-slate-400 text-xs">{doctor.hospital || 'Unknown Hospital'}</Text>
                </View>
              </View>
              <TouchableOpacity
                className="bg-green-500 px-3 py-2 rounded-lg"
                onPress={() => handleAssignDoctor(doctor.id)}
              >
                <Text className="text-white font-semibold">Connect</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderConnectionRequests = () => (
    <View className="mb-6">
      <ConnectionRequests />
    </View>
  );

  const renderPatientId = () => (
    <View className="mb-6">
      <PatientIdDisplay />
    </View>
  );

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
        {/* Header */}
        <View 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: Platform.OS === 'android' ? Math.max(insets.top + 35, 55) : 32,
            marginBottom: Platform.OS === 'android' ? 15 : 10,
            paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
            justifyContent: 'space-between',
            backgroundColor: Platform.OS === 'android' ? 'transparent' : undefined,
            width: '100%',
          }}
        >
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
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
              Doctor Connect
            </Text>
          </View>
          
          {/* Spacer */}
          <View style={{ width: Platform.OS === 'android' ? 48 : 32 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={{ fontSize: 18, color: '#64748B', marginTop: 16 }}>Loading doctors...</Text>
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
          marginTop: Platform.OS === 'android' ? Math.max(insets.top + 35, 55) : 32,
          marginBottom: Platform.OS === 'android' ? 15 : 10,
          paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
          justifyContent: 'space-between',
          backgroundColor: Platform.OS === 'android' ? 'transparent' : undefined,
          width: '100%',
        }}
      >
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
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
            Doctor Connect
          </Text>
        </View>
        
        {/* Spacer */}
        <View style={{ width: Platform.OS === 'android' ? 48 : 32 }} />
      </View>
      
      {/* Subtitle */}
      <Text 
        style={{
          fontSize: 18,
          color: '#64748B',
          textAlign: 'center',
          marginBottom: 8,
          paddingHorizontal: 16,
        }}
      >
        Connect with healthcare professionals to manage your care
      </Text>
      {/* Tab Navigation */}
      <View 
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          marginBottom: 16,
          marginTop: 8,
        }}
      >
        {[
          { key: 'current', label: 'Current' },
          { key: 'search', label: 'Search' },
          { key: 'requests', label: 'Requests' },
          { key: 'patientId', label: 'Patient ID' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={{
              flex: 1,
              marginHorizontal: 4,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: activeTab === tab.key ? '#4A90E2' : '#E2E8F0',
            }}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text 
              style={{
                textAlign: 'center',
                fontWeight: '600',
                color: activeTab === tab.key ? 'white' : '#334155',
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={{ paddingHorizontal: 16 }}>
        {activeTab === 'current' && renderCurrentDoctor()}
        {activeTab === 'search' && renderDoctorSearch()}
        {activeTab === 'requests' && renderConnectionRequests()}
        {activeTab === 'patientId' && renderPatientId()}
      </ScrollView>
    </SafeAreaView>
  );
}