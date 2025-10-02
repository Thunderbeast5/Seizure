import { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { chatService, ChatMessage } from './chatService';
import { notificationService } from './notificationService';
import * as Notifications from 'expo-notifications';
import { UrgentMessageHandler } from './urgentMessageHandler';

interface RealtimeMessageHook {
  urgentMessages: ChatMessage[];
  hasUnreadUrgent: boolean;
  clearUrgentMessage: (messageId: string) => void;
  markAllAsRead: () => void;
}

export const useRealtimeMessages = (
  userId: string,
  userType: 'doctor' | 'patient'
): RealtimeMessageHook => {
  const [urgentMessages, setUrgentMessages] = useState<ChatMessage[]>([]);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [processedMessageIds] = useState(new Set<string>());

  console.log('useRealtimeMessages initialized for user:', userId, 'type:', userType);

  // Check for urgent messages
  const checkUrgentMessages = useCallback(async () => {
    try {
      if (!userId || userId === 'undefined') {
        console.warn('checkUrgentMessages called with invalid userId:', userId);
        return;
      }

      const messages = await chatService.getUnreadUrgentMessages(userId, userType);
      setUrgentMessages(messages);
      
      // If app is in background and there are new urgent messages, send notification
      if (appState !== 'active' && messages.length > 0) {
        const latestMessage = messages[0];
        if (latestMessage.messageType === 'seizure_alert') {
          await notificationService.sendSeizureMessageNotification(
            latestMessage.senderName,
            latestMessage.message,
            latestMessage.seizureId || '',
            '' // We'll need to derive chatId
          );
        }
      }
    } catch (error) {
      console.error('Error checking urgent messages:', error);
    }
  }, [userId, userType, appState]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('App state changed from', appState, 'to', nextAppState);
      setAppState(nextAppState);
      
      // Check for urgent messages when app becomes active (foreground)
      if (nextAppState === 'active') {
        console.log('App became active, checking for urgent messages...');
        // Add a small delay to ensure Firebase listeners are ready
        setTimeout(() => {
          checkUrgentMessages();
        }, 500);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [checkUrgentMessages]);

  // Set up real-time listeners for user's chats
  useEffect(() => {
    let unsubscribers: (() => void)[] = [];

    const setupRealtimeListeners = async () => {
      try {
        if (!userId) {
          console.log('No userId provided, skipping real-time listeners setup');
          return;
        }

        console.log('Setting up real-time listeners for user:', userId);
        // Get user's chats and set up listeners for each
        const chats = await chatService.getUserChats(userId, userType);
        console.log('Found chats for user:', chats.length);
        
        for (const chat of chats) {
          if (chat.id) {
            const unsubscribe = chatService.subscribeToChatMessages(
              chat.id,
              (messages) => {
                // Filter for new urgent messages
                const newUrgentMessages = messages.filter(msg => 
                  !msg.read && 
                  msg.isUrgent && 
                  msg.senderId !== userId &&
                  msg.id && // Ensure message has ID
                  !processedMessageIds.has(msg.id) && // Not already processed
                  // Only messages from the last 2 minutes to avoid old messages
                  new Date().getTime() - new Date(msg.timestamp?.toDate?.() || msg.timestamp).getTime() < 2 * 60 * 1000
                );

                if (newUrgentMessages.length > 0) {
                  // Mark messages as processed to prevent duplicates
                  newUrgentMessages.forEach(msg => {
                    if (msg.id) processedMessageIds.add(msg.id);
                  });

                  setUrgentMessages(prev => {
                    const existingIds = new Set(prev.map(m => m.id));
                    const uniqueNew = newUrgentMessages.filter(m => !existingIds.has(m.id));
                    return [...prev, ...uniqueNew].sort((a, b) => 
                      new Date(b.timestamp?.toDate?.() || b.timestamp).getTime() - 
                      new Date(a.timestamp?.toDate?.() || a.timestamp).getTime()
                    );
                  });

                  // Use global handler for immediate modal display
                  const latestMessage = newUrgentMessages[0];
                  console.log('Real-time: Processing urgent message via global handler:', latestMessage.id);
                  
                  // Use global handler to bypass React state delays
                  UrgentMessageHandler.handleUrgentMessage(latestMessage);
                }
              },
              10 // Limit to recent messages
            );
            
            unsubscribers.push(unsubscribe);
          }
        }
      } catch (error) {
        console.error('Error setting up realtime listeners:', error);
      }
    };

    if (userId) {
      setupRealtimeListeners();
    }

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [userId, userType, appState]);

  // Handle notification responses
  useEffect(() => {
    const responseSubscription = notificationService.addNotificationResponseListener(
      (response) => {
        const data = response.notification.request.content.data;
        
        if (data?.messageType === 'seizure_alert' && data?.chatId) {
          // Navigate to chat or handle the response
          console.log('User tapped seizure alert notification:', data);
        }
      }
    );

    return () => responseSubscription.remove();
  }, []);

  const clearUrgentMessage = useCallback((messageId: string) => {
    setUrgentMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      // Mark all urgent messages as read
      for (const message of urgentMessages) {
        if (message.id) {
          // We'd need to implement a method to mark individual messages as read
          // For now, we'll clear them locally
          console.log(`Marking message ${message.id} as read`);
        }
      }
      setUrgentMessages([]);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [urgentMessages]);

  return {
    urgentMessages,
    hasUnreadUrgent: urgentMessages.length > 0,
    clearUrgentMessage,
    markAllAsRead,
  };
};

// Service class for managing realtime messages
class RealtimeMessageService {
  private static instance: RealtimeMessageService;
  private listeners: Map<string, () => void> = new Map();

  static getInstance(): RealtimeMessageService {
    if (!RealtimeMessageService.instance) {
      RealtimeMessageService.instance = new RealtimeMessageService();
    }
    return RealtimeMessageService.instance;
  }

  // Initialize realtime message monitoring for a user
  async initializeForUser(
    userId: string,
    userType: 'doctor' | 'patient',
    onUrgentMessage: (message: ChatMessage) => void
  ): Promise<void> {
    try {
      // Clean up existing listeners
      this.cleanup(userId);

      // Get user's chats
      const chats = await chatService.getUserChats(userId, userType);
      
      for (const chat of chats) {
        if (chat.id) {
          const unsubscribe = chatService.subscribeToChatMessages(
            chat.id,
            (messages) => {
              // Find new urgent messages
              const urgentMessages = messages.filter(msg => 
                !msg.read && 
                msg.isUrgent && 
                msg.senderId !== userId &&
                new Date().getTime() - new Date(msg.timestamp?.toDate?.() || msg.timestamp).getTime() < 2 * 60 * 1000
              );

              urgentMessages.forEach(onUrgentMessage);
            },
            5
          );
          
          this.listeners.set(`${userId}_${chat.id}`, unsubscribe);
        }
      }
    } catch (error) {
      console.error('Error initializing realtime messages:', error);
    }
  }

  // Cleanup listeners for a user
  cleanup(userId: string): void {
    for (const [key, unsubscribe] of this.listeners.entries()) {
      if (key.startsWith(userId)) {
        unsubscribe();
        this.listeners.delete(key);
      }
    }
  }

  // Cleanup all listeners
  cleanupAll(): void {
    for (const unsubscribe of this.listeners.values()) {
      unsubscribe();
    }
    this.listeners.clear();
  }
}

export const realtimeMessageService = RealtimeMessageService.getInstance();
