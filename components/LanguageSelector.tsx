import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  visible,
  onClose,
}) => {
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const handleLanguageSelect = async (languageCode: Language) => {
    try {
      await changeLanguage(languageCode);
      onClose();
      // Optional: Show success message
      console.log('Language changed to:', languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Background Overlay */}
      <View className="flex-1 justify-center items-center">
        <BlurView
          intensity={50}
          tint="dark"
          className="absolute inset-0"
        >
          <TouchableOpacity
            className="flex-1"
            onPress={onClose}
            activeOpacity={1}
          />
        </BlurView>

        {/* Language Selection Modal */}
        <View className="bg-white rounded-2xl mx-6 p-6 min-w-[300px] max-w-[400px] shadow-2xl">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">
              {t('select_language')}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          {/* Current Language Display */}
          <View className="mb-4 p-3 bg-blue-50 rounded-lg">
            <Text className="text-sm font-medium text-blue-600 mb-1">
              {t('current_language')}
            </Text>
            <Text className="text-lg font-semibold text-blue-800">
              {SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage)?.nativeName || 'English'}
            </Text>
          </View>

          {/* Language Options */}
          <ScrollView className="max-h-64" showsVerticalScrollIndicator={false}>
            {SUPPORTED_LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                className={`flex-row items-center justify-between p-4 rounded-lg mb-2 ${
                  currentLanguage === language.code 
                    ? 'bg-blue-100 border-2 border-blue-300' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
                onPress={() => handleLanguageSelect(language.code)}
                activeOpacity={0.7}
              >
                <View className="flex-1">
                  <Text className={`text-lg font-semibold ${
                    currentLanguage === language.code ? 'text-blue-800' : 'text-gray-800'
                  }`}>
                    {language.nativeName}
                  </Text>
                  <Text className={`text-sm ${
                    currentLanguage === language.code ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {language.name}
                  </Text>
                </View>
                
                {currentLanguage === language.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#4A90E2" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Cancel Button */}
          <TouchableOpacity
            className="mt-6 py-3 px-6 bg-gray-200 rounded-lg"
            onPress={onClose}
          >
            <Text className="text-center text-gray-700 font-semibold text-lg">
              {t('cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};