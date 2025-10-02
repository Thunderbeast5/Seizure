import React, { useState } from 'react';
import { XMarkIcon, PaperAirplaneIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { chatService } from '../services/chatService';
import { PatientSeizure } from '../services/patientDataService';

interface SeizureMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  seizure: PatientSeizure | null;
  patientName: string;
  doctorId: string;
  doctorName: string;
}

export const SeizureMessageModal: React.FC<SeizureMessageModalProps> = ({
  isOpen,
  onClose,
  seizure,
  patientName,
  doctorId,
  doctorName,
}) => {
  const [message, setMessage] = useState('');
  const [isUrgent, setIsUrgent] = useState(true);
  const [messageType, setMessageType] = useState<'seizure_alert' | 'medical_advice'>('seizure_alert');
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendMessage = async () => {
    if (!message.trim() || !seizure || !seizure.id || isSending) return;

    setIsSending(true);
    try {
      console.log('Sending seizure alert with seizure ID:', seizure.id);
      await chatService.sendSeizureAlert(
        doctorId,
        seizure.userId,
        doctorName,
        patientName,
        seizure.id,
        message.trim()
      );

      setSuccessMessage('Message sent successfully! The patient will receive an immediate notification.');
      setMessage('');
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error sending seizure message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const getQuickMessages = () => [
    "I've reviewed your recent seizure. Please take your medication as prescribed and monitor your symptoms.",
    "Your seizure pattern shows improvement. Continue with your current treatment plan.",
    "I need to adjust your medication. Please schedule an appointment this week.",
    "The seizure video shows concerning patterns. Please come in for an urgent consultation.",
    "Your seizure frequency is increasing. Let's discuss treatment modifications immediately.",
  ];

  const handleQuickMessage = (quickMsg: string) => {
    setMessage(quickMsg);
  };

  if (!isOpen || !seizure) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Send Urgent Message
              </h3>
              <p className="text-sm text-gray-600">
                About {patientName}'s seizure on {seizure.date}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Seizure Details */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Seizure Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Date:</span>
              <span className="ml-2 font-medium">{seizure.date}</span>
            </div>
            <div>
              <span className="text-gray-600">Time:</span>
              <span className="ml-2 font-medium">{seizure.time || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-gray-600">Type:</span>
              <span className="ml-2 font-medium">{seizure.type}</span>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <span className="ml-2 font-medium">{seizure.duration || 'Not specified'}</span>
            </div>
            {seizure.triggers && (
              <div className="col-span-2">
                <span className="text-gray-600">Triggers:</span>
                <span className="ml-2 font-medium">{seizure.triggers}</span>
              </div>
            )}
            {seizure.notes && (
              <div className="col-span-2">
                <span className="text-gray-600">Notes:</span>
                <span className="ml-2">{seizure.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-50 border-l-4 border-green-400">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Message Options */}
        <div className="p-6 space-y-4">
          {/* Message Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="seizure_alert"
                  checked={messageType === 'seizure_alert'}
                  onChange={(e) => setMessageType(e.target.value as 'seizure_alert')}
                  className="mr-2"
                />
                <span className="text-sm">Seizure Alert</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="medical_advice"
                  checked={messageType === 'medical_advice'}
                  onChange={(e) => setMessageType(e.target.value as 'medical_advice')}
                  className="mr-2"
                />
                <span className="text-sm">Medical Advice</span>
              </label>
            </div>
          </div>

          {/* Urgent Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="urgent"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="urgent" className="text-sm font-medium text-gray-700">
              Mark as urgent (patient will receive immediate notification)
            </label>
          </div>

          {/* Quick Messages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Messages
            </label>
            <div className="space-y-2">
              {getQuickMessages().map((quickMsg, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickMessage(quickMsg)}
                  className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  {quickMsg}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message to the patient..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/500 characters
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center text-sm text-gray-600">
            <ExclamationTriangleIcon className="w-4 h-4 mr-1 text-orange-500" />
            Patient will receive immediate notification
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || !seizure?.id || isSending}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
