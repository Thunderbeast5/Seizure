import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Image,
  TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Mock data for doctors
const DOCTORS = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Pediatric Neurologist',
    hospital: 'Children\'s Medical Center',
    imageUrl: 'https://api.a0.dev/assets/image?text=Dr.%20Sarah%20Johnson&aspect=1:1',
    nextAppointment: '2025-07-25T10:30:00',
    isConnected: true
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Pediatric Epileptologist',
    hospital: 'University Hospital',
    imageUrl: 'https://api.a0.dev/assets/image?text=Dr.%20Michael%20Chen&aspect=1:1',
    nextAppointment: null,
    isConnected: true
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatric Neurologist',
    hospital: 'Memorial Children\'s Hospital',
    imageUrl: 'https://api.a0.dev/assets/image?text=Dr.%20Emily%20Rodriguez&aspect=1:1',
    nextAppointment: null,
    isConnected: false
  }
];

// Mock messages
const MESSAGES = [
  {
    id: '1',
    doctorId: '1',
    text: 'Hello! How has your child been doing with the new medication dosage?',
    timestamp: '2025-07-18T14:30:00',
    isFromDoctor: true
  },
  {
    id: '2',
    doctorId: '1',
    text: 'She\'s been doing better. We\'ve noticed fewer seizures this week.',
    timestamp: '2025-07-18T14:45:00',
    isFromDoctor: false
  },
  {
    id: '3',
    doctorId: '1',
    text: 'That\'s great news! Any side effects you\'ve noticed?',
    timestamp: '2025-07-18T15:00:00',
    isFromDoctor: true
  },
  {
    id: '4',
    doctorId: '1',
    text: 'Just a bit of drowsiness in the mornings, but it seems to be improving.',
    timestamp: '2025-07-18T15:10:00',
    isFromDoctor: false
  }
];

export default function DoctorConnectScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' or 'messages'
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messageText, setMessageText] = useState('');
  
  const formatDate = (dateString) => {
    if (!dateString) return 'No appointment scheduled';
    
    const date = new Date(dateString);
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', options);
  };
  
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    // In a real app, this would send the message to the backend
    alert('Message sent!');
    setMessageText('');
  };
  
  const renderDoctorsList = () => (
    <ScrollView className="flex-1 px-4">
      {DOCTORS.map((doctor) => (
        <TouchableOpacity 
          key={doctor.id} 
          className="bg-white rounded-xl p-4 mb-4 flex-row shadow-sm"
          onPress={() => setSelectedDoctor(doctor)}
        >
          <Image 
            source={{ uri: doctor.imageUrl }}
            className="w-16 h-16 rounded-full mr-4"
          />
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800 mb-1">{doctor.name}</Text>
            <Text className="text-lg text-blue-500 mb-1">{doctor.specialty}</Text>
            <Text className="text-lg text-gray-600 mb-2">{doctor.hospital}</Text>
            
            {doctor.nextAppointment ? (
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={16} color="#4A90E2" />
                <Text className="text-base text-blue-500 ml-1">
                  Next: {formatDate(doctor.nextAppointment)}
                </Text>
              </View>
            ) : (
              <TouchableOpacity className="bg-blue-50 py-1 px-2 rounded self-start">
                <Text className="text-base text-blue-500 font-medium">Schedule Appointment</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View className="justify-around pl-4">
            <TouchableOpacity className="p-2">
              <Ionicons name="chatbubble-outline" size={28} color="#4A90E2" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2">
              <Ionicons name="call-outline" size={28} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity className="bg-blue-500 rounded-lg p-4 flex-row items-center justify-center mt-2 mb-6">
        <Ionicons name="add-circle" size={28} color="white" />
        <Text className="text-xl font-medium ml-2 text-white">Add New Doctor</Text>
      </TouchableOpacity>
    </ScrollView>
  );
  
  const renderMessagesTab = () => (
    <View className="flex-1 bg-white">
      {!selectedDoctor ? (
        <View className="flex-1 p-4 items-center justify-center">
          <Text className="text-3xl font-bold text-gray-800 mb-2">Select a Doctor</Text>
          <Text className="text-lg text-gray-600 text-center mb-6">
            Choose a doctor from the list below to view your conversation history or start a new chat.
          </Text>
          
          <View className="flex-row justify-center flex-wrap">
            {DOCTORS.filter(d => d.isConnected).map((doctor) => (
              <TouchableOpacity 
                key={doctor.id}
                className="items-center m-3"
                onPress={() => setSelectedDoctor(doctor)}
              >
                <Image 
                  source={{ uri: doctor.imageUrl }}
                  className="w-16 h-16 rounded-full mb-2"
                />
                <Text className="text-lg text-gray-800">{doctor.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View className="flex-1">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={() => setSelectedDoctor(null)}
            >
              <Ionicons name="chevron-back" size={28} color="#4A90E2" />
              <Text className="text-lg text-blue-500">All Doctors</Text>
            </TouchableOpacity>
            
            <View className="flex-row items-center">
              <Image 
                source={{ uri: selectedDoctor.imageUrl }}
                className="w-8 h-8 rounded-full mr-2"
              />
              <Text className="text-xl font-medium text-gray-800">{selectedDoctor.name}</Text>
            </View>
            
            <TouchableOpacity className="p-2">
              <Ionicons name="ellipsis-vertical" size={28} color="#4A90E2" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 p-4">
            {MESSAGES.filter(m => m.doctorId === selectedDoctor.id).map((message) => (
              <View 
                key={message.id} 
                className={`mb-4 max-w-[80%] ${message.isFromDoctor ? 'self-start' : 'self-end'}`}
              >
                <View 
                  className={`p-3 rounded-2xl ${
                    message.isFromDoctor 
                      ? 'bg-gray-100 rounded-bl-sm' 
                      : 'bg-blue-50 rounded-br-sm'
                  }`}
                >
                  <Text className="text-lg text-gray-800">{message.text}</Text>
                </View>
                <Text className="text-base text-gray-500 mt-1 self-end">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
          </ScrollView>
          
          <View className="flex-row items-center p-2 border-t border-gray-200">
            <TouchableOpacity className="p-2">
              <Ionicons name="attach" size={28} color="#7F8C8D" />
            </TouchableOpacity>
            
            <TextInput
              className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 mx-2 max-h-24 text-lg"
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type your message..."
              placeholderTextColor="#A0A0A0"
              multiline
            />
            
            <TouchableOpacity 
              className={`w-10 h-10 rounded-2xl justify-center items-center ${
                messageText.trim() ? 'bg-blue-500' : 'bg-gray-400'
              }`}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Ionicons name="send" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
  
  const renderShareDataSection = () => (
    <View className="p-4 mb-6">
      <Text className="text-2xl font-bold text-gray-800 mb-4">Share Data with Doctors</Text>
      
      <View className="flex-row justify-between">
        <TouchableOpacity className="bg-white rounded-xl p-4 items-center w-[30%] shadow-sm">
          <View className="w-12 h-12 bg-blue-50 rounded-full justify-center items-center mb-2">
            <Ionicons name="document-text" size={28} color="#4A90E2" />
          </View>
          <Text className="text-base font-medium text-gray-800 text-center">Seizure Reports</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-white rounded-xl p-4 items-center w-[30%] shadow-sm">
          <View className="w-12 h-12 bg-green-50 rounded-full justify-center items-center mb-2">
            <Ionicons name="medkit" size={28} color="#27AE60" />
          </View>
          <Text className="text-base font-medium text-gray-800 text-center">Medication Log</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-white rounded-xl p-4 items-center w-[30%] shadow-sm">
          <View className="w-12 h-12 bg-yellow-50 rounded-full justify-center items-center mb-2">
            <Ionicons name="videocam" size={28} color="#F39C12" />
          </View>
          <Text className="text-base font-medium text-gray-800 text-center">Seizure Videos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="flex-row items-center justify-between p-2 bg-blue-50 ">
        <TouchableOpacity 
          className="p-2"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#4A90E2" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-800">Doctor Connect</Text>
        <View className="w-10" />
      </View>

      <View className="flex-row bg-blue-50 mb-4">
        <TouchableOpacity 
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'doctors' ? 'border-blue-500' : 'border-transparent'
          }`}
          onPress={() => setActiveTab('doctors')}
        >
          <Text className={`text-xl font-medium ${
            activeTab === 'doctors' ? 'text-blue-500 font-bold' : 'text-gray-600'
          }`}>
            My Doctors
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'messages' ? 'border-blue-500' : 'border-transparent'
          }`}
          onPress={() => setActiveTab('messages')}
        >
          <Text className={`text-xl font-medium ${
            activeTab === 'messages' ? 'text-blue-500 font-bold' : 'text-gray-600'
          }`}>
            Messages
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'doctors' ? (
        <>
          {renderDoctorsList()}
          {renderShareDataSection()}
        </>
      ) : (
        renderMessagesTab()
      )}
    </SafeAreaView>
  );
}