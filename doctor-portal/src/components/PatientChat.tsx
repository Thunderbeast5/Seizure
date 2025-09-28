import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ChatBubbleLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { chatService, ChatMessage } from '../services/chatService';
import { Unsubscribe } from 'firebase/firestore';

interface PatientChatProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
}

export const PatientChat: React.FC<PatientChatProps> = ({
  patientId,
  patientName,
  onClose,
}) => {
  const { user, doctorData } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [chatId, setChatId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat and set up real-time listener
  useEffect(() => {
    if (!user?.uid || !patientId) return;

    let unsubscribe: Unsubscribe;

    const initializeChat = async () => {
      try {
        const doctorName = doctorData?.name || 'Doctor';
        
        const newChatId = await chatService.createOrGetChat({
          doctorId: user.uid,
          patientId: patientId,
          doctorName: doctorName,
          patientName: patientName,
        });

        setChatId(newChatId);

        // Set up real-time listener for messages
        unsubscribe = chatService.subscribeToChatMessages(
          newChatId,
          (updatedMessages) => {
            setMessages(updatedMessages);
            setLoading(false);
            scrollToBottom();
          }
        );
      } catch (error) {
        console.error('Error initializing chat:', error);
        setLoading(false);
      }
    };

    initializeChat();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.uid, patientId, patientName, doctorData?.name, chatId]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (!chatId || !user?.uid) return;
    const markAsRead = async () => {
      try {
        await chatService.markMessagesAsRead(chatId, user.uid);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markAsRead();
  }, [chatId, user?.uid, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !user?.uid || !chatId) return;

    const message = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      const doctorName = doctorData?.name || 'Doctor';
      
      await chatService.sendMessage(
        chatId,
        user.uid,
        'doctor',
        doctorName,
        message
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageText(message); // Restore message text on error
    } finally {
      setSending(false);
    }
  }, [messageText, user?.uid, chatId, doctorData?.name]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg h-96 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Chat with {patientName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600"></div>
          <span className="ml-3 text-gray-600">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-medical-100 rounded-full flex items-center justify-center mr-3">
            <ChatBubbleLeftIcon className="h-4 w-4 text-medical-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Chat with {patientName}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <ChatBubbleLeftIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isMyMessage = message.senderId === user?.uid;
            const previousMessage = index > 0 ? messages[index - 1] : null;
            const showDateSeparator = !previousMessage || 
              formatMessageDate(message.timestamp) !== formatMessageDate(previousMessage.timestamp);

            return (
              <div key={message.id}>
                {showDateSeparator && (
                  <div className="text-center my-4">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {formatMessageDate(message.timestamp)}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${isMyMessage ? 'order-1' : 'order-2'}`}>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isMyMessage
                          ? 'bg-medical-600 text-white rounded-br-sm'
                          : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                    
                    <div className={`flex items-center mt-1 text-xs text-gray-500 ${
                      isMyMessage ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{formatMessageTime(message.timestamp)}</span>
                      {isMyMessage && (
                        <span className={`ml-1 ${message.read ? 'text-medical-600' : 'text-gray-400'}`}>
                          {message.read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
              rows={2}
              maxLength={1000}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sending}
            className={`p-2 rounded-lg transition-colors ${
              messageText.trim() && !sending
                ? 'bg-medical-600 text-white hover:bg-medical-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
