import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PatientNotification } from '../services/patientNotificationService';

interface EmergencyStatusModalProps {
  visible: boolean;
  notification: PatientNotification | null;
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => void;
}

const { width, height } = Dimensions.get('window');

export const EmergencyStatusModal: React.FC<EmergencyStatusModalProps> = ({
  visible,
  notification,
  onClose,
  onMarkAsRead
}) => {
  const [slideAnim] = useState(new Animated.Value(height));
  const [overlayOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible && notification) {
      // Slide up animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, notification]);

  const handleClose = () => {
    if (notification?.id) {
      onMarkAsRead(notification.id);
    }
    onClose();
  };

  const getIconName = (type: PatientNotification['type']) => {
    switch (type) {
      case 'emergency_acknowledged':
        return 'medical';
      case 'emergency_resolved':
        return 'checkmark-circle';
      case 'doctor_message':
        return 'chatbubble-ellipses';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (type: PatientNotification['type']) => {
    switch (type) {
      case 'emergency_acknowledged':
        return '#F59E0B'; // Orange
      case 'emergency_resolved':
        return '#10B981'; // Green
      case 'doctor_message':
        return '#3B82F6'; // Blue
      default:
        return '#6B7280'; // Gray
    }
  };

  const getBackgroundColor = (type: PatientNotification['type']) => {
    switch (type) {
      case 'emergency_acknowledged':
        return '#FEF3C7'; // Light orange
      case 'emergency_resolved':
        return '#D1FAE5'; // Light green
      case 'doctor_message':
        return '#DBEAFE'; // Light blue
      default:
        return '#F3F4F6'; // Light gray
    }
  };

  if (!notification) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: overlayOpacity }
        ]}
      >
        <TouchableOpacity 
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
              backgroundColor: getBackgroundColor(notification.type)
            }
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={getIconName(notification.type)} 
                    size={32} 
                    color={getIconColor(notification.type)} 
                  />
                </View>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleClose}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Title */}
              <Text style={styles.title}>{notification.title}</Text>

              {/* Message */}
              <Text style={styles.message}>{notification.message}</Text>

              {/* Timestamp */}
              <Text style={styles.timestamp}>
                {new Date(notification.timestamp).toLocaleString()}
              </Text>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primaryButton,
                    { backgroundColor: getIconColor(notification.type) }
                  ]}
                  onPress={handleClose}
                >
                  <Text style={styles.primaryButtonText}>Got it</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
    minHeight: 300,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  timestamp: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
