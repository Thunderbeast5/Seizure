import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  TextInput,
  Switch,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Mock data for medications
const INITIAL_MEDICATIONS = [
  {
    id: '1',
    name: 'Levetiracetam',
    dosage: '500mg',
    frequency: 'Twice daily',
    time: ['08:00', '20:00'],
    notes: 'Take with food',
    active: true,
  },
  {
    id: '2',
    name: 'Valproic Acid',
    dosage: '250mg',
    frequency: 'Three times daily',
    time: ['08:00', '14:00', '20:00'],
    notes: 'May cause drowsiness',
    active: true,
  }
];

export default function MedicationsScreen() {
  const navigation = useNavigation();
  const [medications, setMedications] = useState(INITIAL_MEDICATIONS);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state for adding new medication
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [times, setTimes] = useState(['08:00']);
  const [notes, setNotes] = useState('');

  const handleAddMedication = () => {
    if (!medName || !dosage || !frequency) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const newMedication = {
      id: Date.now().toString(),
      name: medName,
      dosage,
      frequency,
      time: times,
      notes,
      active: true,
    };

    setMedications([...medications, newMedication]);
    resetForm();
    setShowAddForm(false);
  };

  const toggleMedicationStatus = (id) => {
    setMedications(
      medications.map(med => 
        med.id === id ? { ...med, active: !med.active } : med
      )
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

  const removeTimeSlot = (index) => {
    if (times.length > 1) {
      const newTimes = [...times];
      newTimes.splice(index, 1);
      setTimes(newTimes);
    }
  };

  const updateTime = (index, newTime) => {
    const newTimes = [...times];
    newTimes[index] = newTime;
    setTimes(newTimes);
  };

  const renderMedicationList = () => (
    <ScrollView className="flex-1 p-6">
      {medications.map((med) => (
        <View key={med.id} className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-slate-800">{med.name}</Text>
            <Switch
              value={med.active}
              onValueChange={() => toggleMedicationStatus(med.id)}
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
            
            {med.notes && (
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
            
            <TouchableOpacity className="flex-row items-center">
              <Ionicons name="trash-outline" size={24} color="#E74C3C" />
              <Text className="text-lg text-red-500 ml-2">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      
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
    <ScrollView className="flex-1 p-6">
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
        >
          <Text className="text-gray-600 text-xl font-medium">Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-green-600 rounded-xl p-5 flex-1 items-center ml-3"
          onPress={handleAddMedication}
        >
          <Text className="text-white text-xl font-medium">Save Medication</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-cyan-50">
      <View className="flex-row items-center justify-between  bg-cyan-50 ">
        <TouchableOpacity 
          className="p-3"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#4A90E2" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-slate-800">Medication Tracker</Text>
        <View className="w-12" />
      </View>

      {showAddForm ? renderAddForm() : renderMedicationList()}
    </SafeAreaView>
  );
}