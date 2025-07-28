// components/LanguageSelector.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageOption } from '../contexts/LanguageContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ visible, onClose }) => {
  const { currentLanguage, changeLanguage, t, isRTL } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleLanguageSelect = (language: LanguageOption) => {
    setSelectedLanguage(language.code);
  };

  const handleConfirm = async () => {
    try {
      await changeLanguage(selectedLanguage);
      Alert.alert(t('ok'), t('language_changed'));
      onClose();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const getCurrentLanguageName = () => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage);
    return lang ? `${lang.flag} ${lang.nativeName}` : 'English';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Background Overlay */}
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <BlurView
          intensity={30}
          tint="dark"
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <TouchableOpacity
            style={{ flex: 1, width: '100%' }}
            onPress={onClose}
            activeOpacity={1}
          />
          
          {/* Language Selection Modal */}
          <View
            style={{
              width: screenWidth * 0.9,
              maxHeight: screenHeight * 0.7,
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            {/* Header */}
            <View 
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
                paddingBottom: 15,
                borderBottomWidth: 1,
                borderBottomColor: '#E5E7EB',
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#1F2937',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('select_language')}
              </Text>
              <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
                <Ionicons name="close" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Current Language */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#6B7280',
                  marginBottom: 8,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('current_language')}
              </Text>
              <View
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: '#EBF4FF',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: '#4A90E2',
                }}
              >
                <Text style={{ fontSize: 18, color: '#1F2937' }}>
                  {getCurrentLanguageName()}
                </Text>
              </View>
            </View>

            {/* Language Options */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: screenHeight * 0.4 }}
            >
              {SUPPORTED_LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  onPress={() => handleLanguageSelect(language)}
                  style={{
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 16,
                    marginBottom: 8,
                    backgroundColor: selectedLanguage === language.code ? '#EBF4FF' : '#F9FAFB',
                    borderRadius: 12,
                    borderWidth: selectedLanguage === language.code ? 2 : 1,
                    borderColor: selectedLanguage === language.code ? '#4A90E2' : '#E5E7EB',
                  }}
                >
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 24, marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }}>
                      {language.flag}
                    </Text>
                    <View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '600',
                          color: '#1F2937',
                          textAlign: isRTL ? 'right' : 'left',
                        }}
                      >
                        {language.nativeName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#6B7280',
                          textAlign: isRTL ? 'right' : 'left',
                        }}
                      >
                        {language.name}
                      </Text>
                    </View>
                  </View>
                  {selectedLanguage === language.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#4A90E2" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                justifyContent: 'space-between',
                marginTop: 20,
                paddingTop: 20,
                borderTopWidth: 1,
                borderTopColor: '#E5E7EB',
              }}
            >
              <TouchableOpacity
                onPress={onClose}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  backgroundColor: '#F3F4F6',
                  borderRadius: 12,
                  marginRight: isRTL ? 0 : 10,
                  marginLeft: isRTL ? 10 : 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#6B7280',
                    textAlign: 'center',
                  }}
                >
                  {t('cancel')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleConfirm}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  backgroundColor: '#4A90E2',
                  borderRadius: 12,
                  marginLeft: isRTL ? 0 : 10,
                  marginRight: isRTL ? 10 : 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  {t('confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity
            style={{ flex: 1, width: '100%' }}
            onPress={onClose}
            activeOpacity={1}
          />
        </BlurView>
      </View>
    </Modal>
  );
};