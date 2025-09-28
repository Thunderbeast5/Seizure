import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { chatService, ChatMessage } from '@/services/chatService';
import { router, useLocalSearchParams } from 'expo-router';
import { Unsubscribe } from 'firebase/firestore';

export default function ChatConversationScreen() {
  const authContext = useAuth();
  const user = authContext?.user;
  const userProfile = authContext?.userData;
  const params = useLocalSearchParams();
  const { chatId, doctorName, patientName } = params;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Real-time listener for messages
  useEffect(() => {
    if (!chatId || typeof chatId !== 'string') return;

    let unsubscribe: Unsubscribe;

    const setupListener = async () => {
      try {
        unsubscribe = chatService.subscribeToChatMessages(
          chatId,
          (updatedMessages) => {
            setMessages(updatedMessages);
            setLoading(false);
            
            // Scroll to bottom when new messages arrive
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        );
      } catch (error) {
        console.error('Error setting up messages listener:', error);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatId]);

  // Mark messages as read when screen is focused
  useEffect(() => {
    if (!chatId || !user?.uid || typeof chatId !== 'string') return;

    const markAsRead = async () => {
      try {
        await chatService.markMessagesAsRead(chatId, user.uid);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markAsRead();
  }, [chatId, user?.uid, messages]);

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !user?.uid || !chatId || typeof chatId !== 'string') return;

    const message = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      const patientDisplayName = userProfile?.name || 'Patient';
      
      await chatService.sendMessage(
        chatId,
        user.uid,
        'patient',
        patientDisplayName,
        message
      );
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setMessageText(message); // Restore message text on error
    } finally {
      setSending(false);
    }
  }, [messageText, user?.uid, chatId, userProfile]);

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMyMessage = item.senderId === user?.uid;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = !previousMessage || 
      formatMessageDate(item.timestamp) !== formatMessageDate(previousMessage.timestamp);

    return (
      <View>
        {showDateSeparator && (
          <View className="items-center my-4">
            <Text className="text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full">
              {formatMessageDate(item.timestamp)}
            </Text>
          </View>
        )}
        
        <View className={`flex-row mb-3 px-4 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
          <View className={`max-w-[80%] ${isMyMessage ? 'items-end' : 'items-start'}`}>
            <View
              className={`px-4 py-3 rounded-2xl ${
                isMyMessage
                  ? 'bg-blue-500 rounded-br-md'
                  : 'bg-gray-200 rounded-bl-md'
              }`}
            >
              <Text className={`text-base ${isMyMessage ? 'text-white' : 'text-gray-900'}`}>
                {item.message}
              </Text>
            </View>
            
            <View className="flex-row items-center mt-1">
              <Text className="text-xs text-gray-500">
                {formatMessageTime(item.timestamp)}
              </Text>
              {isMyMessage && (
                <Ionicons
                  name={item.read ? 'checkmark-done' : 'checkmark'}
                  size={12}
                  color={item.read ? '#3B82F6' : '#9CA3AF'}
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <Ionicons name="chatbubble-outline" size={60} color="#9CA3AF" />
      <Text className="text-lg font-semibold text-gray-700 mt-4 text-center">
        Start the conversation
      </Text>
      <Text className="text-gray-500 text-center mt-2">
        Send a message to Dr. {doctorName}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            Dr. {doctorName}
          </Text>
        </View>
        
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          
          <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="medical" size={20} color="#3B82F6" />
          </View>
          
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              Dr. {doctorName}
            </Text>
            <Text className="text-sm text-gray-500">
              Treating {patientName}
            </Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id || ''}
          contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Message Input */}
        <View className="flex-row items-end px-4 py-3 bg-white border-t border-gray-200">
          <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 mr-3">
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={1000}
              className="text-base text-gray-900 max-h-24"
              style={{ minHeight: 20 }}
            />
          </View>
          
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sending}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              messageText.trim() && !sending ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={messageText.trim() ? 'white' : '#9CA3AF'}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
