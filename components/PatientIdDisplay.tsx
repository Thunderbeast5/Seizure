import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export const PatientIdDisplay: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (user?.uid) {
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
    <View className="bg-white rounded-xl p-6 shadow">
      <Text className="text-2xl font-bold text-slate-800 mb-2">Your Patient ID</Text>
      <Text className="text-base text-slate-600 mb-4">
        Share this ID with your doctor to enable secure connections
      </Text>
      <View className="bg-blue-50 rounded-lg p-4 mb-4">
        <Text className="text-sm text-slate-600">Patient ID:</Text>
        <Text
          className="text-lg font-bold text-slate-800 font-mono"
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {user?.uid || 'Not available'}
        </Text>
      </View>
      <TouchableOpacity
        className={`w-full py-3 rounded-lg mb-3 items-center ${copied ? 'bg-green-500' : 'bg-blue-600'}`}
        onPress={copyToClipboard}
      >
        <Text className="text-white font-semibold">{copied ? 'Copied!' : 'Copy ID'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="w-full py-3 rounded-lg border border-slate-300 items-center mb-3"
        onPress={shareWithDoctor}
      >
        <Text className="text-slate-700 font-semibold">How to Share</Text>
      </TouchableOpacity>
      <View className="bg-blue-50 rounded-lg p-4 mt-2">
        <Text className="text-base font-semibold text-blue-600 mb-2">Why share your Patient ID?</Text>
        <Text className="text-sm text-blue-600 leading-6">
          • Doctors can send you connection requests{'\n'}
          • Secure access to your medical data{'\n'}
          • Better coordination of your care{'\n'}
          • Real-time monitoring and support
        </Text>
      </View>
    </View>
  );
};