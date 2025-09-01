import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { DoctorConnectionInfo, patientConnectionService } from '../services/patientConnectionService';
import { ThemedView } from './ThemedView';

export const ConnectionRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DoctorConnectionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadConnectionRequests();
    }
  }, [user?.uid]);

  const loadConnectionRequests = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const connectionRequests = await patientConnectionService.getPatientConnectionRequestsWithDoctorInfo(user.uid);
      setRequests(connectionRequests);
    } catch (error) {
      console.error('Error loading connection requests:', error);
      Alert.alert('Error', 'Failed to load connection requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    Alert.alert(
      'Accept Connection',
      'Are you sure you want to accept this doctor\'s connection request? They will have access to your medical data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: async () => {
            try {
              await patientConnectionService.updateConnectionStatus(requestId, 'accepted');
              Alert.alert('Success', 'Connection accepted! The doctor can now view your medical data.');
              loadConnectionRequests(); // Refresh the list
            } catch (error) {
              console.error('Error accepting connection:', error);
              Alert.alert('Error', 'Failed to accept connection');
            }
          }
        }
      ]
    );
  };

  const handleRejectRequest = async (requestId: string) => {
    Alert.alert(
      'Reject Connection',
      'Are you sure you want to reject this doctor\'s connection request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await patientConnectionService.updateConnectionStatus(requestId, 'rejected');
              Alert.alert('Success', 'Connection request rejected.');
              loadConnectionRequests(); // Refresh the list
            } catch (error) {
              console.error('Error rejecting connection:', error);
              Alert.alert('Error', 'Failed to reject connection');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading connection requests...</Text>
        </View>
      </ThemedView>
    );
  }

  if (requests.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Connection Requests</Text>
          <Text style={styles.emptySubtitle}>
            You haven't received any connection requests from doctors yet.
          </Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Doctor Connection Requests</Text>
        <Text style={styles.subtitle}>
          Review and respond to connection requests from doctors
        </Text>
        
        {requests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.doctorInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {request.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.doctorDetails}>
                <Text style={styles.doctorName}>{request.name}</Text>
                <Text style={styles.doctorSpecialty}>{request.specialty}</Text>
                <Text style={styles.doctorHospital}>{request.hospital}</Text>
                {request.message && (
                  <Text style={styles.message}>"{request.message}"</Text>
                )}
                <Text style={styles.date}>
                  Requested: {request.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                </Text>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.acceptButton]}
                onPress={() => handleAcceptRequest(request.id)}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={() => handleRejectRequest(request.id)}
              >
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  message: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  rejectButtonText: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
