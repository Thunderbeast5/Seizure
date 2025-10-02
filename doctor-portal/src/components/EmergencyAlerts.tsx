import React, { useEffect, useState } from 'react';
import { 
  ExclamationTriangleIcon, 
  MapPinIcon, 
  ClockIcon,
  PhoneIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase.config';

interface EmergencyAlert {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  alertType: 'seizure' | 'medical' | 'general';
  location: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    timestamp: number;
    address?: string;
  };
  timestamp: number;
  status: 'active' | 'acknowledged' | 'resolved';
  message?: string;
  contactsNotified: string[];
  doctorNotified: boolean;
  emergencyServicesContacted: boolean;
}

interface EmergencyAlertsProps {
  doctorId: string;
}

export const EmergencyAlerts: React.FC<EmergencyAlertsProps> = ({ doctorId }) => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate doctorId before proceeding
    if (!doctorId || doctorId === 'undefined') {
      console.warn('EmergencyAlerts: Invalid doctorId provided:', doctorId);
      setAlerts([]);
      setLoading(false);
      return;
    }

    // Get connected patients first, then listen for their emergency alerts
    const setupEmergencyListener = async () => {
      try {
        // Query for patients connected to this doctor
        const patientsQuery = query(
          collection(db, 'profiles'),
          where('doctorId', '==', doctorId)
        );

        const unsubscribePatients = onSnapshot(patientsQuery, (patientsSnapshot) => {
          const patientIds = patientsSnapshot.docs
            .map(doc => doc.data().userId)
            .filter(userId => userId && userId !== 'undefined'); // Filter out invalid userIds
          
          console.log('Connected patient IDs:', patientIds);

          // Listen for all emergency alerts (since doctors can read all alerts now)
          const alertsQuery = query(
            collection(db, 'emergencyAlerts'),
            orderBy('timestamp', 'desc')
          );

          const unsubscribeAlerts = onSnapshot(alertsQuery, (alertsSnapshot) => {
            const allAlerts: EmergencyAlert[] = [];
            alertsSnapshot.forEach((doc) => {
              const alertData = doc.data();
              console.log('Raw alert data:', alertData);
              allAlerts.push({
                id: doc.id,
                ...alertData
              } as EmergencyAlert);
            });
            
            console.log('All alerts found:', allAlerts.length);
            console.log('Patient IDs to filter by:', patientIds);
            
            // For debugging: Show ALL alerts first, then filter
            console.log('All alerts details:', allAlerts.map(alert => ({
              id: alert.id,
              userId: alert.userId,
              userName: alert.userName,
              timestamp: alert.timestamp
            })));
            
            // Filter alerts to only show those from connected patients
            const filteredAlerts = patientIds.length > 0 
              ? allAlerts.filter(alert => patientIds.includes(alert.userId))
              : [];
            
            console.log('Showing alerts:', filteredAlerts.length);
            setAlerts(filteredAlerts);
            setLoading(false);
          }, (error) => {
            console.error('Error listening to emergency alerts:', error);
            setLoading(false);
          });

          // Also listen for emergency notifications directed to this doctor
          const notificationsQuery = query(
            collection(db, 'emergencyNotifications'),
            where('doctorId', '==', doctorId),
            orderBy('timestamp', 'desc')
          );

          const unsubscribeNotifications = onSnapshot(notificationsQuery, (notificationsSnapshot) => {
            console.log('Emergency notifications received:', notificationsSnapshot.size);
            // You can process these notifications separately or merge with alerts
            // For now, just log them
            notificationsSnapshot.forEach((doc) => {
              const notification = doc.data();
              console.log('Emergency notification:', notification);
            });
          });

          return unsubscribeAlerts;
        });

        return unsubscribePatients;
      } catch (error) {
        console.error('Error setting up emergency alerts listener:', error);
        setLoading(false);
      }
    };

    const unsubscribe = setupEmergencyListener();
    
    return () => {
      if (unsubscribe) {
        unsubscribe.then(unsub => unsub && unsub());
      }
    };
  }, [doctorId]);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      // Find the alert to get patient information
      const alert = alerts.find(a => a.id === alertId);
      if (!alert) return;

      // Update alert status
      await updateDoc(doc(db, 'emergencyAlerts', alertId), {
        status: 'acknowledged',
        acknowledgedAt: Date.now(),
        acknowledgedBy: doctorId
      });

      // Send notification to patient
      await addDoc(collection(db, 'patientNotifications'), {
        patientId: alert.userId,
        alertId: alertId,
        type: 'emergency_acknowledged',
        title: '🚨 Emergency Acknowledged',
        message: 'Your emergency alert has been acknowledged by your doctor. Help is on the way!',
        timestamp: Date.now(),
        read: false,
        urgent: true,
        doctorId: doctorId
      });

      console.log('Emergency alert acknowledged and patient notified');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      // Find the alert to get patient information
      const alert = alerts.find(a => a.id === alertId);
      if (!alert) return;

      // Update alert status
      await updateDoc(doc(db, 'emergencyAlerts', alertId), {
        status: 'resolved',
        resolvedAt: Date.now(),
        resolvedBy: doctorId
      });

      // Send notification to patient
      await addDoc(collection(db, 'patientNotifications'), {
        patientId: alert.userId,
        alertId: alertId,
        type: 'emergency_resolved',
        title: '✅ Emergency Resolved',
        message: 'Your emergency has been resolved. Your doctor has confirmed you are safe.',
        timestamp: Date.now(),
        read: false,
        urgent: false,
        doctorId: doctorId
      });

      console.log('Emergency alert resolved and patient notified');
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const openLocationInMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const getAlertColor = (alert: EmergencyAlert) => {
    switch (alert.status) {
      case 'active':
        return alert.alertType === 'seizure' ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50';
      case 'acknowledged':
        return 'border-yellow-500 bg-yellow-50';
      case 'resolved':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getAlertIcon = (alert: EmergencyAlert) => {
    switch (alert.status) {
      case 'active':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
      case 'acknowledged':
        return <ClockIcon className="h-6 w-6 text-yellow-600" />;
      case 'resolved':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      default:
        return <ExclamationTriangleIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const acknowledgedAlerts = alerts.filter(alert => alert.status === 'acknowledged');
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency Alerts</h2>
        <p className="text-gray-600">Monitor and respond to patient emergency situations</p>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            Active Emergencies ({activeAlerts.length})
          </h3>
          <div className="space-y-4">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border-2 rounded-lg p-4 ${getAlertColor(alert)} shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {alert.userName}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.alertType === 'seizure' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {alert.alertType.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{alert.message}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {formatTimestamp(alert.timestamp)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {alert.location.address || 
                             `${alert.location.latitude.toFixed(6)}, ${alert.location.longitude.toFixed(6)}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <button
                          onClick={() => openLocationInMaps(alert.location.latitude, alert.location.longitude)}
                          className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                        >
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          View Location
                        </button>
                        
                        {alert.emergencyServicesContacted && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <PhoneIcon className="h-3 w-3 mr-1" />
                            911 Called
                          </span>
                        )}
                        
                        {alert.contactsNotified.length > 0 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {alert.contactsNotified.length} Contacts Notified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-yellow-600 mb-4 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            Acknowledged ({acknowledgedAlerts.length})
          </h3>
          <div className="space-y-3">
            {acknowledgedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-3 ${getAlertColor(alert)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getAlertIcon(alert)}
                    <div>
                      <h4 className="font-medium text-gray-900">{alert.userName}</h4>
                      <p className="text-sm text-gray-600">{formatTimestamp(alert.timestamp)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Recently Resolved ({resolvedAlerts.slice(0, 5).length})
          </h3>
          <div className="space-y-2">
            {resolvedAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-3 ${getAlertColor(alert)}`}
              >
                <div className="flex items-center space-x-3">
                  {getAlertIcon(alert)}
                  <div>
                    <h4 className="font-medium text-gray-900">{alert.userName}</h4>
                    <p className="text-sm text-gray-600">{formatTimestamp(alert.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No emergency alerts</h3>
          <p className="mt-1 text-sm text-gray-500">
            Emergency alerts from your patients will appear here.
          </p>
        </div>
      )}
    </div>
  );
};
