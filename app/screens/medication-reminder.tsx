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
  ActivityIndicator,
  Modal,
  Platform,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useMedications } from '../../hooks/useMedications';
import { CreateMedicationData, Medication } from '../../services/medicationService';

// Define frequency options
const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily', 
  'Three times daily',
  'Four times daily',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
  'Custom'
];

// Define dosage amounts for scroll picker
const DOSAGE_AMOUNTS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000];
const DOSAGE_UNITS = ['mg', 'g', 'ml', 'tablets', 'capsules', 'drops', 'puffs'];

export default function MedicationsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { 
    medications, 
    loading, 
    addMedication, 
    updateMedication,
    deleteMedication, 
    toggleMedicationStatus,
    loadMedications
  } = useMedications();
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<string | null>(null);
  
  // Form state for adding/editing medication
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [times, setTimes] = useState(['08:00']);
  const [notes, setNotes] = useState('');
  
  // Modal states
  const [showDosagePicker, setShowDosagePicker] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  
  // Dosage picker state
  const [selectedAmount, setSelectedAmount] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState('mg');

  const handleSaveMedication = async () => {
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
      
      if (editingMedication) {
        // Update existing medication
        const medicationData = {
          name: medName.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim(),
          time: times.filter(time => time.trim() !== ''),
          notes: notes.trim() || null,
        };

        console.log('Updating medication:', editingMedication, medicationData);
        await updateMedication(editingMedication, medicationData);
        Alert.alert('Success', 'Medication updated successfully!');
      } else {
        // Add new medication
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
        Alert.alert('Success', 'Medication added successfully!');
      }
      
      resetForm();
      setShowAddForm(false);
      setEditingMedication(null);
    } catch (error) {
      console.error('Error saving medication:', error);
      Alert.alert('Error', 'Failed to save medication. Please try again.');
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

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication.id || '');
    setMedName(medication.name);
    setDosage(medication.dosage);
    setFrequency(medication.frequency);
    setTimes(medication.time || ['08:00']);
    setNotes(medication.notes || '');
    setShowAddForm(true);
  };

  const resetForm = () => {
    setMedName('');
    setDosage('');
    setFrequency('');
    setTimes(['08:00']);
    setNotes('');
    setEditingMedication(null);
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

  const handleDosageSelect = () => {
    setDosage(`${selectedAmount} ${selectedUnit}`);
    setShowDosagePicker(false);
  };

  const handleFrequencySelect = (freq: string) => {
    setFrequency(freq);
    setShowFrequencyPicker(false);
  };

  const handleTimeSelect = (time: string) => {
    const newTimes = [...times];
    newTimes[selectedTimeIndex] = time;
    setTimes(newTimes);
    setShowTimePicker(false);
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };


  // Show loading screen
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
              Medication Tracker
            </Text>
          </View>
          
          {/* Spacer */}
          <View style={{ width: Platform.OS === 'android' ? 48 : 32 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={{ fontSize: 18, color: '#64748B', marginTop: 16 }}>Loading medications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show authentication required message
  if (!user) {
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
              Medication Tracker
            </Text>
          </View>
          
          {/* Spacer */}
          <View style={{ width: Platform.OS === 'android' ? 48 : 32 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <Ionicons name="lock-closed" size={64} color="#E74C3C" />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginTop: 16, marginBottom: 8 }}>Authentication Required</Text>
          <Text style={{ fontSize: 18, color: '#64748B', textAlign: 'center' }}>
            Please log in to view and manage your medications.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderMedicationList = () => (
    <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
      {/* Debug info - remove in production */}
      {/* {__DEV__ && (
        <View className="bg-blue-100 p-3 rounded-lg mb-4">
          <Text className="text-sm text-blue-800">
            User ID: {user?.uid || 'Not logged in'}
          </Text>
          <Text className="text-sm text-blue-800">
            Medications found: {medications.length}
          </Text>
        </View>
      )} */}
      
      {medications.length === 0 ? (
        <View className="flex-1 justify-center items-center py-12">
          <Ionicons name="medical-outline" size={64} color="#A0A0A0" />
          <Text className="text-xl font-bold text-gray-600 mt-4 mb-2">No Medications</Text>
          <Text className="text-lg text-gray-500 text-center mb-6">
            You haven&apos;t added any medications yet. Tap the button below to get started.
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
                  {(med.time || []).map((time, index) => (
                    <View key={index} className="bg-blue-50 py-2 px-3 rounded-lg mr-2 mb-2">
                      <Text className="text-base text-blue-600 font-medium">{time}</Text>
                    </View>
                  ))}
                  {(!med.time || med.time.length === 0) && (
                    <Text className="text-base text-gray-500">No times set</Text>
                  )}
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
              <TouchableOpacity 
                className="flex-row items-center mr-8"
                onPress={() => handleEditMedication(med)}
              >
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
        <Text className="text-2xl font-bold text-slate-800 mb-4 text-center">
          {editingMedication ? 'Edit Medication' : 'Add New Medication'}
        </Text>
      </View>
      
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
        <TouchableOpacity 
          className="bg-white rounded-xl p-5 shadow-sm flex-row items-center justify-between"
          onPress={() => setShowDosagePicker(true)}
        >
          <Text className={`text-lg flex-1 ${dosage ? 'text-slate-800' : 'text-gray-400'}`}>
            {dosage || 'Select dosage'}
          </Text>
          <Ionicons name="chevron-down" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <View className="mb-6">
        <Text className="text-xl font-medium text-slate-800 mb-3">Frequency*</Text>
        <TouchableOpacity 
          className="bg-white rounded-xl p-5 shadow-sm flex-row items-center justify-between"
          onPress={() => setShowFrequencyPicker(true)}
        >
          <Text className={`text-lg flex-1 ${frequency ? 'text-slate-800' : 'text-gray-400'}`}>
            {frequency || 'Select frequency'}
          </Text>
          <Ionicons name="chevron-down" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <View className="mb-6">
        <Text className="text-xl font-medium text-slate-800 mb-3">Reminder Times*</Text>
        {times.map((time, index) => (
          <View key={index} className="flex-row items-center mb-3">
            <TouchableOpacity 
              className="bg-white rounded-xl p-5 flex-row items-center justify-between shadow-sm flex-1"
              onPress={() => {
                setSelectedTimeIndex(index);
                setShowTimePicker(true);
              }}
            >
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
          onPress={handleSaveMedication}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-xl font-medium">
              {editingMedication ? 'Update Medication' : 'Save Medication'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

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
            Medication Tracker
          </Text>
        </View>
        
        {/* Refresh Button */}
        <TouchableOpacity 
          onPress={() => {
            if (user?.uid) {
              loadMedications();
            }
          }}
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
          <Ionicons name="refresh" size={Platform.OS === 'android' ? 28 : 32} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {showAddForm ? renderAddForm() : renderMedicationList()}
      
      {/* Dosage Picker Modal */}
      <Modal visible={showDosagePicker} transparent={true} animationType="slide">
        <TouchableOpacity 
          className="flex-1 justify-end"
          style={{ backgroundColor: 'transparent' }}
          activeOpacity={1}
          onPress={() => setShowDosagePicker(false)}
        >
          <TouchableOpacity 
            className="bg-white rounded-t-3xl p-6 max-h-96"
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle bar for visual indication */}
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-slate-800">Select Dosage</Text>
              <TouchableOpacity onPress={() => setShowDosagePicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View className="flex-row mb-6">
              <View className="flex-1 mr-2">
                <Text className="text-lg font-medium text-slate-800 mb-2">Amount</Text>
                <ScrollView className="h-32 bg-gray-50 rounded-lg" showsVerticalScrollIndicator={false}>
                  {DOSAGE_AMOUNTS.map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      className={`p-3 ${selectedAmount === amount ? 'bg-blue-100' : ''}`}
                      onPress={() => setSelectedAmount(amount)}
                    >
                      <Text className={`text-center ${selectedAmount === amount ? 'text-blue-600 font-bold' : 'text-slate-800'}`}>
                        {amount}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View className="flex-1 ml-2">
                <Text className="text-lg font-medium text-slate-800 mb-2">Unit</Text>
                <ScrollView className="h-32 bg-gray-50 rounded-lg" showsVerticalScrollIndicator={false}>
                  {DOSAGE_UNITS.map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      className={`p-3 ${selectedUnit === unit ? 'bg-blue-100' : ''}`}
                      onPress={() => setSelectedUnit(unit)}
                    >
                      <Text className={`text-center ${selectedUnit === unit ? 'text-blue-600 font-bold' : 'text-slate-800'}`}>
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <TouchableOpacity
              className="bg-blue-600 rounded-xl p-4 items-center"
              onPress={handleDosageSelect}
            >
              <Text className="text-white text-lg font-medium">Select {selectedAmount} {selectedUnit}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      
      {/* Frequency Picker Modal */}
      <Modal visible={showFrequencyPicker} transparent={true} animationType="slide">
        <TouchableOpacity 
          className="flex-1 justify-end"
          style={{ backgroundColor: 'transparent' }}
          activeOpacity={1}
          onPress={() => setShowFrequencyPicker(false)}
        >
          <TouchableOpacity 
            className="bg-white rounded-t-3xl p-6 max-h-96"
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle bar for visual indication */}
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-slate-800">Select Frequency</Text>
              <TouchableOpacity onPress={() => setShowFrequencyPicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="max-h-64" showsVerticalScrollIndicator={false}>
              {FREQUENCY_OPTIONS.map((freq) => (
                <TouchableOpacity
                  key={freq}
                  className="p-4 border-b border-gray-100"
                  onPress={() => handleFrequencySelect(freq)}
                >
                  <Text className="text-lg text-slate-800">{freq}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      
      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent={true} animationType="slide">
        <TouchableOpacity 
          className="flex-1 justify-end"
          style={{ backgroundColor: 'transparent' }}
          activeOpacity={1}
          onPress={() => setShowTimePicker(false)}
        >
          <TouchableOpacity 
            className="bg-white rounded-t-3xl p-6 max-h-96"
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle bar for visual indication */}
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-slate-800">Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="max-h-64" showsVerticalScrollIndicator={false}>
              {generateTimeOptions().map((time) => (
                <TouchableOpacity
                  key={time}
                  className="p-4 border-b border-gray-100"
                  onPress={() => handleTimeSelect(time)}
                >
                  <Text className="text-lg text-slate-800">{time}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}