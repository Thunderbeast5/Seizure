import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { useSeizures } from '../../hooks/useSeizures';
import { CreateSeizureData, Seizure } from '../../services/seizureService';
import { CloudinaryService } from '../../services/cloudinaryService';

// Define seizure types for the dropdown
const SEIZURE_TYPES = [
  'Absence (Petit Mal)',
  'Tonic-Clonic (Grand Mal)',
  'Myoclonic',
  'Atonic',
  'Focal',
  'Other'
];

export default function SeizureDiaryScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { 
    seizures, 
    loading, 
    saving,
    addSeizure, 
    updateSeizure,
    deleteSeizure,
    loadSeizures 
  } = useSeizures();
  const [activeTab, setActiveTab] = useState('log'); // 'log' or 'history'
  const [editingSeizure, setEditingSeizure] = useState<string | null>(null);
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(
    new Date().toTimeString().split(' ')[0].substring(0, 5)
  );
  const [seizureType, setSeizureType] = useState('');
  const [duration, setDuration] = useState('');
  const [triggers, setTriggers] = useState('');
  const [notes, setNotes] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploaded, setVideoUploaded] = useState(false);
  
  // Create refs for all inputs to manage focus independently
  const durationRef = useRef<TextInput>(null);
  const triggersRef = useRef<TextInput>(null);
  const notesRef = useRef<TextInput>(null);
  const videoUrlRef = useRef<TextInput>(null);

  const handleSave = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'Please log in to save seizures');
      return;
    }

    if (!seizureType.trim() || !duration.trim()) {
      Alert.alert('Missing Information', 'Please fill in seizure type and duration');
      return;
    }

    // Validate duration is a valid number
    const durationNum = parseInt(duration.trim());
    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid duration in seconds (positive numbers only)');
      return;
    }

    try {
      if (editingSeizure) {
        // Update existing seizure
        const seizureData = {
          date: date.trim(),
          time: time.trim(),
          type: seizureType.trim(),
          duration: duration.trim(),
          triggers: triggers.trim() || null,
          notes: notes.trim() || null,
          videoUrl: videoUrl.trim() || null,
        };

        console.log('Updating seizure:', editingSeizure, seizureData);
        await updateSeizure(editingSeizure, seizureData);
        Alert.alert('Success', 'Seizure updated successfully!');
      } else {
        // Add new seizure
        const seizureData: CreateSeizureData = {
          date: date.trim(),
          time: time.trim(),
          type: seizureType.trim(),
          duration: duration.trim(),
          triggers: triggers.trim() || null,
          notes: notes.trim() || null,
          videoUrl: videoUrl.trim() || null,
        };

        console.log('Adding seizure for user:', user.uid, seizureData);
        await addSeizure(seizureData);
        Alert.alert('Success', 'Seizure logged successfully!');
      }
      
      // Reset form
      resetForm();
      setActiveTab('history');
    } catch (error) {
      console.error('Error saving seizure:', error);
      Alert.alert('Error', 'Failed to save seizure. Please try again.');
    }
  };

  const handleEditSeizure = (seizure: Seizure) => {
    setEditingSeizure(seizure.id || '');
    setDate(seizure.date);
    setTime(seizure.time);
    setSeizureType(seizure.type);
    setDuration(seizure.duration);
    setTriggers(seizure.triggers || '');
    setNotes(seizure.notes || '');
    setVideoUrl(seizure.videoUrl || '');
    setSelectedVideo(null); // Clear selected video when editing
    setActiveTab('log');
  };

  const handleRecordVideo = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera access to record videos.');
        return;
      }

      // Launch camera to record video
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 300, // 5 minutes max
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const videoFile = result.assets[0];
        
        // Show upload progress
        setUploadingVideo(true);
        setVideoUploaded(false);

        try {
          // Upload video to Cloudinary
          const uploadResult = await CloudinaryService.uploadVideo(videoFile.uri, user?.uid || 'anonymous');
          
          // Set the cloud URL instead of local URI
          setSelectedVideo({
            name: `seizure_video_${Date.now()}.mp4`,
            uri: uploadResult.secureUrl,
            size: videoFile.fileSize || 0,
            publicId: uploadResult.publicId,
            cloudUrl: uploadResult.secureUrl
          });
          setVideoUrl(uploadResult.secureUrl);
          
          // Show success state
          setVideoUploaded(true);
          
          // Reset success state after 3 seconds
          setTimeout(() => {
            setVideoUploaded(false);
          }, 3000);
        } catch (uploadError) {
          console.error('Error uploading video:', uploadError);
          // Fallback to local storage
          setSelectedVideo({
            name: `seizure_video_${Date.now()}.mp4`,
            uri: videoFile.uri,
            size: videoFile.fileSize || 0
          });
          setVideoUrl(videoFile.uri);
        } finally {
          setUploadingVideo(false);
        }
      }
    } catch (error) {
      console.error('Error recording video:', error);
      setUploadingVideo(false);
    }
  };

  const handleVideoSelection = async () => {
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library access to select videos.');
        return;
      }

      // Pick video file
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const videoFile = result.assets[0];
        setSelectedVideo(videoFile);
        setVideoUrl(videoFile.uri);
        
        Alert.alert(
          'Video Selected',
          `Video: ${videoFile.name}\nSize: ${(videoFile.size! / (1024 * 1024)).toFixed(2)} MB`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error selecting video:', error);
      Alert.alert('Error', 'Failed to select video. Please try again.');
    }
  };

  const formatDuration = (seconds: string) => {
    const num = parseInt(seconds);
    if (isNaN(num)) return seconds;
    
    if (num < 60) {
      return `${num} seconds`;
    } else if (num < 3600) {
      const minutes = Math.floor(num / 60);
      const remainingSeconds = num % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes} minutes`;
    } else {
      const hours = Math.floor(num / 3600);
      const minutes = Math.floor((num % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().split(' ')[0].substring(0, 5));
    setSeizureType('');
    setDuration('');
    setTriggers('');
    setNotes('');
    setVideoUrl('');
    setSelectedVideo(null);
    setEditingSeizure(null);
  };

  const handleDeleteSeizure = async (seizureId: string, seizureDate: string) => {
    Alert.alert(
      'Delete Seizure',
      `Are you sure you want to delete the seizure from ${seizureDate}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSeizure(seizureId);
              Alert.alert('Success', 'Seizure deleted successfully!');
            } catch (error) {
              console.error('Error deleting seizure:', error);
              Alert.alert('Error', 'Failed to delete seizure. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Show loading screen
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <View className="flex-row items-center justify-between p-5 bg-blue-50">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#4A90E2" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-slate-800">Seizure Diary</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text className="text-lg text-gray-600 mt-4">Loading seizures...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show authentication required message
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <View className="flex-row items-center justify-between p-5 bg-blue-50">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#4A90E2" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-slate-800">Seizure Diary</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="lock-closed" size={64} color="#E74C3C" />
          <Text className="text-xl font-bold text-slate-800 mt-4 mb-2">Authentication Required</Text>
          <Text className="text-lg text-gray-600 text-center">
            Please log in to view and manage your seizures.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderLogTab = () => {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <ScrollView 
            className="flex-1 p-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            contentContainerStyle={{ paddingBottom: 50 }}
            scrollEventThrottle={16}
          >
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-slate-800 mb-4 text-center">
              {editingSeizure ? 'Edit Seizure Entry' : 'Log New Seizure'}
            </Text>
          </View>
          
          {/* Date Field */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-slate-800 mb-3">Date</Text>
            <TouchableOpacity className="bg-white rounded-xl p-5 flex-row items-center justify-between shadow-sm">
              <Text className="text-lg text-slate-800 flex-1">{date}</Text>
              <Ionicons name="calendar" size={28} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          {/* Time Field */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-slate-800 mb-3">Time</Text>
            <TouchableOpacity className="bg-white rounded-xl p-5 flex-row items-center justify-between shadow-sm">
              <Text className="text-lg text-slate-800 flex-1">{time}</Text>
              <Ionicons name="time" size={28} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          {/* Seizure Type Dropdown */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-slate-800 mb-3">Seizure Type*</Text>
            <TouchableOpacity
              className="bg-white rounded-xl p-5 flex-row items-center justify-between shadow-sm"
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
            >
              <Text className={`text-lg flex-1 ${seizureType ? 'text-slate-800' : 'text-gray-400'}`}>
                {seizureType || 'Select seizure type'}
              </Text>
              <Ionicons name={showTypeDropdown ? "chevron-up" : "chevron-down"} size={28} color="#4A90E2" />
            </TouchableOpacity>

            {showTypeDropdown && (
              <View className="bg-white rounded-xl mt-2 shadow-md z-10">
                {SEIZURE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    className="p-5 border-b border-gray-100"
                    onPress={() => {
                      setSeizureType(type);
                      setShowTypeDropdown(false);
                    }}
                  >
                    <Text className="text-lg text-slate-800">{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Duration Field - Completely Isolated */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-slate-800 mb-3">Duration* (in seconds)</Text>
            <View className="bg-white rounded-xl p-5 shadow-sm">
              <TextInput
                ref={durationRef}
                style={{
                  fontSize: 18,
                  color: '#1E293B',
                  flex: 1,
                  padding: 0,
                  margin: 0
                }}
                value={duration}
                onChangeText={(text) => {
                  console.log('Duration changed:', text);
                  setDuration(text);
                }}
                placeholder="e.g., 30, 120, 45"
                placeholderTextColor="#A0A0A0"
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => triggersRef.current?.focus()}
                clearButtonMode="while-editing"
                blurOnSubmit={false}
              />
            </View>
            <Text className="text-sm text-gray-500 mt-1">Enter duration in seconds (numbers only)</Text>
          </View>

          {/* Triggers Field - Completely Isolated */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-slate-800 mb-3">Triggers (if known)</Text>
            <View className="bg-white rounded-xl p-5 shadow-sm">
              <TextInput
                ref={triggersRef}
                style={{
                  fontSize: 18,
                  color: '#1E293B',
                  flex: 1,
                  padding: 0,
                  margin: 0
                }}
                value={triggers}
                onChangeText={(text) => {
                  console.log('Triggers changed:', text);
                  setTriggers(text);
                }}
                placeholder="e.g., missed medication, lack of sleep"
                placeholderTextColor="#A0A0A0"
                returnKeyType="next"
                onSubmitEditing={() => notesRef.current?.focus()}
                clearButtonMode="while-editing"
                blurOnSubmit={false}
              />
            </View>
          </View>

          {/* Record Video Section */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-slate-800 mb-3">Record Video</Text>
            <TouchableOpacity
              className={`rounded-xl p-4 flex-row items-center justify-center shadow-sm transition-all duration-300 ${
                videoUploaded 
                  ? 'bg-green-500' 
                  : uploadingVideo 
                    ? 'bg-blue-500' 
                    : 'bg-red-500'
              }`}
              onPress={handleRecordVideo}
              disabled={uploadingVideo}
              style={{
                transform: uploadingVideo ? [{ scale: 0.95 }] : [{ scale: 1 }],
                opacity: uploadingVideo ? 0.8 : 1,
              }}
            >
              {uploadingVideo ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-semibold text-lg ml-2">Uploading...</Text>
                </>
              ) : videoUploaded ? (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text className="text-white font-semibold text-lg ml-2">Video Uploaded!</Text>
                </>
              ) : (
                <>
                  <Ionicons name="videocam" size={24} color="white" />
                  <Text className="text-white font-semibold text-lg ml-2">Record Seizure Video</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Notes Field - Completely Isolated */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-slate-800 mb-3">Notes</Text>
            <View className="bg-white rounded-xl p-5 shadow-sm" style={{ minHeight: 120 }}>
              <TextInput
                ref={notesRef}
                style={{
                  fontSize: 18,
                  color: '#1E293B',
                  flex: 1,
                  textAlignVertical: 'top',
                  padding: 0,
                  margin: 0,
                  minHeight: 100
                }}
                value={notes}
                onChangeText={(text) => {
                  console.log('Notes changed:', text);
                  setNotes(text);
                }}
                placeholder="Additional observations or notes"
                placeholderTextColor="#A0A0A0"
                multiline={true}
                numberOfLines={4}
                returnKeyType="next"
                onSubmitEditing={() => videoUrlRef.current?.focus()}
              />
            </View>
          </View>

          {/* Video Attachment Section */}
          

          {/* Action Buttons */}
          <View className="flex-row justify-between mt-6 mb-12">
            {editingSeizure && (
              <TouchableOpacity 
                className="bg-gray-100 rounded-xl p-5 flex-1 items-center mr-3"
                onPress={() => {
                  resetForm();
                  setActiveTab('history');
                }}
                disabled={saving}
              >
                <Text className="text-gray-600 text-xl font-medium">Cancel</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              className={`rounded-xl p-5 flex-1 items-center ${editingSeizure ? 'ml-3' : ''} ${saving ? 'bg-gray-400' : 'bg-green-500'}`}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-xl font-bold">
                  {editingSeizure ? 'Update Seizure' : 'Save Seizure Log'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
    );
  };

  const renderHistoryTab = () => (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      {/* Debug info - remove in production */}
      {__DEV__ && (
        <View className="bg-blue-100 p-3 rounded-lg mb-4">
          <Text className="text-sm text-blue-800">
            User ID: {user?.uid || 'Not logged in'}
          </Text>
          <Text className="text-sm text-blue-800">
            Seizures found: {seizures.length}
          </Text>
        </View>
      )}

      {seizures.length === 0 ? (
        <View className="flex-1 justify-center items-center py-12">
          <Ionicons name="medical-outline" size={64} color="#A0A0A0" />
          <Text className="text-xl font-bold text-gray-600 mt-4 mb-2">No Seizures Logged</Text>
          <Text className="text-lg text-gray-500 text-center mb-6">
            You haven&apos;t logged any seizures yet. Tap the button below to get started.
          </Text>
        </View>
      ) : (
        seizures.map((seizure) => (
          <TouchableOpacity
            key={seizure.id}
            className="bg-white rounded-xl p-5 mb-5 shadow-sm"
            onPress={() => {
              // Navigate to detail view
            }}
          >
            <View className="flex-row justify-between mb-3">
              <Text className="text-xl font-semibold text-slate-800">{seizure.date}</Text>
              <Text className="text-xl text-slate-600">{seizure.time}</Text>
            </View>
            <Text className="text-2xl font-bold text-slate-800 mb-3">{seizure.type}</Text>
            <View className="mb-4">
              <Text className="text-lg text-slate-800 mb-2">Duration: {formatDuration(seizure.duration)}</Text>
              {seizure.triggers && (
                <Text className="text-lg text-slate-800 mb-2">Triggers: {seizure.triggers}</Text>
              )}
              {seizure.notes && (
                <Text className="text-lg text-slate-800 mb-2">Notes: {seizure.notes}</Text>
              )}
              {seizure.videoUrl && (
                <View className="mb-2">
                  <Text className="text-lg text-slate-800 mb-1">Video:</Text>
                  <TouchableOpacity 
                    className="bg-blue-50 p-3 rounded-lg flex-row items-center"
                    onPress={() => {
                      Alert.alert(
                        'Video Link',
                        seizure.videoUrl!,
                        [
                          { text: 'Copy', onPress: () => {
                            // Copy to clipboard functionality can be added here
                            Alert.alert('Info', 'Video URL: ' + seizure.videoUrl);
                          }},
                          { text: 'Close' }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="videocam" size={20} color="#4A90E2" />
                    <Text className="text-blue-600 ml-2 flex-1" numberOfLines={1}>
                      {seizure.videoUrl.length > 40 ? seizure.videoUrl.substring(0, 40) + '...' : seizure.videoUrl}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View className="flex-row border-t border-gray-100 pt-4">
              <TouchableOpacity 
                className="flex-row items-center mr-8"
                onPress={() => handleEditSeizure(seizure)}
              >
                <Ionicons name="create-outline" size={24} color="#4A90E2" />
                <Text className="text-lg text-blue-500 ml-2">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center mr-8">
                <Ionicons name="share-outline" size={24} color="#4A90E2" />
                <Text className="text-lg text-blue-500 ml-2">Share</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => handleDeleteSeizure(seizure.id!, seizure.date)}
              >
                <Ionicons name="trash-outline" size={24} color="#E74C3C" />
                <Text className="text-lg text-red-500 ml-2">Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity
        className="bg-blue-500 rounded-xl p-5 flex-row items-center justify-center mt-3 mb-12"
        onPress={() => {
          resetForm();
          setActiveTab('log');
        }}
      >
        <Ionicons name="add-circle" size={28} color="white" />
        <Text className="text-white text-lg font-semibold ml-3">Add New Seizure</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="flex-row items-center justify-between p-5 bg-blue-50">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#4A90E2" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-slate-800">Seizure Diary</Text>
        <TouchableOpacity 
          className="p-2"
          onPress={() => {
            if (user?.uid) {
              loadSeizures();
            }
          }}
        >
          <Ionicons name="refresh" size={28} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <View className="flex-row bg-blue-50 mb-3">
        <TouchableOpacity
          className={`flex-1 py-5 items-center border-b-2 ${activeTab === 'log' ? 'border-blue-500' : 'border-transparent'}`}
          onPress={() => setActiveTab('log')}
        >
          <Text className={`text-xl font-semibold ${activeTab === 'log' ? 'text-blue-500 font-bold' : 'text-slate-500'}`}>
            Log Seizure
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-5 items-center border-b-2 ${activeTab === 'history' ? 'border-blue-500' : 'border-transparent'}`}
          onPress={() => setActiveTab('history')}
        >
          <Text className={`text-xl font-semibold ${activeTab === 'history' ? 'text-blue-500 font-bold' : 'text-slate-500'}`}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'log' ? renderLogTab() : renderHistoryTab()}
    </SafeAreaView>
  );
}