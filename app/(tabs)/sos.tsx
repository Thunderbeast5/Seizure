import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {router} from 'expo-router';

export default function EmergencyScreen() {
  const navigation = useNavigation();
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  
  // Mock emergency contacts
  const emergencyContacts = [
    { id: '1', name: 'Mom', phone: '555-123-4567', relation: 'Mother' },
    { id: '2', name: 'Dad', phone: '555-987-6543', relation: 'Father' },
    { id: '3', name: 'Dr. Smith', phone: '555-111-2222', relation: 'Neurologist' }
  ];

  const handleSendAlert = () => {
    setSendingAlert(true);
    
    // Simulate sending alert
    setTimeout(() => {
      setSendingAlert(false);
      setAlertSent(true);
      Alert.alert(
        'Emergency Alert Sent',
        'Your emergency contacts have been notified with your location.',
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  const handleCallEmergency = () => {
    Alert.alert(
      'Call Emergency Services',
      'This will dial emergency services (911). Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', style: 'destructive', onPress: () => {
          // In a real app, this would use Linking to make the call
          Alert.alert('Calling Emergency Services', 'This is a simulation. In a real app, this would dial 911.');
        }}
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="flex-row items-center justify-between p-4 bg-blue-50">
        <TouchableOpacity 
          className="p-2"
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="arrow-back" size={28} color="#4A90E2" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Emergency SOS</Text>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-2">Send Emergency Alert</Text>
          <Text className="text-lg text-gray-500 mb-4">
            This will notify all your emergency contacts with your current location and that your child is having a seizure.
          </Text>
          
          <TouchableOpacity 
            className={`${alertSent ? 'bg-green-500' : 'bg-red-500'} rounded-xl p-6 flex-row items-center justify-center shadow-lg`}
            onPress={handleSendAlert}
            disabled={sendingAlert || alertSent}
          >
            {sendingAlert ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <>
                <Ionicons 
                  name={alertSent ? "checkmark-circle" : "alert-circle"} 
                  size={44} 
                  color="white" 
                />
                <Text className="text-white text-2xl font-bold ml-3">
                  {alertSent ? 'Alert Sent' : 'Send Emergency Alert'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <TouchableOpacity 
            className="bg-blue-500 rounded-xl p-4 flex-row items-center justify-center shadow-md"
            onPress={handleCallEmergency}
          >
            <Ionicons name="call" size={36} color="white" />
            <Text className="text-white text-xl font-bold ml-2">Call Emergency Services (911)</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-2">Seizure First Aid</Text>
          
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Ionicons name="checkmark-circle" size={28} color="#27AE60" />
              <Text className="text-xl font-bold text-green-600 ml-2">DO</Text>
            </View>
            <View className="pl-2">
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark" size={20} color="#27AE60" />
                <Text className="text-lg text-gray-800 ml-2 flex-1">Time the seizure</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark" size={20} color="#27AE60" />
                <Text className="text-lg text-gray-800 ml-2 flex-1">Keep the child safe from injury</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark" size={20} color="#27AE60" />
                <Text className="text-lg text-gray-800 ml-2 flex-1">Turn them on their side if possible</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark" size={20} color="#27AE60" />
                <Text className="text-lg text-gray-800 ml-2 flex-1">Stay with them until fully conscious</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark" size={20} color="#27AE60" />
                <Text className="text-lg text-gray-800 ml-2 flex-1">Reassure them when they recover</Text>
              </View>
            </View>
          </View>
          
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Ionicons name="close-circle" size={28} color="#E74C3C" />
              <Text className="text-xl font-bold text-red-500 ml-2">DON'T</Text>
            </View>
            <View className="pl-2">
              <View className="flex-row items-center mb-2">
                <Ionicons name="close" size={20} color="#E74C3C" />
                <Text className="text-lg text-gray-800 ml-2 flex-1">Restrain their movements</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Ionicons name="close" size={20} color="#E74C3C" />
                <Text className="text-lg text-gray-800 ml-2 flex-1">Put anything in their mouth</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Ionicons name="close" size={20} color="#E74C3C" />
                <Text className="text-lg text-gray-800 ml-2 flex-1">Try to move them unless in danger</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Ionicons name="close" size={20} color="#E74C3C" />
                <Text className="text-lg text-gray-800 ml-2 flex-1">Give them food or drink until fully recovered</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mb-10">
          <Text className="text-xl font-bold text-gray-800 mb-2">Emergency Contacts</Text>
          
          {emergencyContacts.map((contact) => (
            <View key={contact.id} className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between shadow-sm">
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-800">{contact.name}</Text>
                <Text className="text-lg text-gray-500">{contact.relation}</Text>
              </View>
              <Text className="text-lg text-gray-800 mr-4">{contact.phone}</Text>
              <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
                <Ionicons name="call" size={28} color="#4A90E2" />
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity className="flex-row items-center p-2 mt-2">
            <Ionicons name="add-circle" size={24} color="#4A90E2" />
            <Text className="text-lg text-blue-500 ml-1">Add Emergency Contact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}