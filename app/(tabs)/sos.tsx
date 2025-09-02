import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Linking,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {router} from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebase.config';

export default function EmergencyScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Emergency contacts state
  const [emergencyContacts, setEmergencyContacts] = useState<{id: string, name: string, phone: string, relation: string}[]>([]);
  
  // Modal state for adding contacts
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');

  // Load emergency contacts from Firebase
  useEffect(() => {
    const loadContacts = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'emergencyContacts'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const contacts: {id: string, name: string, phone: string, relation: string}[] = [];
        
        querySnapshot.forEach((doc) => {
          contacts.push({
            id: doc.id,
            ...doc.data()
          } as {id: string, name: string, phone: string, relation: string});
        });
        
        setEmergencyContacts(contacts);
      } catch (error) {
        console.error('Error loading emergency contacts:', error);
        Alert.alert('Error', 'Failed to load emergency contacts');
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [user]);


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
    Linking.openURL('tel:911');
  };

  const handleCallContact = (phone: string, name: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleAddContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim() || !newContactRelation.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to add contacts');
      return;
    }

    try {
      const contactData = {
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        relation: newContactRelation.trim(),
        userId: user.uid
      };

      const docRef = await addDoc(collection(db, 'emergencyContacts'), contactData);
      
      const newContact = {
        id: docRef.id,
        ...contactData
      };

      setEmergencyContacts([...emergencyContacts, newContact]);
      setNewContactName('');
      setNewContactPhone('');
      setNewContactRelation('');
      setShowAddModal(false);
      // Alert.alert('Success', 'Emergency contact added successfully!');
    } catch (error) {
      console.error('Error adding contact:', error);
      Alert.alert('Error', 'Failed to add emergency contact');
    }
  };

  const handleDeleteContact = (contactId: string, contactName: string) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contactName} from emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(db, 'emergencyContacts', contactId));
            setEmergencyContacts(emergencyContacts.filter(contact => contact.id !== contactId));
            Alert.alert('Success', 'Contact deleted successfully');
          } catch (error) {
            console.error('Error deleting contact:', error);
            Alert.alert('Error', 'Failed to delete contact');
          }
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

      <View style={{ flex: 1, overflow: 'hidden', marginBottom: 90 }}>
        <ScrollView 
          contentContainerStyle={{ 
            padding: 16,
            paddingBottom: 20
          }}
          showsVerticalScrollIndicator={true}
        >
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

        {/* Call Emergency Services */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Emergency Services</Text>
          <TouchableOpacity 
            className="bg-red-600 rounded-xl p-4 flex-row items-center justify-center shadow-lg"
            onPress={handleCallEmergency}
          >
            <Ionicons name="call" size={24} color="white" />
            <Text className="text-white text-xl font-bold ml-3">Call 911</Text>
          </TouchableOpacity>
        </View>


        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">Emergency Contacts</Text>
            <TouchableOpacity 
              className="flex-row items-center bg-blue-500 rounded-lg px-3 py-2"
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">Add</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View className="bg-white rounded-xl p-6 mb-3 flex-row items-center justify-center shadow-sm">
              <ActivityIndicator size="small" color="#4A90E2" />
              <Text className="text-gray-600 ml-2">Loading contacts...</Text>
            </View>
          ) : emergencyContacts.length === 0 ? (
            <View className="bg-white rounded-xl p-6 mb-3 shadow-sm">
              <Text className="text-gray-500 text-center">No emergency contacts added yet</Text>
              <Text className="text-gray-400 text-center mt-1">Tap the Add button to create your first contact</Text>
            </View>
          ) : (
            emergencyContacts.map((contact) => (
              <View key={contact.id} className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between shadow-sm">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800">{contact.name}</Text>
                  <Text className="text-lg text-gray-500">{contact.relation}</Text>
                  <Text className="text-lg text-gray-600">{contact.phone}</Text>
                </View>
                <View className="flex-row">
                  <TouchableOpacity 
                    className="p-3 bg-green-100 rounded-full mr-2"
                    onPress={() => handleCallContact(contact.phone, contact.name)}
                  >
                    <Ionicons name="call" size={24} color="#10B981" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="p-3 bg-red-100 rounded-full"
                    onPress={() => handleDeleteContact(contact.id, contact.name)}
                  >
                    <Ionicons name="trash" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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

        </ScrollView>
      </View>

      {/* Add Contact Modal */}
      <Modal visible={showAddModal} transparent={true} animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableOpacity 
            className="flex-1 justify-end"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            activeOpacity={1}
            onPress={() => setShowAddModal(false)}
          >
            <TouchableOpacity 
              className="bg-white rounded-t-3xl p-6 max-h-96"
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
              
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-slate-800">Add Emergency Contact</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="mb-4">
                  <Text className="text-lg font-medium text-slate-800 mb-2">Name</Text>
                  <TextInput
                    className="bg-gray-50 rounded-lg p-4 text-lg"
                    value={newContactName}
                    onChangeText={setNewContactName}
                    placeholder="Enter contact name"
                    placeholderTextColor="#A0A0A0"
                    returnKeyType="next"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-lg font-medium text-slate-800 mb-2">Phone Number</Text>
                  <TextInput
                    className="bg-gray-50 rounded-lg p-4 text-lg"
                    value={newContactPhone}
                    onChangeText={setNewContactPhone}
                    placeholder="Enter phone number"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-lg font-medium text-slate-800 mb-2">Relation</Text>
                  <TextInput
                    className="bg-gray-50 rounded-lg p-4 text-lg"
                    value={newContactRelation}
                    onChangeText={setNewContactRelation}
                    placeholder="e.g., Mother, Doctor, Friend"
                    placeholderTextColor="#A0A0A0"
                    returnKeyType="done"
                  />
                </View>

                <TouchableOpacity
                  className="bg-blue-600 rounded-xl p-4 items-center mb-4"
                  onPress={handleAddContact}
                >
                  <Text className="text-white text-lg font-medium">Add Contact</Text>
                </TouchableOpacity>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}