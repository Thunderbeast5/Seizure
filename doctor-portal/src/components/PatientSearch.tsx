import { CheckCircleIcon, ClockIcon, MagnifyingGlassIcon, UserPlusIcon, XCircleIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreateConnectionRequestData, patientConnectionService, PatientSearchResult } from '../services/patientConnectionService';

export const PatientSearch: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessageInput, setShowMessageInput] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim() || !user?.uid) return;
    
    try {
      setLoading(true);
      // Search for patients by name or ID
      const results = await patientConnectionService.searchPatients(searchTerm, user.uid);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching patients:', error);
      alert('Failed to search patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSendConnectionRequest = async (patientId: string) => {
    if (!user?.uid) return;
    
    try {
      const requestData: CreateConnectionRequestData = {
        doctorId: user.uid,
        patientId,
        message: message.trim() || undefined
      };
      
      await patientConnectionService.sendConnectionRequest(requestData);
      alert('Connection request sent successfully!');
      
      // Refresh search results to show updated status
      handleSearch();
      setMessage('');
      setShowMessageInput(null);
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Failed to send connection request');
    }
  };

  const handleRemoveRequest = async (patientId: string) => {
    if (!user?.uid) return;
    
    try {
      // Get the connection request ID first
      const requests = await patientConnectionService.getDoctorConnectionRequests(user.uid);
      const request = requests.find(r => r.patientId === patientId);
      
      if (request?.id) {
        await patientConnectionService.removeConnectionRequest(request.id);
        alert('Connection request removed successfully!');
        handleSearch(); // Refresh results
      }
    } catch (error) {
      console.error('Error removing connection request:', error);
      alert('Failed to remove connection request');
    }
  };

  const getStatusIcon = (status?: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status?: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return '';
    }
  };

  const getStatusColor = (status?: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'accepted':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Search & Connect with Patients</h2>
      
      {/* Search Input */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !searchTerm.trim()}
          className="px-6 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Found {searchResults.length} patient(s)
          </h3>
          
          {searchResults.map((patient) => (
            <div key={patient.userId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-medical-600">
                        {patient.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{patient.name}</h4>
                      <p className="text-sm text-gray-600">
                        {patient.age} years • {patient.gender} • {patient.seizureType}
                      </p>
                    </div>
                  </div>
                  
                  {/* Connection Status */}
                  {patient.hasConnectionRequest && (
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusIcon(patient.connectionStatus)}
                      <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(patient.connectionStatus)}`}>
                        {getStatusText(patient.connectionStatus)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  {!patient.hasConnectionRequest ? (
                    <button
                      onClick={() => setShowMessageInput(patient.userId)}
                      className="flex items-center gap-2 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700"
                    >
                      <UserPlusIcon className="h-4 w-4" />
                      Connect
                    </button>
                  ) : patient.connectionStatus === 'pending' ? (
                    <button
                      onClick={() => handleRemoveRequest(patient.userId)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Cancel Request
                    </button>
                  ) : patient.connectionStatus === 'accepted' ? (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                      Connected
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowMessageInput(patient.userId)}
                      className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>
              
              {/* Message Input */}
              {showMessageInput === patient.userId && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <textarea
                    placeholder="Optional: Add a personal message to your connection request..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleSendConnectionRequest(patient.userId)}
                      className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700"
                    >
                      Send Request
                    </button>
                    <button
                      onClick={() => {
                        setShowMessageInput(null);
                        setMessage('');
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* No Results */}
      {searchResults.length === 0 && searchTerm && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No patients found matching "{searchTerm}"</p>
          <p className="text-sm text-gray-400 mt-2">Try searching with a different name or Patient ID</p>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Tips:</strong><br/>
              • Make sure the patient name is spelled correctly<br/>
              • For Patient ID, use the complete ID from the patient's mobile app<br/>
              • Try searching with just the first name or last name
            </p>
          </div>
        </div>
      )}
      
      {/* Initial State */}
      {!searchTerm && searchResults.length === 0 && (
        <div className="text-center py-8">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Search for patients by name or Patient ID to connect with them</p>
          <p className="text-sm text-gray-400 mt-2">
            You can search by patient name or their unique Patient ID
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Search Options:</strong><br/>
              • Search by patient name (e.g., "John Smith")<br/>
              • Search by Patient ID (e.g., "y6IPK6tuAZb2Tp4KSwNsO19kDgC2")<br/>
              • Once connected, you'll have access to their medical data
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
