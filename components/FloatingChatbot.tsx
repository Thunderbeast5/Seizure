import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface FloatingChatbotProps {
  apiEndpoint?: string;
  style?: any;
  position?: {
    bottom?: number;
    top?: number;
    left?: number;
    right?: number;
  };
  buttonSize?: number;
  buttonColor?: string;
  chatPosition?: 'center' | 'near-button'; // New prop to control chat position
}

const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ 
  apiEndpoint = 'https://your-api-endpoint.com/chat',
  style,
  position = { bottom: 20, right: 20 },
  buttonSize = 56,
  buttonColor = '#3B82F6',
  chatPosition = 'center' // Default to center
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your seizure support assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Using native Modal animations for better compatibility with Expo SDK 54

  const animateButton = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();
  };

  const toggleChat = () => {
    animateButton();
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Mock responses for demonstration - replace with real API call when ready
      const mockResponses = [
        "I understand you're asking about seizures. Can you tell me more about your specific concern?",
        "For seizure management, it's important to track patterns and triggers. Have you been keeping a seizure diary?",
        "If you're experiencing frequent seizures, please consult with your healthcare provider immediately.",
        "Medication adherence is crucial for seizure control. Are you taking your medications as prescribed?",
        "Stress and lack of sleep can be seizure triggers. Are you getting enough rest?",
        "I recommend discussing this with your doctor. They can provide personalized medical advice.",
        "Emergency services should be called if a seizure lasts longer than 5 minutes or if the person is injured.",
        "Thank you for sharing. Is there anything specific about seizure management you'd like to know more about?"
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Chatbot error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I\'m sorry, I\'m having trouble right now. Please try again later.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Hello! I\'m your seizure support assistant. How can I help you today?',
        isUser: false,
        timestamp: new Date(),
      }
    ]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const containerStyle = {
    position: 'absolute' as const,
    zIndex: 1000,
    ...position,
    ...style,
  };

  // Render centered chat modal
  const renderCenteredChat = () => (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={toggleChat}
      statusBarTranslucent={false}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <View
          style={{
            width: Math.min(screenWidth - 40, 400),
            height: Math.min(screenHeight * 0.8, 600),
            backgroundColor: 'white',
            borderRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          {/* Chat Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 20,
            backgroundColor: buttonColor,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 40,
                height: 40,
                backgroundColor: 'white',
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Ionicons name="chatbubble" size={20} color={buttonColor} />
              </View>
              <View>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
                  Support Assistant
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  Online • Ready to help
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity 
                onPress={clearChat} 
                style={{ 
                  marginRight: 16,
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }}
              >
                <Ionicons name="refresh" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={toggleChat}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages Container */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              ref={scrollViewRef}
              style={{ flex: 1, padding: 20 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={{
                    marginBottom: 16,
                    alignItems: message.isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <View
                    style={{
                      maxWidth: '85%',
                      padding: 16,
                      borderRadius: 20,
                      backgroundColor: message.isUser ? buttonColor : '#F8F9FA',
                      borderBottomRightRadius: message.isUser ? 6 : 20,
                      borderBottomLeftRadius: message.isUser ? 20 : 6,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        lineHeight: 22,
                        color: message.isUser ? 'white' : '#1F2937',
                      }}
                    >
                      {message.text}
                    </Text>
                  </View>
                  <Text style={{
                    fontSize: 12,
                    color: '#9CA3AF',
                    marginTop: 6,
                    marginHorizontal: 12,
                  }}>
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
              ))}
              
              {isLoading && (
                <View style={{ alignItems: 'flex-start', marginBottom: 16 }}>
                  <View style={{
                    backgroundColor: '#F8F9FA',
                    padding: 16,
                    borderRadius: 20,
                    borderBottomLeftRadius: 6,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ActivityIndicator size="small" color={buttonColor} />
                      <Text style={{ color: '#6B7280', marginLeft: 8, fontSize: 16 }}>
                        Assistant is typing...
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input Area */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 20,
              borderTopWidth: 1,
              borderTopColor: '#F3F4F6',
              backgroundColor: 'white',
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            }}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                style={{
                  flex: 1,
                  backgroundColor: '#F9FAFB',
                  borderRadius: 25,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  marginRight: 12,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                }}
                multiline={false}
                onSubmitEditing={sendMessage}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: inputText.trim() && !isLoading ? buttonColor : '#E5E7EB',
                  shadowColor: inputText.trim() && !isLoading ? buttonColor : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: inputText.trim() && !isLoading ? 4 : 0,
                }}
              >
                <Ionicons 
                  name="send" 
                  size={22} 
                  color={inputText.trim() && !isLoading ? 'white' : '#9CA3AF'} 
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );

  // Render near-button chat (original implementation)
  const renderNearButtonChat = () => {
    const chatBoxWidth = Math.min(screenWidth - 40, 350);
    const chatBoxHeight = Math.min(screenHeight * 0.6, 500);
    const buttonHeight = buttonSize;
    
    let chatPosition: any = {};
    
    if (position.bottom !== undefined) {
      chatPosition.bottom = position.bottom + buttonHeight + 10;
    } else if (position.top !== undefined) {
      chatPosition.top = position.top + buttonHeight + 10;
    }
    
    if (position.right !== undefined) {
      chatPosition.right = position.right;
      if (position.right + chatBoxWidth > screenWidth) {
        chatPosition.right = screenWidth - chatBoxWidth - 20;
      }
    } else if (position.left !== undefined) {
      chatPosition.left = position.left;
      if (position.left + chatBoxWidth > screenWidth) {
        chatPosition.left = screenWidth - chatBoxWidth - 20;
      }
    }

    return (
      <Animated.View
        style={{
          position: 'absolute',
          backgroundColor: 'white',
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 10,
          width: chatBoxWidth,
          height: chatBoxHeight,
          ...chatPosition,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [400, 0],
              }),
            },
            {
              scale: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
          opacity: slideAnim,
        }}
      >
        {/* Same content as centered chat but smaller */}
        {/* ... (original chat content) ... */}
      </Animated.View>
    );
  };

  return (
    <View style={containerStyle}>
      {/* Render chat based on position preference */}
      {chatPosition === 'center' ? renderCenteredChat() : (isOpen && renderNearButtonChat())}

      {/* Floating Chat Button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={toggleChat}
          style={{
            width: buttonSize,
            height: buttonSize,
            backgroundColor: buttonColor,
            borderRadius: buttonSize / 2,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons 
            name={isOpen ? "close" : "chatbubble-ellipses"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Badge for new messages */}
      {!isOpen && (
        <View style={{
          position: 'absolute',
          top: -4,
          right: -4,
          width: 20,
          height: 20,
          backgroundColor: '#EF4444',
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>!</Text>
        </View>
      )}
    </View>
  );
};

export default FloatingChatbot;