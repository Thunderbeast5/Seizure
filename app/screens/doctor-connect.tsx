import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { ConnectionRequests } from '../../components/ConnectionRequests';
import { PatientIdDisplay } from '../../components/PatientIdDisplay';
import { ThemedView } from '../../components/ThemedView';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { doctorService } from '../../services/doctorService';

export default function DoctorConnect() {
  const { user } = useAuth();
  const { profile, assignDoctor, removeDoctor } = useProfile();
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
      // Doctor loading logic can be implemented here if needed
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
      // Filter results based on search term
      const filteredResults = results.filter(doctor => 
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
      // Refresh the list if needed
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
              // Refresh the list if needed
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
        <View style={styles.connectedDoctorCard}>
          <View style={styles.doctorInfo}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.avatarText}>D</Text>
            </View>
            <View style={styles.doctorDetails}>
              <Text style={styles.connectedDoctorName}>Connected Doctor</Text>
              <Text style={styles.connectedStatus}>Status: Connected</Text>
              <Text style={styles.connectedNote}>
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
          <Text style={styles.noDoctorTitle}>No Doctor Assigned</Text>
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
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors by name..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearchDoctors}
          />
        </View>
        <TouchableOpacity 
          style={[styles.searchButton, (searching || !searchTerm.trim()) && styles.searchButtonDisabled]}
          onPress={handleSearchDoctors}
          disabled={searching || !searchTerm.trim()}
        >
          {searching ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
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
                <View style={styles.doctorAvatar}>
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

  const renderPatientId = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>My Patient ID</Text>
      <PatientIdDisplay />
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading doctors...</Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
              Current
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
              Search
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
              Patient ID
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'current' && renderCurrentDoctor()}
        {activeTab === 'search' && renderDoctorSearch()}
        {activeTab === 'requests' && renderConnectionRequests()}
        {activeTab === 'patientId' && renderPatientId()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF8FF',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    marginHorizontal: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1E293B',
  },
  connectedDoctorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  doctorInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  doctorDetails: {
    flex: 1,
  },
  connectedDoctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  connectedStatus: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 8,
  },
  connectedNote: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  removeButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  noDoctorCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  noDoctorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 8,
  },
  noDoctorSubtext: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: '#1E293B',
  },
  searchButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonDisabled: {
    backgroundColor: '#9CA3AF',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  doctorResultCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 2,
  },
  doctorHospital: {
    fontSize: 14,
    color: '#94A3B8',
  },
  connectButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748B',
    marginTop: 16,
  },
});