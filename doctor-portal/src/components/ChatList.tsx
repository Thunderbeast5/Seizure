import React, { useEffect, useState } from 'react';
import { ChatBubbleLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { chatService, Chat } from '../services/chatService';
import { PatientChat } from './PatientChat';
import { Unsubscribe } from 'firebase/firestore';

export const ChatList: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // Real-time listener for doctor's chats
  useEffect(() => {
    if (!user?.uid) return;

    let unsubscribe: Unsubscribe;

    const setupListener = async () => {
      try {
        unsubscribe = chatService.subscribeToUserChats(
          user.uid,
          'doctor',
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

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (selectedChat) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <PatientChat
          patientId={selectedChat.patientId}
          patientName={selectedChat.patientName}
          onClose={handleCloseChat}
        />
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Conversations</h2>
      
      {chats.length === 0 ? (
        <div className="text-center py-8">
          <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No conversations yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Conversations will appear here when patients message you
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatSelect(chat)}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-medical-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {chat.patientName}
                      </h4>
                      {chat.lastMessageTime && (
                        <span className="text-xs text-gray-500">
                          {formatLastMessageTime(chat.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    
                    {chat.lastMessage && (
                      <p className="text-gray-600 text-sm truncate">
                        {chat.lastMessage}
                      </p>
                    )}
                    
                    {!chat.lastMessage && (
                      <p className="text-gray-400 text-sm italic">
                        No messages yet
                      </p>
                    )}
                  </div>
                </div>

                {chat.unreadCount && chat.unreadCount > 0 && (
                  <div className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-2">
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
