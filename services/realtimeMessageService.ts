import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { ChatMessage, chatService } from "./chatService";
import { notificationService } from "./notificationService";
import { UrgentMessageHandler } from "./urgentMessageHandler";

interface RealtimeMessageHook {
  urgentMessages: ChatMessage[];
  hasUnreadUrgent: boolean;
  clearUrgentMessage: (messageId: string) => void;
  markAllAsRead: () => void;
}

export const useRealtimeMessages = (
  userId: string,
  userType: "doctor" | "patient",
): RealtimeMessageHook => {
  const [urgentMessages, setUrgentMessages] = useState<ChatMessage[]>([]);
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );
  const [processedMessageIds] = useState(new Set<string>());
  const chatUnsubscribersRef = useRef<Map<string, () => void>>(new Map());

  console.log(
    "useRealtimeMessages initialized for user:",
    userId,
    "type:",
    userType,
  );

  // Check for urgent messages
  const checkUrgentMessages = useCallback(async () => {
    try {
      if (!userId || userId === "undefined") {
        console.warn("checkUrgentMessages called with invalid userId:", userId);
        return;
      }

      const messages = await chatService.getUnreadUrgentMessages(
        userId,
        userType,
      );
      setUrgentMessages(messages);

      // If app is in background and there are new urgent messages, send notification
      if (appState !== "active" && messages.length > 0) {
        const latestMessage = messages[0];
        if (latestMessage.messageType === "seizure_alert") {
          await notificationService.sendSeizureMessageNotification(
            latestMessage.senderName,
            latestMessage.message,
            latestMessage.seizureId || "",
            "", // We'll need to derive chatId
          );
        }
      }
    } catch (error) {
      console.error("Error checking urgent messages:", error);
    }
  }, [userId, userType, appState]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log("App state changed from", appState, "to", nextAppState);
      setAppState(nextAppState);

      // Check for urgent messages when app becomes active (foreground)
      if (nextAppState === "active") {
        console.log("App became active, checking for urgent messages...");
        // Add a small delay to ensure Firebase listeners are ready
        setTimeout(() => {
          checkUrgentMessages();
        }, 500);
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription?.remove();
  }, [checkUrgentMessages]);

  // Set up real-time listeners for user's chats
  useEffect(() => {
    const attachMessageListener = (chatId: string) => {
      if (!chatId || chatId === "undefined") return;
      if (chatUnsubscribersRef.current.has(chatId)) return;

      const unsubscribe = chatService.subscribeToChatMessages(
        chatId,
        (messages) => {
          const newUrgentMessages = messages.filter(
            (msg) =>
              !msg.read &&
              msg.isUrgent &&
              msg.senderId !== userId &&
              msg.id &&
              !processedMessageIds.has(msg.id) &&
              new Date().getTime() -
                new Date(msg.timestamp?.toDate?.() || msg.timestamp).getTime() <
                2 * 60 * 1000,
          );

          if (newUrgentMessages.length === 0) return;

          newUrgentMessages.forEach((msg) => {
            if (msg.id) processedMessageIds.add(msg.id);
          });

          setUrgentMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const uniqueNew = newUrgentMessages.filter(
              (m) => !existingIds.has(m.id),
            );
            return [...prev, ...uniqueNew].sort(
              (a, b) =>
                new Date(b.timestamp?.toDate?.() || b.timestamp).getTime() -
                new Date(a.timestamp?.toDate?.() || a.timestamp).getTime(),
            );
          });

          const latestMessage = newUrgentMessages[0];
          console.log(
            "Real-time: Processing urgent message via global handler:",
            latestMessage.id,
          );
          UrgentMessageHandler.handleUrgentMessage(latestMessage);
        },
        10,
      );

      chatUnsubscribersRef.current.set(chatId, unsubscribe);
    };

    const detachStaleListeners = (validChatIds: Set<string>) => {
      for (const [
        chatId,
        unsubscribe,
      ] of chatUnsubscribersRef.current.entries()) {
        if (!validChatIds.has(chatId)) {
          unsubscribe();
          chatUnsubscribersRef.current.delete(chatId);
        }
      }
    };

    if (!userId || userId === "undefined") {
      console.log("No userId provided, skipping real-time listeners setup");
      return;
    }

    // Subscribe to chat list in real-time; attach message listeners for newly created chats.
    const chatsUnsubscribe = chatService.subscribeToUserChats(
      userId,
      userType,
      (chats) => {
        const ids = new Set<string>();
        chats.forEach((c) => {
          if (c.id) ids.add(c.id);
        });

        detachStaleListeners(ids);
        ids.forEach((id) => attachMessageListener(id));
      },
    );

    return () => {
      chatsUnsubscribe();
      for (const unsubscribe of chatUnsubscribersRef.current.values()) {
        unsubscribe();
      }
      chatUnsubscribersRef.current.clear();
    };
  }, [userId, userType]);

  // Handle notification responses
  useEffect(() => {
    const responseSubscription =
      notificationService.addNotificationResponseListener((response) => {
        const data = response.notification.request.content.data;

        if (data?.messageType === "seizure_alert" && data?.chatId) {
          // Navigate to chat or handle the response
          console.log("User tapped seizure alert notification:", data);
        }
      });

    return () => responseSubscription.remove();
  }, []);

  const clearUrgentMessage = useCallback((messageId: string) => {
    setUrgentMessages((prev) => prev.filter((msg) => msg.id !== messageId));
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
      console.error("Error marking messages as read:", error);
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
    userType: "doctor" | "patient",
    onUrgentMessage: (message: ChatMessage) => void,
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
              const urgentMessages = messages.filter(
                (msg) =>
                  !msg.read &&
                  msg.isUrgent &&
                  msg.senderId !== userId &&
                  new Date().getTime() -
                    new Date(
                      msg.timestamp?.toDate?.() || msg.timestamp,
                    ).getTime() <
                    2 * 60 * 1000,
              );

              urgentMessages.forEach(onUrgentMessage);
            },
            5,
          );

          this.listeners.set(`${userId}_${chat.id}`, unsubscribe);
        }
      }
    } catch (error) {
      console.error("Error initializing realtime messages:", error);
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
