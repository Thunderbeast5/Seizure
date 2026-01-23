import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { Medication } from "./medicationService";

let cachedNotificationsModule: any | null | undefined;

const getNotificationsModule = async (): Promise<any | null> => {
  if (cachedNotificationsModule !== undefined) return cachedNotificationsModule;

  try {
    const mod: any = await import("expo-notifications");
    cachedNotificationsModule = mod;

    // Configure notification behavior (only if module is available)
    try {
      mod.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    } catch (e) {
      console.warn(
        "Notifications: setNotificationHandler failed (non-fatal):",
        e,
      );
    }

    return mod;
  } catch (e) {
    // Expo Go (SDK 53+) throws at import time for remote notifications.
    console.warn("Notifications are not available in this environment:", e);
    cachedNotificationsModule = null;
    return null;
  }
};

export interface NotificationData {
  medicationId: string;
  medicationName: string;
  dosage: string;
  time: string;
}

class NotificationService {
  private readonly STORAGE_KEY = "medication_notifications";
  private recentNotifications = new Set<string>();
  private notificationTimeout = 5000; // 5 seconds to prevent duplicates

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const Notifications = await getNotificationsModule();
      if (!Notifications) return false;

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Notification permissions not granted");
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(
          "medication-reminders",
          {
            name: "Medication Reminders",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#4A90E2",
            sound: "default",
            enableVibrate: true,
            showBadge: true,
          },
        );
      }

      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  // Schedule notifications for a medication
  async scheduleMedicationNotifications(
    medication: Medication,
  ): Promise<string[]> {
    try {
      if (
        !medication.active ||
        !medication.time ||
        medication.time.length === 0
      ) {
        return [];
      }

      const notificationIds: string[] = [];

      for (const timeString of medication.time) {
        const notificationId = await this.scheduleNotification({
          medicationId: medication.id!,
          medicationName: medication.name,
          dosage: medication.dosage,
          time: timeString,
        });

        if (notificationId) {
          notificationIds.push(notificationId);
        }
      }

      // Store notification IDs for this medication
      await this.storeNotificationIds(medication.id!, notificationIds);

      return notificationIds;
    } catch (error) {
      console.error("Error scheduling medication notifications:", error);
      return [];
    }
  }

  // Schedule a single notification
  private async scheduleNotification(
    data: NotificationData,
  ): Promise<string | null> {
    try {
      const Notifications = await getNotificationsModule();
      if (!Notifications) return null;

      const [hours, minutes] = data.time.split(":").map(Number);

      // Create notification trigger for daily repeat
      const trigger: any = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "💊 Medication Reminder",
          body: `Time to take ${data.medicationName} (${data.dosage})`,
          data: {
            medicationId: data.medicationId,
            medicationName: data.medicationName,
            dosage: data.dosage,
            time: data.time,
            type: "medication_reminder",
          },
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
        },
        trigger,
      });

      console.log(
        `Scheduled notification for ${data.medicationName} at ${data.time}, ID: ${notificationId}`,
      );
      return notificationId;
    } catch (error) {
      console.error("Error scheduling single notification:", error);
      return null;
    }
  }

  // Cancel notifications for a medication
  async cancelMedicationNotifications(medicationId: string): Promise<void> {
    try {
      const Notifications = await getNotificationsModule();
      if (!Notifications) return;

      const notificationIds = await this.getStoredNotificationIds(medicationId);

      if (notificationIds.length > 0) {
        for (const id of notificationIds) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
        console.log(
          `Cancelled ${notificationIds.length} notifications for medication ${medicationId}`,
        );
      }

      // Remove from storage
      await this.removeStoredNotificationIds(medicationId);
    } catch (error) {
      console.error("Error cancelling medication notifications:", error);
    }
  }

  // Update notifications for a medication (cancel old ones and schedule new ones)
  async updateMedicationNotifications(medication: Medication): Promise<void> {
    try {
      // Cancel existing notifications
      await this.cancelMedicationNotifications(medication.id!);

      // Schedule new notifications
      await this.scheduleMedicationNotifications(medication);
    } catch (error) {
      console.error("Error updating medication notifications:", error);
    }
  }

  // Cancel all medication notifications
  async cancelAllMedicationNotifications(): Promise<void> {
    try {
      const Notifications = await getNotificationsModule();
      if (!Notifications) return;

      const allScheduled =
        await Notifications.getAllScheduledNotificationsAsync();
      const medicationNotifications = allScheduled.filter(
        (notification: any) =>
          notification.content.data?.type === "medication_reminder",
      );

      const notificationIds = medicationNotifications.map(
        (n: any) => n.identifier,
      );

      if (notificationIds.length > 0) {
        for (const id of notificationIds) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
        console.log(
          `Cancelled ${notificationIds.length} medication notifications`,
        );
      }

      // Clear storage
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Error cancelling all medication notifications:", error);
    }
  }

  // Get all scheduled medication notifications
  async getScheduledMedicationNotifications(): Promise<any[]> {
    try {
      const Notifications = await getNotificationsModule();
      if (!Notifications) return [];

      const allScheduled =
        await Notifications.getAllScheduledNotificationsAsync();
      return allScheduled.filter(
        (notification: any) =>
          notification.content.data?.type === "medication_reminder",
      );
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      return [];
    }
  }

  // Store notification IDs for a medication
  private async storeNotificationIds(
    medicationId: string,
    notificationIds: string[],
  ): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem(this.STORAGE_KEY);
      const notificationMap = existingData ? JSON.parse(existingData) : {};

      notificationMap[medicationId] = notificationIds;

      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(notificationMap),
      );
    } catch (error) {
      console.error("Error storing notification IDs:", error);
    }
  }

  // Get stored notification IDs for a medication
  private async getStoredNotificationIds(
    medicationId: string,
  ): Promise<string[]> {
    try {
      const existingData = await AsyncStorage.getItem(this.STORAGE_KEY);
      const notificationMap = existingData ? JSON.parse(existingData) : {};

      return notificationMap[medicationId] || [];
    } catch (error) {
      console.error("Error getting stored notification IDs:", error);
      return [];
    }
  }

  // Remove stored notification IDs for a medication
  private async removeStoredNotificationIds(
    medicationId: string,
  ): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem(this.STORAGE_KEY);
      const notificationMap = existingData ? JSON.parse(existingData) : {};

      delete notificationMap[medicationId];

      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(notificationMap),
      );
    } catch (error) {
      console.error("Error removing stored notification IDs:", error);
    }
  }

  // Handle notification response (when user taps notification)
  addNotificationResponseListener(callback: (response: any) => void) {
    (async () => {
      const Notifications = await getNotificationsModule();
      if (!Notifications) return;
      Notifications.addNotificationResponseReceivedListener(callback);
    })();

    return { remove: () => {} };
  }

  // Handle received notifications (when app is in foreground)
  addNotificationReceivedListener(callback: (notification: any) => void) {
    (async () => {
      const Notifications = await getNotificationsModule();
      if (!Notifications) return;
      Notifications.addNotificationReceivedListener(callback);
    })();

    return { remove: () => {} };
  }

  // Mark medication as taken (could be used to track compliance)
  async markMedicationAsTaken(
    medicationId: string,
    time: string,
  ): Promise<void> {
    try {
      const takenKey = `medication_taken_${medicationId}_${time}_${new Date().toDateString()}`;
      await AsyncStorage.setItem(
        takenKey,
        JSON.stringify({
          medicationId,
          time,
          takenAt: new Date().toISOString(),
        }),
      );

      console.log(`Marked medication ${medicationId} as taken at ${time}`);
    } catch (error) {
      console.error("Error marking medication as taken:", error);
    }
  }

  // Get medication compliance data
  async getMedicationCompliance(
    medicationId: string,
    days: number = 7,
  ): Promise<any[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const takenKeys = keys.filter((key) =>
        key.startsWith(`medication_taken_${medicationId}_`),
      );

      const compliance = [];
      for (const key of takenKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          compliance.push(JSON.parse(data));
        }
      }

      return compliance;
    } catch (error) {
      console.error("Error getting medication compliance:", error);
      return [];
    }
  }

  // Send urgent medical notification (for doctor messages)
  async sendUrgentMedicalNotification(
    title: string,
    body: string,
    data?: any,
  ): Promise<string | null> {
    try {
      const Notifications = await getNotificationsModule();
      if (!Notifications) return null;

      // Configure urgent notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("urgent-medical", {
          name: "Urgent Medical Alerts",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250, 250, 250],
          lightColor: "#FF0000",
          sound: "default",
          enableVibrate: true,
          showBadge: true,
          bypassDnd: true, // Bypass Do Not Disturb
        });
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🚨 ${title}`,
          body,
          data: {
            ...data,
            type: "urgent_medical",
            timestamp: new Date().toISOString(),
          },
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250, 250, 250],
          sticky: true, // Make notification persistent
          // iOS specific properties for better background handling
          ...(Platform.OS === "ios" && {
            badge: 1,
            interruptionLevel: "critical", // iOS 15+ critical notifications
          }),
        },
        trigger: null, // Send immediately
      });

      console.log(`Sent urgent medical notification: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error("Error sending urgent medical notification:", error);
      return null;
    }
  }

  // Send seizure-related message notification
  async sendSeizureMessageNotification(
    doctorName: string,
    message: string,
    seizureId: string,
    chatId: string,
  ): Promise<string | null> {
    try {
      return await this.sendUrgentMedicalNotification(
        `Message from Dr. ${doctorName}`,
        `About your recent seizure: ${message}`,
        {
          seizureId,
          chatId,
          doctorName,
          messageType: "seizure_alert",
        },
      );
    } catch (error) {
      console.error("Error sending seizure message notification:", error);
      return null;
    }
  }

  // Present local notification (for foreground notifications)
  async presentLocalNotification(
    title: string,
    body: string,
    data?: any,
  ): Promise<string | null> {
    try {
      const Notifications = await getNotificationsModule();
      if (!Notifications) return null;

      // Create unique key for deduplication
      const notificationKey = `${title}_${body}_${data?.messageId || Date.now()}`;

      // Check if we recently sent this notification
      if (this.recentNotifications.has(notificationKey)) {
        console.log("Duplicate notification prevented:", notificationKey);
        return null;
      }

      // Add to recent notifications and auto-remove after timeout
      this.recentNotifications.add(notificationKey);
      setTimeout(() => {
        this.recentNotifications.delete(notificationKey);
      }, this.notificationTimeout);

      // Use scheduleNotificationAsync with null trigger for immediate presentation
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 ${title}`,
          body,
          data: {
            ...data,
            type: "local_alert",
            timestamp: new Date().toISOString(),
          },
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
        },
        trigger: null, // Present immediately
      });

      console.log(`Presented local notification: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error("Error presenting local notification:", error);
      return null;
    }
  }
}

export const notificationService = new NotificationService();
