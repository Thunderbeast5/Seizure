import { AppState } from 'react-native';
import { chatService, ChatMessage } from './chatService';
import { notificationService } from './notificationService';

// Global reference to modal show function
let globalShowModal: ((message: ChatMessage) => void) | null = null;

export const UrgentMessageHandler = {
  // Register the modal show function
  registerModalHandler: (showModalFn: (message: ChatMessage) => void) => {
    globalShowModal = showModalFn;
    console.log('UrgentMessageHandler: Modal handler registered');
  },

  // Unregister the modal show function
  unregisterModalHandler: () => {
    globalShowModal = null;
    console.log('UrgentMessageHandler: Modal handler unregistered');
  },

  // Handle urgent message - this bypasses React state and directly shows modal
  handleUrgentMessage: async (message: ChatMessage) => {
    console.log('UrgentMessageHandler: Processing urgent message:', message.id);
    
    // Always try to show the modal if handler is available
    if (globalShowModal) {
      console.log('UrgentMessageHandler: Showing modal directly');
      globalShowModal(message);
      return;
    }

    // Fallback: send notification if modal handler not available
    console.log('UrgentMessageHandler: Modal handler not available, sending notification');
    try {
      await notificationService.sendUrgentMedicalNotification(
        `Message from Dr. ${message.senderName}`,
        `About your seizure: ${message.message}`,
        {
          seizureId: message.seizureId,
          messageType: message.messageType,
          messageId: message.id
        }
      );
    } catch (error) {
      console.error('UrgentMessageHandler: Failed to send notification:', error);
    }
  },

  // Force check for urgent messages and show modal
  forceCheckAndShow: async (userId: string) => {
    console.log('UrgentMessageHandler: Force checking for urgent messages');
    try {
      const messages = await chatService.getUnreadUrgentMessages(userId, 'patient');
      if (messages.length > 0) {
        const latestMessage = messages[0];
        console.log('UrgentMessageHandler: Found urgent message, processing:', latestMessage.id);
        await UrgentMessageHandler.handleUrgentMessage(latestMessage);
      } else {
        console.log('UrgentMessageHandler: No urgent messages found');
      }
    } catch (error) {
      console.error('UrgentMessageHandler: Error force checking messages:', error);
    }
  }
};

// Auto-check for urgent messages when app becomes active
AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'active') {
    console.log('UrgentMessageHandler: App became active, will check for messages in 500ms');
    // Small delay to ensure Firebase is ready
    setTimeout(() => {
      // We'll need to get userId from somewhere - this will be handled in AppWrapper
      console.log('UrgentMessageHandler: App state listener triggered');
    }, 500);
  }
});

export default UrgentMessageHandler;
