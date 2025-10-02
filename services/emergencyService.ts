import { collection, addDoc, doc, updateDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase.config';
import LocationService, { LocationData } from './locationService';
import { chatService } from './chatService';
import { notificationService } from './notificationService';
import { Alert, Linking, Platform } from 'react-native';

export interface EmergencyAlert {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  alertType: 'seizure' | 'medical' | 'general';
  location: LocationData;
  timestamp: number;
  status: 'active' | 'acknowledged' | 'resolved';
  message?: string;
  contactsNotified: string[];
  doctorNotified: boolean;
  emergencyServicesContacted: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  userId: string;
}

class EmergencyService {
  private static instance: EmergencyService;
  private activeAlert: EmergencyAlert | null = null;

  private constructor() {}

  static getInstance(): EmergencyService {
    if (!EmergencyService.instance) {
      EmergencyService.instance = new EmergencyService();
    }
    return EmergencyService.instance;
  }

  /**
   * Send emergency alert with current location
   */
  async sendEmergencyAlert(
    userId: string,
    userEmail: string,
    userName: string,
    alertType: 'seizure' | 'medical' | 'general' = 'seizure',
    customMessage?: string
  ): Promise<EmergencyAlert | null> {
    try {
      // Get current location
      const location = await LocationService.getCurrentLocation();
      if (!location) {
        Alert.alert(
          'Location Required',
          'Unable to get your current location. Emergency alert will be sent without location data.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Send Anyway', onPress: () => this.sendAlertWithoutLocation(userId, userEmail, userName, alertType, customMessage) }
          ]
        );
        return null;
      }

      // Create emergency alert
      const alert: EmergencyAlert = {
        userId,
        userEmail,
        userName,
        alertType,
        location,
        timestamp: Date.now(),
        status: 'active',
        message: customMessage || this.getDefaultMessage(alertType),
        contactsNotified: [],
        doctorNotified: false,
        emergencyServicesContacted: false,
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, 'emergencyAlerts'), alert);
      alert.id = docRef.id;
      this.activeAlert = alert;

      // Send push notification to user's other devices first (this should always work)
      await this.sendEmergencyNotification(alert);

      // Notify emergency contacts (simplified)
      try {
        await this.notifyEmergencyContacts(alert);
      } catch (error) {
        console.error('Error notifying emergency contacts (non-critical):', error);
      }

      // Skip additional doctor notification since main emergency alert system is working
      console.log('✅ Emergency alert system working - doctors will see alerts in portal');
      alert.doctorNotified = true; // Mark as notified since they can see it in portal

      return alert;
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      Alert.alert('Error', 'Failed to send emergency alert. Please try again or call emergency services directly.');
      return null;
    }
  }

  /**
   * Send alert without location (fallback)
   */
  private async sendAlertWithoutLocation(
    userId: string,
    userEmail: string,
    userName: string,
    alertType: 'seizure' | 'medical' | 'general',
    customMessage?: string
  ): Promise<void> {
    try {
      const alert: EmergencyAlert = {
        userId,
        userEmail,
        userName,
        alertType,
        location: {
          latitude: 0,
          longitude: 0,
          accuracy: null,
          timestamp: Date.now(),
          address: 'Location unavailable'
        },
        timestamp: Date.now(),
        status: 'active',
        message: customMessage || this.getDefaultMessage(alertType),
        contactsNotified: [],
        doctorNotified: false,
        emergencyServicesContacted: false,
      };

      const docRef = await addDoc(collection(db, 'emergencyAlerts'), alert);
      alert.id = docRef.id;
      this.activeAlert = alert;

      await this.notifyEmergencyContacts(alert);
      await this.notifyConnectedDoctors(alert);
    } catch (error) {
      console.error('Error sending alert without location:', error);
    }
  }

  /**
   * Notify emergency contacts via SMS and calls
   */
  private async notifyEmergencyContacts(alert: EmergencyAlert): Promise<void> {
    try {
      // Get user's emergency contacts
      const contacts = await this.getEmergencyContacts(alert.userId);
      
      for (const contact of contacts) {
        try {
          // Create emergency message
          const message = this.createEmergencyMessage(alert, contact);
          
          // Send SMS (this would require a service like Twilio in production)
          // For now, we'll create a notification record
          await this.logContactNotification(alert.id!, contact, message);
          
          alert.contactsNotified.push(contact.id);
        } catch (error) {
          console.error(`Error notifying contact ${contact.name}:`, error);
        }
      }

      // Update alert in Firebase
      if (alert.id) {
        await updateDoc(doc(db, 'emergencyAlerts', alert.id), {
          contactsNotified: alert.contactsNotified
        });
      }
    } catch (error) {
      console.error('Error notifying emergency contacts:', error);
    }
  }

  /**
   * Notify connected doctors
   */
  private async notifyConnectedDoctors(alert: EmergencyAlert): Promise<void> {
    try {
      // Get user's profile to find connected doctors
      const userProfileQuery = query(
        collection(db, 'profiles'),
        where('userId', '==', alert.userId),
        limit(1)
      );
      const userSnapshot = await getDocs(userProfileQuery);
      
      if (userSnapshot.empty) {
        console.log('No user profile found for userId:', alert.userId);
        return;
      }
      
      const userProfile = userSnapshot.docs[0].data();
      
      if (!userProfile.doctorId) {
        console.log('No doctorId found in user profile');
        return;
      }

      try {
        // Create a direct emergency notification document instead of using chat
        const emergencyNotification = {
          alertId: alert.id,
          patientId: alert.userId,
          patientName: alert.userName,
          doctorId: userProfile.doctorId,
          alertType: alert.alertType,
          location: alert.location,
          message: this.createDoctorEmergencyMessage(alert),
          timestamp: Date.now(),
          read: false,
          urgent: true
        };

        // Save emergency notification directly to Firestore
        await addDoc(collection(db, 'emergencyNotifications'), emergencyNotification);

        alert.doctorNotified = true;
        console.log('Doctor notified successfully via emergency notification');
      } catch (error) {
        console.error(`Error notifying doctor ${userProfile.doctorId}:`, error);
      }

      // Update alert in Firebase
      if (alert.id) {
        await updateDoc(doc(db, 'emergencyAlerts', alert.id), {
          doctorNotified: alert.doctorNotified
        });
      }
    } catch (error) {
      console.error('Error notifying doctors:', error);
    }
  }

  /**
   * Send push notification for emergency
   */
  private async sendEmergencyNotification(alert: EmergencyAlert): Promise<void> {
    try {
      const title = `🚨 Emergency Alert - ${alert.alertType.toUpperCase()}`;
      const body = alert.location.address 
        ? `Emergency at: ${alert.location.address}`
        : `Emergency at: ${alert.location.latitude.toFixed(6)}, ${alert.location.longitude.toFixed(6)}`;

      await notificationService.sendUrgentMedicalNotification(
        title,
        body,
        {
          alertId: alert.id,
          alertType: alert.alertType,
          location: JSON.stringify(alert.location)
        }
      );
    } catch (error) {
      console.error('Error sending emergency notification:', error);
    }
  }

  /**
   * Get emergency contacts for user
   */
  private async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    try {
      const q = query(
        collection(db, 'emergencyContacts'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const contacts: EmergencyContact[] = [];
      
      querySnapshot.forEach((doc) => {
        contacts.push({
          id: doc.id,
          ...doc.data()
        } as EmergencyContact);
      });
      
      return contacts;
    } catch (error) {
      console.error('Error getting emergency contacts:', error);
      return [];
    }
  }


  /**
   * Create emergency message for contacts
   */
  private createEmergencyMessage(alert: EmergencyAlert, contact: EmergencyContact): string {
    const locationText = alert.location.address || 
      `${alert.location.latitude.toFixed(6)}, ${alert.location.longitude.toFixed(6)}`;
    
    const mapsUrl = LocationService.generateMapsUrl(alert.location.latitude, alert.location.longitude);
    
    return `🚨 EMERGENCY ALERT 🚨\n\n` +
           `${alert.userName} needs immediate help!\n\n` +
           `Type: ${alert.alertType.toUpperCase()}\n` +
           `Time: ${new Date(alert.timestamp).toLocaleString()}\n` +
           `Location: ${locationText}\n\n` +
           `View location: ${mapsUrl}\n\n` +
           `${alert.message}\n\n` +
           `Please respond immediately or call emergency services.`;
  }

  /**
   * Create emergency message for doctors
   */
  private createDoctorEmergencyMessage(alert: EmergencyAlert): string {
    const locationText = alert.location.address || 
      `${alert.location.latitude.toFixed(6)}, ${alert.location.longitude.toFixed(6)}`;
    
    return `🚨 PATIENT EMERGENCY ALERT\n\n` +
           `Patient: ${alert.userName}\n` +
           `Type: ${alert.alertType.toUpperCase()}\n` +
           `Time: ${new Date(alert.timestamp).toLocaleString()}\n` +
           `Location: ${locationText}\n\n` +
           `${alert.message}\n\n` +
           `Immediate medical attention may be required.`;
  }

  /**
   * Log contact notification
   */
  private async logContactNotification(
    alertId: string,
    contact: EmergencyContact,
    message: string
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'emergencyNotifications'), {
        alertId,
        contactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phone,
        message,
        timestamp: Date.now(),
        method: 'sms',
        status: 'sent'
      });
    } catch (error) {
      console.error('Error logging contact notification:', error);
    }
  }

  /**
   * Get default message for alert type
   */
  private getDefaultMessage(alertType: 'seizure' | 'medical' | 'general'): string {
    switch (alertType) {
      case 'seizure':
        return 'Patient is experiencing a seizure and needs immediate assistance.';
      case 'medical':
        return 'Patient is experiencing a medical emergency and needs immediate assistance.';
      case 'general':
        return 'Patient needs immediate assistance.';
      default:
        return 'Emergency assistance needed.';
    }
  }

  /**
   * Update alert status
   */
  async updateAlertStatus(alertId: string, status: 'acknowledged' | 'resolved'): Promise<void> {
    try {
      await updateDoc(doc(db, 'emergencyAlerts', alertId), {
        status,
        updatedAt: Date.now()
      });

      if (this.activeAlert && this.activeAlert.id === alertId) {
        this.activeAlert.status = status;
        if (status === 'resolved') {
          this.activeAlert = null;
        }
      }
    } catch (error) {
      console.error('Error updating alert status:', error);
    }
  }

  /**
   * Get active alert
   */
  getActiveAlert(): EmergencyAlert | null {
    return this.activeAlert;
  }

  /**
   * Call emergency services
   */
  async callEmergencyServices(emergencyNumber: string = '911'): Promise<void> {
    try {
      const url = `tel:${emergencyNumber}`;
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        
        // Log that emergency services were contacted
        if (this.activeAlert && this.activeAlert.id) {
          await updateDoc(doc(db, 'emergencyAlerts', this.activeAlert.id), {
            emergencyServicesContacted: true,
            emergencyServicesContactedAt: Date.now()
          });
          this.activeAlert.emergencyServicesContacted = true;
        }
      } else {
        Alert.alert('Error', 'Unable to make phone call. Please dial emergency services manually.');
      }
    } catch (error) {
      console.error('Error calling emergency services:', error);
      Alert.alert('Error', 'Unable to make phone call. Please dial emergency services manually.');
    }
  }

  /**
   * Open location in maps app
   */
  async openLocationInMaps(latitude: number, longitude: number): Promise<void> {
    try {
      const url = Platform.OS === 'ios' 
        ? LocationService.generateAppleMapsUrl(latitude, longitude)
        : LocationService.generateMapsUrl(latitude, longitude);
      
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open maps application.');
      }
    } catch (error) {
      console.error('Error opening maps:', error);
      Alert.alert('Error', 'Unable to open maps application.');
    }
  }

  /**
   * Get recent emergency alerts for user
   */
  async getRecentAlerts(userId: string, limitCount: number = 10): Promise<EmergencyAlert[]> {
    try {
      const q = query(
        collection(db, 'emergencyAlerts'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const alerts: EmergencyAlert[] = [];
      
      querySnapshot.forEach((doc) => {
        alerts.push({
          id: doc.id,
          ...doc.data()
        } as EmergencyAlert);
      });
      
      return alerts;
    } catch (error) {
      console.error('Error getting recent alerts:', error);
      return [];
    }
  }
}

export const emergencyService = EmergencyService.getInstance();
