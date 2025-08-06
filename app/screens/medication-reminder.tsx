import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useMedications } from '../../hooks/useMedications';
import { CreateMedicationData } from '../../services/medicationService';

export default function MedicationsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { 
    medications, 
    loading, 
    addMedication, 
    deleteMedication, 
    toggleMedicationStatus 
  } = useMedications();
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state for adding new medication
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [times, setTimes] = useState(['08:00']);
  const [notes, setNotes] = useState('');

  const handleAddMedication = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'Please log in to add medications');
      return;
    }

    if (!medName.trim() || !dosage.trim() || !frequency.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (times.length === 0 || times.every(time => !time.trim())) {
      Alert.alert('Missing Information', 'Please add at least one reminder time');
      return;
    }

    try {
      setSaving(true);
              const medicationData: CreateMedicationData = {
          name: medName.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim(),
          time: times.filter(time => time.trim() !== ''),
          notes: notes.trim() || null,
          active: true,
        };

      console.log('Adding medication for user:', user.uid, medicationData);
      await addMedication(medicationData);
      
      resetForm();
      setShowAddForm(false);
      Alert.alert('Success', 'Medication added successfully!');
    } catch (error) {
      console.error('Error adding medication:', error);
      Alert.alert('Error', 'Failed to add medication. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMedicationStatus = async (medicationId: string, currentActive: boolean) => {
    if (!medicationId) return;
    
    try {
      await toggleMedicationStatus(medicationId, currentActive);
    } catch (error) {
      console.error('Error toggling medication status:', error);
      Alert.alert('Error', 'Failed to update medication status. Please try again.');
    }
  };

  const handleDeleteMedication = async (medicationId: string, medicationName: string) => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete "${medicationName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedication(medicationId);
              Alert.alert('Success', 'Medication deleted successfully!');
            } catch (error) {
              console.error('Error deleting medication:', error);
              Alert.alert('Error', 'Failed to delete medication. Please try again.');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setMedName('');
    setDosage('');
    setFrequency('');
    setTimes(['08:00']);
    setNotes('');
  };

  const addTimeSlot = () => {
    if (times.length < 5) {
      setTimes([...times, '12:00']);
    }
  };

  const removeTimeSlot = (index: number) => {
    if (times.length > 1) {
      const newTimes = [...times];
      newTimes.splice(index, 1);
      setTimes(newTimes);
    }
  };

  const updateTime = (index: number, newTime: string) => {
    const newTimes = [...times];
    newTimes[index] = newTime;
    setTimes(newTimes);
  };

  // Show loading screen
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <View className="flex-row items-center justify-between bg-blue-50">
          <TouchableOpacity 
            className="p-2"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="#4A90E2" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-slate-800">Medication Tracker</Text>
          <View className="w-12" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text className="text-lg text-gray-600 mt-4">Loading medications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show authentication required message
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <View className="flex-row items-center justify-between bg-blue-50">
          <TouchableOpacity 
            className="p-2"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="#4A90E2" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-slate-800">Medication Tracker</Text>
          <View className="w-12" />
        </View>
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="lock-closed" size={64} color="#E74C3C" />
          <Text className="text-xl font-bold text-slate-800 mt-4 mb-2">Authentication Required</Text>
          <Text className="text-lg text-gray-600 text-center">
            Please log in to view and manage your medications.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderMedicationList = () => (
    <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
      {/* Debug info - remove in production */}
      {__DEV__ && (
        <View className="bg-blue-100 p-3 rounded-lg mb-4">
          <Text className="text-sm text-blue-800">
            User ID: {user?.uid || 'Not logged in'}
          </Text>
          <Text className="text-sm text-blue-800">
            Medications found: {medications.length}
          </Text>
        </View>
      )}
      
      {medications.length === 0 ? (
        <View className="flex-1 justify-center items-center py-12">
          <Ionicons name="medical-outline" size={64} color="#A0A0A0" />
          <Text className="text-xl font-bold text-gray-600 mt-4 mb-2">No Medications</Text>
          <Text className="text-lg text-gray-500 text-center mb-6">
            You haven't added any medications yet. Tap the button below to get started.
          </Text>
        </View>
      ) : (
        medications.map((med) => (
          <View key={med.id} className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-slate-800">{med.name}</Text>
              <Switch
                value={med.active}
                onValueChange={() => handleToggleMedicationStatus(med.id!, med.active)}
                trackColor={{ false: '#E0E0E0', true: '#BDE3FF' }}
                thumbColor={med.active ? '#4A90E2' : '#F4F3F4'}
              />
            </View>
            
            <View className="mb-4">
              <View className="flex-row mb-3 items-start">
                <Text className="text-lg font-medium text-gray-600 w-24">Dosage:</Text>
                <Text className="text-lg text-slate-800 flex-1">{med.dosage}</Text>
              </View>
              
              <View className="flex-row mb-3 items-start">
                <Text className="text-lg font-medium text-gray-600 w-24">Frequency:</Text>
                <Text className="text-lg text-slate-800 flex-1">{med.frequency}</Text>
              </View>
              
              <View className="flex-row mb-3 items-start">
                <Text className="text-lg font-medium text-gray-600 w-24">Time:</Text>
                <View className="flex-row flex-wrap flex-1">
                  {med.time.map((time, index) => (
                    <View key={index} className="bg-blue-50 py-2 px-3 rounded-lg mr-2 mb-2">
                      <Text className="text-base text-blue-600 font-medium">{time}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
                          {med.notes && med.notes.trim() !== '' && (
              <View className="flex-row items-start">
                <Text className="text-lg font-medium text-gray-600 w-24">Notes:</Text>
                <Text className="text-lg text-slate-800 flex-1">{med.notes}</Text>
              </View>
            )}
            </View>
            
            <View className="flex-row border-t border-gray-100 pt-4">
              <TouchableOpacity className="flex-row items-center mr-8">
                <Ionicons name="create-outline" size={24} color="#4A90E2" />
                <Text className="text-lg text-blue-600 ml-2">Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center mr-8">
                <Ionicons name="notifications-outline" size={24} color="#4A90E2" />
                <Text className="text-lg text-blue-600 ml-2">Reminders</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => handleDeleteMedication(med.id!, med.name)}
              >
                <Ionicons name="trash-outline" size={24} color="#E74C3C" />
                <Text className="text-lg text-red-500 ml-2">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
      
      {!showAddForm && (
        <TouchableOpacity 
          className="bg-blue-600 rounded-xl p-6 flex-row items-center justify-center mt-4 mb-12"
          onPress={() => setShowAddForm(true)}
        >
          <Ionicons name="add-circle" size={28} color="white" />
          <Text className="text-white text-xl font-medium ml-3">Add New Medication</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const renderAddForm = () => (
    <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
      <View className="mb-6">
        <Text className="text-xl font-medium text-slate-800 mb-3">Medication Name*</Text>
        <View className="bg-white rounded-xl p-5 shadow-sm">
          <TextInput
            className="text-lg text-slate-800 flex-1"
            value={medName}
            onChangeText={setMedName}
            placeholder="e.g., Levetiracetam"
            placeholderTextColor="#A0A0A0"
          />
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-xl font-medium text-slate-800 mb-3">Dosage*</Text>
        <View className="bg-white rounded-xl p-5 shadow-sm">
          <TextInput
            className="text-lg text-slate-800 flex-1"
            value={dosage}
            onChangeText={setDosage}
            placeholder="e.g., 500mg"
            placeholderTextColor="#A0A0A0"
          />
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-xl font-medium text-slate-800 mb-3">Frequency*</Text>
        <View className="bg-white rounded-xl p-5 shadow-sm">
          <TextInput
            className="text-lg text-slate-800 flex-1"
            value={frequency}
            onChangeText={setFrequency}
            placeholder="e.g., Twice daily"
            placeholderTextColor="#A0A0A0"
          />
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-xl font-medium text-slate-800 mb-3">Reminder Times*</Text>
        {times.map((time, index) => (
          <View key={index} className="flex-row items-center mb-3">
            <TouchableOpacity className="bg-white rounded-xl p-5 flex-row items-center justify-between shadow-sm flex-1">
              <Text className="text-lg text-slate-800">{time}</Text>
              <Ionicons name="time" size={28} color="#4A90E2" />
            </TouchableOpacity>
            
            {times.length > 1 && (
              <TouchableOpacity 
                className="p-3 ml-3"
                onPress={() => removeTimeSlot(index)}
              >
                <Ionicons name="close-circle" size={28} color="#E74C3C" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {times.length < 5 && (
          <TouchableOpacity 
            className="flex-row items-center p-3"
            onPress={addTimeSlot}
          >
            <Ionicons name="add-circle" size={24} color="#4A90E2" />
            <Text className="text-lg text-blue-600 ml-2">Add Another Time</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="mb-6">
        <Text className="text-xl font-medium text-slate-800 mb-3">Notes (Optional)</Text>
        <View className="bg-white rounded-xl p-5 shadow-sm h-32">
          <TextInput
            className="text-lg text-slate-800 flex-1"
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional information about this medication"
            placeholderTextColor="#A0A0A0"
            multiline={true}
            numberOfLines={4}
            style={{ textAlignVertical: 'top' }}
          />
        </View>
      </View>

      <View className="flex-row justify-between mt-6 mb-12">
        <TouchableOpacity 
          className="bg-gray-100 rounded-xl p-5 flex-1 items-center mr-3"
          onPress={() => {
            resetForm();
            setShowAddForm(false);
          }}
          disabled={saving}
        >
          <Text className="text-gray-600 text-xl font-medium">Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`rounded-xl p-5 flex-1 items-center ml-3 ${saving ? 'bg-gray-400' : 'bg-green-600'}`}
          onPress={handleAddMedication}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-xl font-medium">Save Medication</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="flex-row items-center justify-between bg-blue-50">
        <TouchableOpacity 
          className="p-2"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#4A90E2" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-slate-800">Medication Tracker</Text>
        <TouchableOpacity 
          className="p-2"
          onPress={() => {
            if (user?.uid) {
              loadUserMedications();
            }
          }}
        >
          <Ionicons name="refresh" size={28} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {showAddForm ? renderAddForm() : renderMedicationList()}
    </SafeAreaView>
  );
}