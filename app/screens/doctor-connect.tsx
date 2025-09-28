import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConnectionRequests } from '../../components/ConnectionRequests';
import { PatientIdDisplay } from '../../components/PatientIdDisplay';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { doctorService } from '../../services/doctorService';
import { chatService, Chat } from '../../services/chatService';
import { router } from 'expo-router';

export default function DoctorConnect() {
  const navigation = useNavigation();
  const authContext = useAuth();
  const user = authContext?.user;
  const { assignDoctor } = useProfile();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showPatientId, setShowPatientId] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);

  const loadDoctors = useCallback(async () => {
    try {
      setLoading(true);
      // Load chats
      if (user?.uid) {
        const userChats = await chatService.getUserChats(user.uid, 'patient');
        setChats(userChats);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      Alert.alert('Error', 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadDoctors();
    }
  }, [user?.uid, loadDoctors]);

  const handleSearchDoctors = async () => {
    if (!searchTerm.trim()) return;
    try {
      setSearching(true);
      const results = await doctorService.getAllDoctors();
      const filteredResults = results.filter((doctor) =>
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
    } catch (error) {
      console.error('Error assigning doctor:', error);
      Alert.alert('Error', 'Failed to assign doctor');
    }
  };


  const formatLastMessageTime = (timestamp: any): string => {
    try {
      if (!timestamp) return '';
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInHours * 60);
        return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  const handleChatPress = (chat: Chat) => {
    router.push({
      pathname: '/screens/chat-conversation',
      params: {
        chatId: chat.id,
        doctorName: chat.doctorName,
        patientName: chat.patientName,
      },
    });
  };


  const renderDoctorChats = () => {
    if (!chats || chats.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-8 py-16">
          <Ionicons name="chatbubbles-outline" size={80} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-700 mt-4 text-center">
            No Conversations Yet
          </Text>
          <Text className="text-gray-500 text-center mt-2 leading-6">
            Connect with a doctor to start chatting about your care.
          </Text>
        </View>
      );
    }

    // Filter and validate chats data
    const validChats = chats.filter(chat => {
      return chat && 
             typeof chat === 'object' && 
             chat.doctorName && 
             typeof chat.doctorName === 'string';
    });

    if (validChats.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-8 py-16">
          <Ionicons name="chatbubbles-outline" size={80} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-700 mt-4 text-center">
            No Valid Conversations
          </Text>
          <Text className="text-gray-500 text-center mt-2 leading-6">
            Connect with a doctor to start chatting about your care.
          </Text>
        </View>
      );
    }
    
    return (
      <FlatList
        data={validChats}
        keyExtractor={(item, index) => {
          if (item && item.id) {
            return String(item.id);
          }
          return `chat-${index}`;
        }}
        renderItem={({ item, index }) => {
          // Safety check
          if (!item) {
            return (
              <View key={`empty-${index}`} style={{ height: 1 }} />
            );
          }
          
          // Extract and validate data
          const doctorName = String(item.doctorName || 'Unknown Doctor');
          const lastMessage = item.lastMessage ? String(item.lastMessage) : '';
          const unreadCount = typeof item.unreadCount === 'number' ? item.unreadCount : 0;
          const timeString = item.lastMessageTime ? formatLastMessageTime(item.lastMessageTime) : '';
          
          return (
            <TouchableOpacity
              key={item.id || `chat-${index}`}
              className="bg-white mx-4 mb-3 rounded-xl p-4 shadow-sm border border-gray-100"
              onPress={() => handleChatPress(item)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="medical" size={24} color="#3B82F6" />
                </View>
                
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-lg font-semibold text-gray-900">
                      <Text>Dr. </Text>
                      <Text>{doctorName}</Text>
                    </Text>
                    {timeString !== '' && (
                      <Text className="text-xs text-gray-500">
                        {timeString}
                      </Text>
                    )}
                  </View>
                  
                  {lastMessage !== '' ? (
                    <Text className="text-gray-600 text-sm" numberOfLines={2}>
                      {lastMessage}
                    </Text>
                  ) : (
                    <Text className="text-gray-400 text-sm italic">
                      Start a conversation...
                    </Text>
                  )}
                </View>

                {unreadCount > 0 && (
                  <View className="bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center ml-2">
                    <Text className="text-white text-xs font-bold">
                      {unreadCount > 99 ? '99+' : String(unreadCount)}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
      />
    );
  };


  const renderSearchModal = () => (
    <Modal
      visible={showSearchModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => setShowSearchModal(false)} className="p-2">
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Search Doctors</Text>
          <View className="w-10" />
        </View>
        
        <View className="p-4">
          <View className="flex-row mb-3">
            <View className="flex-1 mr-2">
              <TextInput
                className="border border-slate-300 rounded-lg px-4 py-2 text-base text-slate-900 bg-white"
                placeholder="Search doctors by name..."
                placeholderTextColor="#9CA3AF"
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={handleSearchDoctors}
              />
            </View>
            <TouchableOpacity
              className={`bg-blue-600 rounded-lg px-4 py-2 justify-center items-center ${searching || !searchTerm.trim() ? 'opacity-50' : ''}`}
              onPress={handleSearchDoctors}
              disabled={searching || !searchTerm.trim()}
            >
              {searching ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="search" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
          
          {searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item: doctor }) => (
                <View className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between border border-slate-200">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-full bg-blue-50 justify-center items-center mr-3">
                      <Text className="text-xl font-bold text-blue-600">
                        {doctor.name?.charAt(0).toUpperCase() || 'D'}
                      </Text>
                    </View>
                    <View>
                      <Text className="font-bold text-slate-800">{doctor.name || 'Unknown'}</Text>
                      <Text className="text-slate-600">{doctor.specialty || 'General'}</Text>
                      <Text className="text-slate-400 text-xs">{doctor.hospital || 'Unknown Hospital'}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    className="bg-green-500 px-3 py-2 rounded-lg"
                    onPress={() => handleAssignDoctor(doctor.id)}
                  >
                    <Text className="text-white font-semibold">Connect</Text>
                  </TouchableOpacity>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderRequestsModal = () => (
    <Modal
      visible={showRequestsModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => setShowRequestsModal(false)} className="p-2">
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Connection Requests</Text>
          <View className="w-10" />
        </View>
        
        <View className="p-4">
          <ConnectionRequests />
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderPatientIdModal = () => (
    <Modal
      visible={showPatientId}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => setShowPatientId(false)} className="p-2">
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Patient ID</Text>
          <View className="w-10" />
        </View>
        
        <View className="p-4">
          <PatientIdDisplay />
        </View>
      </SafeAreaView>
    </Modal>
  );

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
              Doctor Connect
            </Text>
          </View>
          
          {/* Header Icons */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => setShowSearchModal(true)}
              style={{
                padding: Platform.OS === 'android' ? 6 : 4,
                marginRight: 6,
                minWidth: Platform.OS === 'android' ? 32 : 28,
                minHeight: Platform.OS === 'android' ? 32 : 28,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: Platform.OS === 'android' ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
                borderRadius: Platform.OS === 'android' ? 6 : 0,
              }}
            >
              <Ionicons name="search" size={Platform.OS === 'android' ? 20 : 22} color="#4A90E2" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setShowRequestsModal(true)}
              style={{
                padding: Platform.OS === 'android' ? 6 : 4,
                marginRight: 6,
                minWidth: Platform.OS === 'android' ? 32 : 28,
                minHeight: Platform.OS === 'android' ? 32 : 28,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: Platform.OS === 'android' ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
                borderRadius: Platform.OS === 'android' ? 6 : 0,
              }}
            >
              <Ionicons name="people-outline" size={Platform.OS === 'android' ? 20 : 22} color="#4A90E2" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setShowPatientId(true)}
              style={{
                padding: Platform.OS === 'android' ? 6 : 4,
                minWidth: Platform.OS === 'android' ? 32 : 28,
                minHeight: Platform.OS === 'android' ? 32 : 28,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: Platform.OS === 'android' ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
                borderRadius: Platform.OS === 'android' ? 6 : 0,
              }}
            >
              <Ionicons name="help-circle-outline" size={Platform.OS === 'android' ? 20 : 22} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={{ fontSize: 18, color: '#64748B', marginTop: 16 }}>Loading doctors...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            Doctor Connect
          </Text>
        </View>
        
        {/* Header Icons */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => setShowSearchModal(true)}
            style={{
              padding: Platform.OS === 'android' ? 6 : 4,
              marginRight: 6,
              minWidth: Platform.OS === 'android' ? 32 : 28,
              minHeight: Platform.OS === 'android' ? 32 : 28,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: Platform.OS === 'android' ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
              borderRadius: Platform.OS === 'android' ? 6 : 0,
            }}
          >
            <Ionicons name="search" size={Platform.OS === 'android' ? 20 : 22} color="#4A90E2" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowRequestsModal(true)}
            style={{
              padding: Platform.OS === 'android' ? 6 : 4,
              marginRight: 6,
              minWidth: Platform.OS === 'android' ? 32 : 28,
              minHeight: Platform.OS === 'android' ? 32 : 28,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: Platform.OS === 'android' ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
              borderRadius: Platform.OS === 'android' ? 6 : 0,
            }}
          >
            <Ionicons name="people-outline" size={Platform.OS === 'android' ? 20 : 22} color="#4A90E2" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowPatientId(true)}
            style={{
              padding: Platform.OS === 'android' ? 6 : 4,
              minWidth: Platform.OS === 'android' ? 32 : 28,
              minHeight: Platform.OS === 'android' ? 32 : 28,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: Platform.OS === 'android' ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
              borderRadius: Platform.OS === 'android' ? 6 : 0,
            }}
          >
            <Ionicons name="help-circle-outline" size={Platform.OS === 'android' ? 20 : 22} color="#4A90E2" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Subtitle */}
      <Text 
        style={{
          fontSize: 18,
          color: '#64748B',
          textAlign: 'center',
          marginBottom: 16,
          paddingHorizontal: 16,
        }}
      >
        Your doctor conversations
      </Text>
      
      {/* Main Content - Doctor Chats */}
      <View style={{ flex: 1 }}>
        {renderDoctorChats()}
      </View>
      
      {/* Modals */}
      {renderSearchModal()}
      {renderRequestsModal()}
      {renderPatientIdModal()}
    </SafeAreaView>
  );
}