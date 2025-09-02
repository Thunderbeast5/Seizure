import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { DoctorConnectionInfo, patientConnectionService } from '../services/patientConnectionService';

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
      "Are you sure you want to accept this doctor's connection request? They will have access to your medical data.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: async () => {
            try {
              await patientConnectionService.updateConnectionStatus(requestId, 'accepted');
              Alert.alert('Success', 'Connection accepted! The doctor can now view your medical data.');
              loadConnectionRequests();
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
      "Are you sure you want to reject this doctor's connection request?",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await patientConnectionService.updateConnectionStatus(requestId, 'rejected');
              Alert.alert('Success', 'Connection request rejected.');
              loadConnectionRequests();
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
      <View className="flex-1 justify-center items-center bg-white rounded-xl p-6 shadow">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-base text-slate-600 mt-4">Loading connection requests...</Text>
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white rounded-xl p-6 shadow">
        <Text className="text-xl font-bold text-slate-800 mb-2">No Connection Requests</Text>
        <Text className="text-base text-slate-600 text-center">
          You haven't received any connection requests from doctors yet.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="bg-white rounded-xl p-4 shadow">
      <Text className="text-2xl font-bold text-slate-800 mb-2">Doctor Connection Requests</Text>
      <Text className="text-base text-slate-600 mb-4">
        Review and respond to connection requests from doctors
      </Text>
      {requests.map((request) => (
        <View key={request.id} className="bg-blue-50 rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-full bg-blue-100 justify-center items-center mr-3">
              <Text className="text-xl font-bold text-blue-600">{request.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-slate-800">{request.name}</Text>
              <Text className="text-sm text-slate-600">{request.specialty}</Text>
              <Text className="text-xs text-slate-400">{request.hospital}</Text>
              {request.message && (
                <Text className="text-sm text-slate-700 italic mt-1">"{request.message}"</Text>
              )}
              <Text className="text-xs text-gray-500 mt-1">
                Requested: {request.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-3 px-4 rounded-lg bg-green-500 items-center"
              onPress={() => handleAcceptRequest(request.id)}
            >
              <Text className="text-white font-semibold">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 px-4 rounded-lg bg-red-500 items-center"
              onPress={() => handleRejectRequest(request.id)}
            >
              <Text className="text-white font-semibold">Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};