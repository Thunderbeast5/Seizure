import React, { useEffect, useState, useCallback } from 'react';
import { View, AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { notificationService } from '../services/notificationService';
import { useRealtimeMessages } from '../services/realtimeMessageService';
import { UrgentMessageModal } from './UrgentMessageModal';
import { EmergencyStatusModal } from './EmergencyStatusModal';
import { ChatMessage } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';
import { UrgentMessageHandler } from '../services/urgentMessageHandler';
import { patientNotificationService, PatientNotification } from '../services/patientNotificationService';

interface AppWrapperProps {
  children: React.ReactNode;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentUrgentMessage, setCurrentUrgentMessage] = useState<ChatMessage | null>(null);
  const [showUrgentModal, setShowUrgentModal] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  
  // Emergency status notification state
  const [currentEmergencyNotification, setCurrentEmergencyNotification] = useState<PatientNotification | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Use realtime messages hook
  const { urgentMessages, clearUrgentMessage } = useRealtimeMessages(
    user?.uid || '',
    'patient'
  );

  // Global modal handler function that bypasses React state delays
  const forceShowModal = useCallback((message: ChatMessage) => {
    console.log('AppWrapper: Force showing modal for message:', message.id);
    setCurrentUrgentMessage(message);
    setShowUrgentModal(true);
  }, []);

  // Register the global modal handler
  useEffect(() => {
    UrgentMessageHandler.registerModalHandler(forceShowModal);
    return () => {
      UrgentMessageHandler.unregisterModalHandler();
    };
  }, [forceShowModal]);

  // Initialize notifications and patient notifications on app start
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await notificationService.requestPermissions();
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();

    // Start listening for patient notifications
    if (user?.uid) {
      console.log('Starting patient notification listener for user:', user.uid);
      patientNotificationService.startListening(
        user.uid,
        (notification) => {
          console.log('Emergency status notification received:', notification);
          setCurrentEmergencyNotification(notification);
          setShowEmergencyModal(true);
        }
      );
    }

    return () => {
      patientNotificationService.stopListening();
    };
  }, [user?.uid]);

  // Handle notification responses (when user taps notification)
  useEffect(() => {
    const responseSubscription = notificationService.addNotificationResponseListener(
      async (response) => {
        console.log('Notification tapped:', response);
        const data = response.notification.request.content.data;
        
        if (data?.messageType === 'seizure_alert' || data?.type === 'urgent_medical') {
          console.log('Urgent notification tapped, checking for messages...');
          // When user taps notification, check for urgent messages and show modal
          if (user?.uid) {
            try {
              const messages = await chatService.getUnreadUrgentMessages(user.uid, 'patient');
              if (messages.length > 0) {
                const latestMessage = messages[0];
                console.log('Showing modal from notification tap:', latestMessage);
                setCurrentUrgentMessage(latestMessage);
                setShowUrgentModal(true);
              }
            } catch (error) {
              console.error('Error handling notification response:', error);
            }
          }
        }
      }
    );

    // Also handle foreground notifications (when app is open)
    const foregroundSubscription = notificationService.addNotificationReceivedListener(
      async (notification) => {
        console.log('Foreground notification received:', notification);
        const data = notification.request.content.data;
        
        if (data?.messageType === 'seizure_alert' || data?.type === 'urgent_medical') {
          console.log('Urgent foreground notification received, forcing modal show...');
          // Force show modal immediately for foreground notifications
          if (user?.uid) {
            try {
              const messages = await chatService.getUnreadUrgentMessages(user.uid, 'patient');
              if (messages.length > 0) {
                const latestMessage = messages[0];
                console.log('Force showing modal from foreground notification:', latestMessage);
                setCurrentUrgentMessage(latestMessage);
                setShowUrgentModal(true);
              }
            } catch (error) {
              console.error('Error handling foreground notification:', error);
            }
          }
        }
      }
    );

    return () => {
      responseSubscription.remove();
      foregroundSubscription.remove();
    };
  }, [user?.uid]);

  // Handle app state changes for iOS background issue
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('AppWrapper: App state changed from', appState, 'to', nextAppState);
      setAppState(nextAppState);
      
      // When app becomes active, use global handler for immediate response
      if (nextAppState === 'active' && user?.uid) {
        console.log('AppWrapper: App became active, using global handler...');
        
        // Use the global handler for immediate response
        setTimeout(() => {
          UrgentMessageHandler.forceCheckAndShow(user.uid);
        }, 200);
        
        // Also do multiple attempts as backup
        setTimeout(() => {
          UrgentMessageHandler.forceCheckAndShow(user.uid);
        }, 600);
        
        setTimeout(() => {
          UrgentMessageHandler.forceCheckAndShow(user.uid);
        }, 1200);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [appState, user?.uid, showUrgentModal]);

  // Handle new urgent messages from real-time listener
  useEffect(() => {
    console.log('Urgent messages updated:', urgentMessages);
    if (urgentMessages.length > 0 && !showUrgentModal && appState === 'active') {
      const latestMessage = urgentMessages[0];
      console.log('Showing urgent message modal immediately for:', latestMessage);
      
      // Show modal immediately
      setCurrentUrgentMessage(latestMessage);
      setShowUrgentModal(true);
      
      // Also clear any duplicate notifications
      if (latestMessage.id) {
        clearUrgentMessage(latestMessage.id);
      }
    }
  }, [urgentMessages, showUrgentModal, clearUrgentMessage, appState]);

  const handleCloseUrgentModal = () => {
    setShowUrgentModal(false);
    if (currentUrgentMessage?.id) {
      clearUrgentMessage(currentUrgentMessage.id);
    }
    setCurrentUrgentMessage(null);
  };

  const handleOpenChat = (chatId: string) => {
    // TODO: Navigate to chat screen
    console.log('Opening chat:', chatId);
    // You can implement navigation here using your navigation system
    // For example: navigation.navigate('ChatConversation', { chatId });
  };

  // Handle emergency status modal actions
  const handleCloseEmergencyModal = () => {
    setShowEmergencyModal(false);
    setCurrentEmergencyNotification(null);
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await patientNotificationService.markAsRead(notificationId);
      console.log('Emergency notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Wrap with SafeAreaProvider for proper Android safe area handling
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        {children}
        
        {/* Urgent Message Modal */}
        <UrgentMessageModal
          visible={showUrgentModal}
          message={currentUrgentMessage}
          onClose={handleCloseUrgentModal}
          onOpenChat={handleOpenChat}
        />

        {/* Emergency Status Modal */}
        <EmergencyStatusModal
          visible={showEmergencyModal}
          notification={currentEmergencyNotification}
          onClose={handleCloseEmergencyModal}
          onMarkAsRead={handleMarkNotificationAsRead}
        />
      </View>
    </SafeAreaProvider>
  );
};