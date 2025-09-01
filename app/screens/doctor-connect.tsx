import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ConnectionRequests } from '../../components/ConnectionRequests';
import { PatientIdDisplay } from '../../components/PatientIdDisplay';
import { ThemedView } from '../../components/ThemedView';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { doctorService } from '../../services/doctorService';
import { patientConnectionService } from '../../services/patientConnectionService';

export default function DoctorConnect() {
  const { user } = useAuth();
  const { profile, assignDoctor, removeDoctor } = useProfile();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      const allDoctors = await doctorService.getAllDoctors();
      setDoctors(allDoctors);
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
      const results = await patientConnectionService.searchPatients(searchTerm, user?.uid || '');
      setSearchResults(results);
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
      loadDoctors(); // Refresh the list
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
              loadDoctors(); // Refresh the list
            } catch (error) {
              console.error('Error removing doctor:', error);
              Alert.alert('Error', 'Failed to remove doctor');
            }
          }
        }
      ]
    );
  };

  const renderCurrentDoctor = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Current Doctor</Text>
      {profile?.doctorId ? (
        <View style={styles.doctorCard}>
          <View style={styles.doctorInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>D</Text>
            </View>
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>Connected Doctor</Text>
              <Text style={styles.doctorStatus}>Status: Connected</Text>
              <Text style={styles.doctorNote}>
                Your doctor can now view your medical data and provide care.
                </Text>
              </View>
          </View>
              <TouchableOpacity 
            style={styles.removeButton}
            onPress={handleRemoveDoctor}
          >
            <Text style={styles.removeButtonText}>Remove Doctor</Text>
              </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noDoctorCard}>
          <Text style={styles.noDoctorText}>No doctor assigned</Text>
          <Text style={styles.noDoctorSubtext}>
            Search for doctors and send connection requests to get started.
          </Text>
        </View>
      )}
    </View>
  );

  const renderDoctorSearch = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Search & Connect with Doctors</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctors by name..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearchDoctors}
        />
            <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearchDoctors}
          disabled={searching || !searchTerm.trim()}
            >
          <Text style={styles.searchButtonText}>
            {searching ? 'Searching...' : 'Search'}
          </Text>
            </TouchableOpacity>
            </View>
            
      {searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            Found {searchResults.length} doctor(s)
          </Text>
          
          {searchResults.map((doctor) => (
            <View key={doctor.id} style={styles.doctorResultCard}>
              <View style={styles.doctorInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {doctor.name?.charAt(0).toUpperCase() || 'D'}
                  </Text>
                </View>
                <View style={styles.doctorDetails}>
                  <Text style={styles.doctorName}>{doctor.name || 'Unknown'}</Text>
                  <Text style={styles.doctorSpecialty}>{doctor.specialty || 'General'}</Text>
                  <Text style={styles.doctorHospital}>{doctor.hospital || 'Unknown Hospital'}</Text>
                </View>
              </View>
            
            <TouchableOpacity 
                style={styles.connectButton}
                onPress={() => handleAssignDoctor(doctor.id)}
              >
                <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          </View>
          ))}
        </View>
      )}
    </View>
  );
  
  const renderConnectionRequests = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Connection Requests</Text>
      <ConnectionRequests />
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading doctors...</Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Doctor Connect</Text>
        <Text style={styles.subtitle}>
          Connect with healthcare professionals to manage your care
        </Text>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'current' && styles.activeTab]}
            onPress={() => setActiveTab('current')}
        >
            <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>
              Current Doctor
            </Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
              Search Doctors
          </Text>
        </TouchableOpacity>
          
                  <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
              Requests
            </Text>
          </TouchableOpacity>
          
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'patientId' && styles.activeTab]}
            onPress={() => setActiveTab('patientId')}
          >
            <Text style={[styles.tabText, activeTab === 'patientId' && styles.activeTabText]}>
              My Patient ID
          </Text>
        </TouchableOpacity>
      </View>

        {/* Tab Content */}
        {activeTab === 'current' && renderCurrentDoctor()}
        {activeTab === 'search' && renderDoctorSearch()}
        {activeTab === 'requests' && renderConnectionRequests()}
        {activeTab === 'patientId' && <PatientIdDisplay />}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#2563eb',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  doctorCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  doctorInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  doctorHospital: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  doctorStatus: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 4,
  },
  doctorNote: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  removeButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  noDoctorCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  noDoctorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  noDoctorSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  searchButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  resultsContainer: {
    marginTop: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  doctorResultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  connectButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
});