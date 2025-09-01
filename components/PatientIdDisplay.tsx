import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ThemedView } from './ThemedView';

export const PatientIdDisplay: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (user?.uid) {
      // In a real app, you'd use Clipboard API
      Alert.alert(
        'Patient ID Copied',
        `Your Patient ID is: ${user.uid}\n\nShare this ID with your doctor so they can connect with you.`,
        [{ text: 'OK' }]
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWithDoctor = () => {
    Alert.alert(
      'Share Your Patient ID',
      `Your Patient ID: ${user?.uid}\n\nShare this ID with your doctor so they can:\n• Send you connection requests\n• Access your medical data (with your permission)\n• Provide better care`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Copy ID', onPress: copyToClipboard }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Your Patient ID</Text>
        <Text style={styles.subtitle}>
          Share this ID with your doctor to enable secure connections
        </Text>
        
        <View style={styles.idContainer}>
          <Text style={styles.idLabel}>Patient ID:</Text>
          <Text style={styles.idValue} numberOfLines={1} ellipsizeMode="middle">
            {user?.uid || 'Not available'}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.button, copied && styles.buttonCopied]}
          onPress={copyToClipboard}
        >
          <Text style={styles.buttonText}>
            {copied ? 'Copied!' : 'Copy ID'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={shareWithDoctor}
        >
          <Text style={styles.secondaryButtonText}>How to Share</Text>
        </TouchableOpacity>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Why share your Patient ID?</Text>
          <Text style={styles.infoText}>
            • Doctors can send you connection requests{'\n'}
            • Secure access to your medical data{'\n'}
            • Better coordination of your care{'\n'}
            • Real-time monitoring and support
          </Text>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  idContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  idLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  idValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonCopied: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  infoContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});
