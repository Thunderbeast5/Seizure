import { CheckCircleIcon, ClockIcon, UserIcon, XCircleIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PatientConnectionRequest, patientConnectionService } from '../services/patientConnectionService';

export const ConnectionRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PatientConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConnectionRequests = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const connectionRequests = await patientConnectionService.getDoctorConnectionRequests(user.uid);
      setRequests(connectionRequests);
    } catch (error) {
      console.error('Error loading connection requests:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadConnectionRequests();
  }, [loadConnectionRequests]);

  const getStatusIcon = (status: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'accepted':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
    }
  };

  const getStatusText = (status: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'pending':
        return 'Pending Patient Response';
      case 'accepted':
        return 'Connection Accepted';
      case 'rejected':
        return 'Connection Rejected';
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading connection requests...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Connection Requests</h2>
        <div className="text-center py-8">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No connection requests yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Search for patients and send connection requests to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Connection Requests</h2>
      
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-medical-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Patient ID: {request.patientId}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Requested: {request.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                    </p>
                    {request.message && (
                      <p className="text-sm text-gray-700 mt-1 italic">
                        "{request.message}"
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Status */}
                <div className="flex items-center gap-2 mt-2">
                  {getStatusIcon(request.status)}
                  <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                {request.status === 'pending' && (
                  <div className="text-sm text-gray-500">
                    Waiting for patient response...
                  </div>
                )}
                {request.status === 'accepted' && (
                  <div className="text-sm text-green-600 font-medium">
                    ✓ Patient data now accessible
                  </div>
                )}
                {request.status === 'rejected' && (
                  <div className="text-sm text-red-600">
                    Patient declined connection
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
