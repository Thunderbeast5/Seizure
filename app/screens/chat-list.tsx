import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { chatService, Chat } from '@/services/chatService';
import { router } from 'expo-router';
import { Unsubscribe } from 'firebase/firestore';

interface ChatListScreenProps {
  onBack?: () => void;
}

export default function ChatListScreen({ onBack }: ChatListScreenProps) {
  const authContext = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const user = authContext?.user;
  const userData = authContext?.userData;

  // Real-time listener for chats
  useEffect(() => {
    if (!user?.uid) return;

    let unsubscribe: Unsubscribe;

    const setupListener = async () => {
      try {
        unsubscribe = chatService.subscribeToUserChats(
          user.uid,
          'patient',
          (updatedChats) => {
            setChats(updatedChats);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Error setting up chat listener:', error);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.uid]);

  const handleRefresh = useCallback(async () => {
    if (!user?.uid) return;

    setRefreshing(true);
    try {
      const userChats = await chatService.getUserChats(user.uid, 'patient');
      setChats(userChats);
    } catch (error) {
      console.error('Error refreshing chats:', error);
      Alert.alert('Error', 'Failed to refresh chats');
    } finally {
      setRefreshing(false);
    }
  }, [user?.uid]);

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

  const formatLastMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
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
              Dr. {item.doctorName}
            </Text>
            {item.lastMessageTime && (
              <Text className="text-xs text-gray-500">
                {formatLastMessageTime(item.lastMessageTime)}
              </Text>
            )}
          </View>
          
          {item.lastMessage && (
            <Text className="text-gray-600 text-sm" numberOfLines={2}>
              {item.lastMessage}
            </Text>
          )}
          
          {!item.lastMessage && (
            <Text className="text-gray-400 text-sm italic">
              Start a conversation...
            </Text>
          )}
        </View>

        {item.unreadCount && item.unreadCount > 0 && (
          <View className="bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center ml-2">
            <Text className="text-white text-xs font-bold">
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <Ionicons name="chatbubbles-outline" size={80} color="#9CA3AF" />
      <Text className="text-xl font-semibold text-gray-700 mt-4 text-center">
        No Conversations Yet
      </Text>
      <Text className="text-gray-500 text-center mt-2 leading-6">
        Once you connect with a doctor, you will be able to chat with them here.
      </Text>
      <TouchableOpacity
        className="bg-blue-500 px-6 py-3 rounded-xl mt-6"
        onPress={() => router.push('/screens/doctor-connect')}
      >
        <Text className="text-white font-semibold">Find a Doctor</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          {onBack && (
            <TouchableOpacity onPress={onBack} className="p-2">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
          )}
          <Text className="text-xl font-bold text-gray-900">Messages</Text>
          <View className="w-10" />
        </View>
        
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        {onBack && (
          <TouchableOpacity onPress={onBack} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
        )}
        <Text className="text-xl font-bold text-gray-900">Messages</Text>
        <TouchableOpacity onPress={handleRefresh} className="p-2">
          <Ionicons name="refresh" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id || ''}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
