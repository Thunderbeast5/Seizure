import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase.config';
import { notificationService } from './notificationService';

export interface PatientNotification {
  id?: string;
  patientId: string;
  alertId?: string;
  type: 'emergency_acknowledged' | 'emergency_resolved' | 'doctor_message' | 'general';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  urgent: boolean;
  doctorId?: string;
}

class PatientNotificationService {
  private static instance: PatientNotificationService;
  private unsubscribeListener: (() => void) | null = null;

  private constructor() {}

  static getInstance(): PatientNotificationService {
    if (!PatientNotificationService.instance) {
      PatientNotificationService.instance = new PatientNotificationService();
    }
    return PatientNotificationService.instance;
  }

  /**
   * Start listening for patient notifications
   */
  startListening(
    patientId: string,
    onNotification: (notification: PatientNotification) => void
  ): void {
    if (!patientId || patientId === 'undefined') {
      console.warn('PatientNotificationService: Invalid patientId provided');
      return;
    }

    // Stop existing listener
    this.stopListening();

    console.log('Starting patient notification listener for:', patientId);

    // Listen for new notifications
    const notificationsQuery = query(
      collection(db, 'patientNotifications'),
      where('patientId', '==', patientId),
      where('read', '==', false),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    this.unsubscribeListener = onSnapshot(
      notificationsQuery,
      (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const notification: PatientNotification = {
              id: change.doc.id,
              ...change.doc.data()
            } as PatientNotification;

            console.log('New patient notification received:', notification);

            // Call the callback
            onNotification(notification);

            // Send push notification if urgent
            if (notification.urgent) {
              this.sendPushNotification(notification);
            }
          }
        });
      },
      (error) => {
        console.error('Error listening to patient notifications:', error);
      }
    );
  }

  /**
   * Stop listening for notifications
   */
  stopListening(): void {
    if (this.unsubscribeListener) {
      this.unsubscribeListener();
      this.unsubscribeListener = null;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'patientNotifications', notificationId), {
        read: true,
        readAt: Date.now()
      });
      console.log('Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(patientId: string): Promise<number> {
    try {
      if (!patientId || patientId === 'undefined') return 0;

      const unreadQuery = query(
        collection(db, 'patientNotifications'),
        where('patientId', '==', patientId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(unreadQuery);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Get recent notifications
   */
  async getRecentNotifications(patientId: string, limitCount: number = 20): Promise<PatientNotification[]> {
    try {
      if (!patientId || patientId === 'undefined') return [];

      const notificationsQuery = query(
        collection(db, 'patientNotifications'),
        where('patientId', '==', patientId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(notificationsQuery);
      const notifications: PatientNotification[] = [];

      querySnapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        } as PatientNotification);
      });

      return notifications;
    } catch (error) {
      console.error('Error getting recent notifications:', error);
      return [];
    }
  }

  /**
   * Send push notification for urgent notifications
   */
  private async sendPushNotification(notification: PatientNotification): Promise<void> {
    try {
      await notificationService.sendUrgentMedicalNotification(
        notification.title,
        notification.message,
        {
          notificationId: notification.id,
          type: notification.type,
          alertId: notification.alertId,
          urgent: notification.urgent.toString()
        }
      );
      console.log('Push notification sent for patient notification');
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Create notification message based on type
   */
  static createNotificationMessage(
    type: PatientNotification['type'],
    doctorName?: string
  ): { title: string; message: string } {
    switch (type) {
      case 'emergency_acknowledged':
        return {
          title: '🚨 Emergency Acknowledged',
          message: `Your emergency alert has been acknowledged${doctorName ? ` by Dr. ${doctorName}` : ''}. Help is on the way!`
        };
      case 'emergency_resolved':
        return {
          title: '✅ Emergency Resolved',
          message: `Your emergency has been resolved${doctorName ? ` by Dr. ${doctorName}` : ''}. You are confirmed safe.`
        };
      case 'doctor_message':
        return {
          title: '💬 Message from Doctor',
          message: `You have a new message${doctorName ? ` from Dr. ${doctorName}` : ''}.`
        };
      case 'general':
        return {
          title: '📢 Notification',
          message: 'You have a new notification.'
        };
      default:
        return {
          title: '📱 Update',
          message: 'You have a new update.'
        };
    }
  }
}

export const patientNotificationService = PatientNotificationService.getInstance();
