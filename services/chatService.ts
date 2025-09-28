import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Unsubscribe,
  limit
} from 'firebase/firestore';
import { db } from '../firebase.config';

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderType: 'doctor' | 'patient';
  senderName: string;
  message: string;
  timestamp: any;
  read: boolean;
}

export interface Chat {
  id?: string;
  doctorId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount?: number;
  createdAt: any;
  updatedAt: any;
}

export interface CreateChatData {
  doctorId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
}

class ChatService {
  private chatsCollection = 'chats';
  private messagesSubcollection = 'messages';

  // Generate chat ID from doctor and patient IDs (consistent ordering)
  private generateChatId(doctorId: string, patientId: string): string {
    return `${doctorId}_${patientId}`;
  }

  // Create or get existing chat between doctor and patient
  async createOrGetChat(data: CreateChatData): Promise<string> {
    try {
      console.log('Debug - createOrGetChat called with data:', data);
      const chatId = this.generateChatId(data.doctorId, data.patientId);
      console.log('Debug - generated chatId:', chatId);
      const chatRef = doc(db, this.chatsCollection, chatId);
      const chatDoc = await getDoc(chatRef);
      console.log('Debug - chat exists:', chatDoc.exists());

      if (!chatDoc.exists()) {
        // Create new chat
        const chatData: Chat = {
          doctorId: data.doctorId,
          patientId: data.patientId,
          doctorName: data.doctorName,
          patientName: data.patientName,
          unreadCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(chatRef, chatData);
        console.log('New chat created:', chatId);
      }

      console.log('Debug - returning chatId:', chatId);
      return chatId;
    } catch (error) {
      console.error('Error creating/getting chat:', error);
      console.error('Error details:', error);
      throw error;
    }
  }

  // Send a message in a chat
  async sendMessage(
    chatId: string,
    senderId: string,
    senderType: 'doctor' | 'patient',
    senderName: string,
    message: string
  ): Promise<string> {
    try {
      const messageData: ChatMessage = {
        senderId,
        senderType,
        senderName,
        message,
        timestamp: serverTimestamp(),
        read: false
      };

      // Add message to messages subcollection
      const messagesRef = collection(db, this.chatsCollection, chatId, this.messagesSubcollection);
      const messageDoc = await addDoc(messagesRef, messageData);

      // Update chat with last message info
      const chatRef = doc(db, this.chatsCollection, chatId);
      await updateDoc(chatRef, {
        lastMessage: message,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('Message sent successfully:', messageDoc.id);
      return messageDoc.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get all chats for a user (doctor or patient)
  async getUserChats(userId: string, userType: 'doctor' | 'patient'): Promise<Chat[]> {
    try {
      const field = userType === 'doctor' ? 'doctorId' : 'patientId';
      const chatsQuery = query(
        collection(db, this.chatsCollection),
        where(field, '==', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(chatsQuery);
      const chats: Chat[] = [];

      querySnapshot.forEach((doc) => {
        chats.push({
          id: doc.id,
          ...doc.data()
        } as Chat);
      });

      return chats;
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw error;
    }
  }

  // Get messages for a specific chat
  async getChatMessages(chatId: string, limitCount: number = 50): Promise<ChatMessage[]> {
    try {
      const messagesQuery = query(
        collection(db, this.chatsCollection, chatId, this.messagesSubcollection),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(messagesQuery);
      const messages: ChatMessage[] = [];

      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        } as ChatMessage);
      });

      // Return messages in chronological order (oldest first)
      return messages.reverse();
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  // Real-time listener for user's chats
  subscribeToUserChats(
    userId: string,
    userType: 'doctor' | 'patient',
    callback: (chats: Chat[]) => void
  ): Unsubscribe {
    const field = userType === 'doctor' ? 'doctorId' : 'patientId';
    const chatsQuery = query(
      collection(db, this.chatsCollection),
      where(field, '==', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(chatsQuery, (querySnapshot) => {
      const chats: Chat[] = [];
      querySnapshot.forEach((doc) => {
        chats.push({
          id: doc.id,
          ...doc.data()
        } as Chat);
      });
      callback(chats);
    }, (error) => {
      console.error('Error in chats real-time listener:', error);
    });
  }

  // Real-time listener for messages in a specific chat
  subscribeToChatMessages(
    chatId: string,
    callback: (messages: ChatMessage[]) => void,
    limitCount: number = 50
  ): Unsubscribe {
    const messagesQuery = query(
      collection(db, this.chatsCollection, chatId, this.messagesSubcollection),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(messagesQuery, (querySnapshot) => {
      const messages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        } as ChatMessage);
      });
      // Return messages in chronological order (oldest first)
      callback(messages.reverse());
    }, (error) => {
      console.error('Error in messages real-time listener:', error);
    });
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      const messagesQuery = query(
        collection(db, this.chatsCollection, chatId, this.messagesSubcollection),
        where('senderId', '!=', userId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(messagesQuery);
      const updatePromises: Promise<void>[] = [];

      querySnapshot.forEach((doc) => {
        const messageRef = doc.ref;
        updatePromises.push(updateDoc(messageRef, { read: true }));
      });

      await Promise.all(updatePromises);
      console.log('Messages marked as read');
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Get unread message count for a chat
  async getUnreadMessageCount(chatId: string, userId: string): Promise<number> {
    try {
      const messagesQuery = query(
        collection(db, this.chatsCollection, chatId, this.messagesSubcollection),
        where('senderId', '!=', userId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(messagesQuery);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  }

  // Check if chat exists between doctor and patient
  async chatExists(doctorId: string, patientId: string): Promise<boolean> {
    try {
      const chatId = this.generateChatId(doctorId, patientId);
      const chatRef = doc(db, this.chatsCollection, chatId);
      const chatDoc = await getDoc(chatRef);
      return chatDoc.exists();
    } catch (error) {
      console.error('Error checking if chat exists:', error);
      return false;
    }
  }

  // Get chat by ID
  async getChatById(chatId: string): Promise<Chat | null> {
    try {
      const chatRef = doc(db, this.chatsCollection, chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        return {
          id: chatDoc.id,
          ...chatDoc.data()
        } as Chat;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching chat by ID:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
