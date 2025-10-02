import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../services/chatService';
import { notificationService } from '../services/notificationService';

interface UrgentMessageModalProps {
  visible: boolean;
  message: ChatMessage | null;
  onClose: () => void;
  onOpenChat: (chatId: string) => void;
}

const { width, height } = Dimensions.get('window');

export const UrgentMessageModal: React.FC<UrgentMessageModalProps> = ({
  visible,
  message,
  onClose,
  onOpenChat,
}) => {
  const [slideAnim] = useState(new Animated.Value(height));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible && message) {
      // Faster slide up animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200, // Faster animation
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200, // Faster animation
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 10 seconds if not urgent
      if (!message.isUrgent) {
        const timer = setTimeout(() => {
          handleClose();
        }, 10000);

        return () => clearTimeout(timer);
      }
    } else {
      // Faster slide down animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 200, // Faster animation
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200, // Faster animation
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, message]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 200, // Faster animation
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200, // Faster animation
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleOpenChat = () => {
    if (message?.seizureId) {
      // Generate chat ID from doctor and patient IDs
      const chatId = `${message.senderId}_${message.seizureId}`;
      onOpenChat(chatId);
    }
    handleClose();
  };

  const getMessageIcon = () => {
    switch (message?.messageType) {
      case 'seizure_alert':
        return 'medical';
      case 'medical_advice':
        return 'heart';
      default:
        return 'chatbubble';
    }
  };

  const getMessageColor = () => {
    if (message?.isUrgent) return '#FF4444';
    switch (message?.messageType) {
      case 'seizure_alert':
        return '#FF6B35';
      case 'medical_advice':
        return '#4A90E2';
      default:
        return '#34C759';
    }
  };

  if (!message) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: opacityAnim,
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            paddingBottom: 40,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: getMessageColor() }}
              >
                <Ionicons
                  name={getMessageIcon()}
                  size={20}
                  color="white"
                />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-900">
                  {message.isUrgent ? '🚨 Urgent Message' : '💬 New Message'}
                </Text>
                <Text className="text-sm text-gray-600">
                  From Dr. {message.senderName}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              onPress={handleClose}
              className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
            >
              <Ionicons name="close" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Message Content */}
          <View className="bg-gray-50 rounded-lg p-4 mb-4">
            {message.seizureId && (
              <View className="flex-row items-center mb-2">
                <Ionicons name="pulse" size={16} color="#FF6B35" />
                <Text className="text-sm text-gray-600 ml-2">
                  About your recent seizure
                </Text>
              </View>
            )}
            
            <Text className="text-base text-gray-900 leading-6">
              {message.message}
            </Text>
            
            <Text className="text-xs text-gray-500 mt-2">
              {new Date(message.timestamp?.toDate?.() || message.timestamp).toLocaleString()}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleOpenChat}
              className="flex-1 bg-blue-500 rounded-lg py-3 items-center"
            >
              <Text className="text-white font-semibold">
                Open Chat
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
            >
              <Text className="text-gray-700 font-semibold">
                Dismiss
              </Text>
            </TouchableOpacity>
          </View>

          {/* Urgent Message Warning */}
          {message.isUrgent && (
            <View className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
              <View className="flex-row items-center">
                <Ionicons name="warning" size={16} color="#DC2626" />
                <Text className="text-sm text-red-700 ml-2 font-medium">
                  This is an urgent medical message that requires your attention.
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
