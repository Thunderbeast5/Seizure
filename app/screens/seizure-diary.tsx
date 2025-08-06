import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSeizures } from '../../hooks/useSeizures';
import { CreateSeizureData } from '../../services/seizureService';

// Define seizure types for the dropdown
const SEIZURE_TYPES = [
  'Absence (Petit Mal)',
  'Tonic-Clonic (Grand Mal)',
  'Myoclonic',
  'Atonic',
  'Focal',
  'Other'
];

export default function SeizureDiaryScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { 
    seizures, 
    loading, 
    saving,
    addSeizure, 
    deleteSeizure,
    loadSeizures 
  } = useSeizures();
  const [activeTab, setActiveTab] = useState('log'); // 'log' or 'history'
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(
    new Date().toTimeString().split(' ')[0].substring(0, 5)
  );
  const [seizureType, setSeizureType] = useState('');
  const [duration, setDuration] = useState('');
  const [triggers, setTriggers] = useState('');
  const [notes, setNotes] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);

  const handleSave = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'Please log in to save seizures');
      return;
    }

    if (!seizureType.trim() || !duration.trim()) {
      Alert.alert('Missing Information', 'Please fill in seizure type and duration');
      return;
    }

    try {
      const seizureData: CreateSeizureData = {
        date: date.trim(),
        time: time.trim(),
        type: seizureType.trim(),
        duration: duration.trim(),
        triggers: triggers.trim() || null,
        notes: notes.trim() || null,
      };

      console.log('Adding seizure for user:', user.uid, seizureData);
      await addSeizure(seizureData);
      
      // Reset form
      setSeizureType('');
      setDuration('');
      setTriggers('');
      setNotes('');
      setActiveTab('history');
      
      Alert.alert('Success', 'Seizure logged successfully!');
    } catch (error) {
      console.error('Error saving seizure:', error);
      Alert.alert('Error', 'Failed to save seizure. Please try again.');
    }
  };

  const handleDeleteSeizure = async (seizureId: string, seizureDate: string) => {
    Alert.alert(
      'Delete Seizure',
      `Are you sure you want to delete the seizure from ${seizureDate}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSeizure(seizureId);
              Alert.alert('Success', 'Seizure deleted successfully!');
            } catch (error) {
              console.error('Error deleting seizure:', error);
              Alert.alert('Error', 'Failed to delete seizure. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Show loading screen
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <View className="flex-row items-center justify-between p-5 bg-blue-50">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#4A90E2" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-slate-800">Seizure Diary</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text className="text-lg text-gray-600 mt-4">Loading seizures...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show authentication required message
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <View className="flex-row items-center justify-between p-5 bg-blue-50">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#4A90E2" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-slate-800">Seizure Diary</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="lock-closed" size={64} color="#E74C3C" />
          <Text className="text-xl font-bold text-slate-800 mt-4 mb-2">Authentication Required</Text>
          <Text className="text-lg text-gray-600 text-center">
            Please log in to view and manage your seizures.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderTypeSelectionModal = () => (
    <Modal
      visible={showTypeModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowTypeModal(false)}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/50 justify-center items-center p-4"
        activeOpacity={1}
        onPress={() => setShowTypeModal(false)}
      >
        <TouchableOpacity 
          className="bg-white rounded-xl w-full max-w-sm"
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="p-4 border-b border-gray-200">
            <Text className="text-xl font-semibold text-slate-800 text-center">
              Select Seizure Type
            </Text>
          </View>
          <ScrollView className="max-h-80">
            {SEIZURE_TYPES.map((type, index) => (
              <TouchableOpacity
                key={type}
                className={`p-4 ${index !== SEIZURE_TYPES.length - 1 ? 'border-b border-gray-100' : ''}`}
                onPress={() => {
                  setSeizureType(type);
                  setShowTypeModal(false);
                }}
              >
                <Text className="text-lg text-slate-800">{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            className="p-4 border-t border-gray-200"
            onPress={() => setShowTypeModal(false)}
          >
            <Text className="text-lg text-blue-500 text-center font-semibold">Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  const renderLogTab = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Date Input */}
        <View className="mb-4">
          <Text className="text-xl font-semibold text-slate-800 mb-3">Date</Text>
          <TouchableOpacity className="bg-white rounded-xl p-4 flex-row items-center justify-between shadow-sm">
            <Text className="text-lg text-slate-800 flex-1">{date}</Text>
            <Ionicons name="calendar" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Time Input */}
        <View className="mb-4">
          <Text className="text-xl font-semibold text-slate-800 mb-3">Time</Text>
          <TouchableOpacity className="bg-white rounded-xl p-4 flex-row items-center justify-between shadow-sm">
            <Text className="text-lg text-slate-800 flex-1">{time}</Text>
            <Ionicons name="time" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Seizure Type Input */}
        <View className="mb-4">
          <Text className="text-xl font-semibold text-slate-800 mb-3">
            Seizure Type <Text className="text-red-500">*</Text>
          </Text>
          <TouchableOpacity
            className="bg-white rounded-xl p-4 flex-row items-center justify-between shadow-sm"
            onPress={() => setShowTypeModal(true)}
          >
            <Text className={`text-lg flex-1 ${seizureType ? 'text-slate-800' : 'text-gray-400'}`}>
              {seizureType || 'Select seizure type'}
            </Text>
            <Ionicons name="chevron-down" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Duration Input */}
        <View className="mb-4">
          <Text className="text-xl font-semibold text-slate-800 mb-3">
            Duration <Text className="text-red-500">*</Text>
          </Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <TextInput
              className="text-lg text-slate-800 min-h-[24px]"
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g., 30 seconds, 2 minutes"
              placeholderTextColor="#A0A0A0"
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Triggers Input */}
        <View className="mb-4">
          <Text className="text-xl font-semibold text-slate-800 mb-3">Triggers (if known)</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <TextInput
              className="text-lg text-slate-800 min-h-[24px]"
              value={triggers}
              onChangeText={setTriggers}
              placeholder="e.g., missed medication, lack of sleep"
              placeholderTextColor="#A0A0A0"
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Notes Input */}
        <View className="mb-4">
          <Text className="text-xl font-semibold text-slate-800 mb-3">Notes</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <TextInput
              className="text-lg text-slate-800 min-h-[80px]"
              style={{ textAlignVertical: 'top' }}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional observations or notes"
              placeholderTextColor="#A0A0A0"
              multiline={true}
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Attach Video Button */}
        <View className="mb-6">
          <TouchableOpacity className="bg-blue-500 rounded-xl p-4 flex-row items-center justify-center">
            <Ionicons name="camera" size={24} color="white" />
            <Text className="text-white text-lg font-semibold ml-3">Attach Video</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          className={`rounded-xl p-5 items-center mb-8 ${saving ? 'bg-gray-400' : 'bg-green-500'}`}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-xl font-bold ml-2">Saving...</Text>
            </View>
          ) : (
            <Text className="text-white text-xl font-bold">Save Seizure Log</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      
      {renderTypeSelectionModal()}
    </KeyboardAvoidingView>
  );

  const renderHistoryTab = () => (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      {/* Debug info - remove in production */}
      {__DEV__ && (
        <View className="bg-blue-100 p-3 rounded-lg mb-4">
          <Text className="text-sm text-blue-800">
            User ID: {user?.uid || 'Not logged in'}
          </Text>
          <Text className="text-sm text-blue-800">
            Seizures found: {seizures.length}
          </Text>
        </View>
      )}

      {seizures.length === 0 ? (
        <View className="flex-1 justify-center items-center py-12">
          <Ionicons name="medical-outline" size={64} color="#A0A0A0" />
          <Text className="text-xl font-bold text-gray-600 mt-4 mb-2">No Seizures Logged</Text>
          <Text className="text-lg text-gray-500 text-center mb-6">
            You haven't logged any seizures yet. Tap the button below to get started.
          </Text>
        </View>
      ) : (
        seizures.map((seizure) => (
          <TouchableOpacity
            key={seizure.id}
            className="bg-white rounded-xl p-5 mb-4 shadow-sm"
            onPress={() => {
              // Navigate to detail view
            }}
          >
            <View className="flex-row justify-between mb-3">
              <Text className="text-xl font-semibold text-slate-800">{seizure.date}</Text>
              <Text className="text-lg text-slate-600">{seizure.time}</Text>
            </View>
            <Text className="text-lg font-bold text-slate-800 mb-3">{seizure.type}</Text>
            <View className="mb-4">
              <Text className="text-base text-slate-700 mb-1">Duration: {seizure.duration}</Text>
              {seizure.triggers && (
                <Text className="text-base text-slate-700 mb-1">Triggers: {seizure.triggers}</Text>
              )}
              {seizure.notes && (
                <Text className="text-base text-slate-700">Notes: {seizure.notes}</Text>
              )}
            </View>
            <View className="flex-row border-t border-gray-100 pt-3">
              <TouchableOpacity className="flex-row items-center mr-6">
                <Ionicons name="create-outline" size={20} color="#4A90E2" />
                <Text className="text-base text-blue-500 ml-2">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center mr-6">
                <Ionicons name="share-outline" size={20} color="#4A90E2" />
                <Text className="text-base text-blue-500 ml-2">Share</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => handleDeleteSeizure(seizure.id!, seizure.date)}
              >
                <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                <Text className="text-base text-red-500 ml-2">Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity
        className="bg-blue-500 rounded-xl p-4 flex-row items-center justify-center mt-4 mb-8"
        onPress={() => setActiveTab('log')}
      >
        <Ionicons name="add-circle" size={24} color="white" />
        <Text className="text-white text-lg font-semibold ml-3">Add New Seizure</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="flex-row items-center justify-between p-5 bg-blue-50">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#4A90E2" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-slate-800">Seizure Diary</Text>
        <TouchableOpacity 
          className="p-2"
          onPress={() => {
            if (user?.uid) {
              loadSeizures();
            }
          }}
        >
          <Ionicons name="refresh" size={28} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <View className="flex-row bg-blue-50 mb-3">
        <TouchableOpacity
          className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'log' ? 'border-blue-500' : 'border-transparent'}`}
          onPress={() => setActiveTab('log')}
        >
          <Text className={`text-lg font-semibold ${activeTab === 'log' ? 'text-blue-500 font-bold' : 'text-slate-500'}`}>
            Log Seizure
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'history' ? 'border-blue-500' : 'border-transparent'}`}
          onPress={() => setActiveTab('history')}
        >
          <Text className={`text-lg font-semibold ${activeTab === 'history' ? 'text-blue-500 font-bold' : 'text-slate-500'}`}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'log' ? renderLogTab() : renderHistoryTab()}
    </SafeAreaView>
  );
}