// index.tsx - Updated with multilingual support and fixed RTL handling
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Modal, Platform, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { LanguageSelector } from '../../components/LanguageSelector';
import { useLanguage } from '../../contexts/LanguageContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLanguageSelectorVisible, setIsLanguageSelectorVisible] = useState(false);
  const slideAnimation = useRef(new Animated.Value(-screenWidth * 0.8)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  // Get language context
  const { t, isRTL, currentLanguage } = useLanguage();

  // Remove the problematic useEffect for RTL
  // RTL should be handled at the app level, not component level

  // --- Handler for the menu button ---
  const handleMenuPress = useCallback(() => {
    console.log('Menu button pressed!');
    setIsDrawerOpen(true);
    
    // Animate drawer slide in
    Animated.parallel([
      Animated.timing(slideAnimation, {
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
  }, [slideAnimation, overlayOpacity]);

  const closeDrawer = useCallback(() => {
    // Animate drawer slide out
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: -screenWidth * 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsDrawerOpen(false);
    });
  }, [slideAnimation, overlayOpacity]);

  const handleSeizureDiary = useCallback(() => {
    console.log('Attempting to navigate to seizure diary...');
    try {
      router.navigate('/screens/seizure-diary');
      console.log('Navigation to seizure diary attempted');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(t('navigation_error'), `${t('could_not_navigate')} ${t('seizure_diary')}`);
    }
  }, [t]);

  const handleMedicationReminder = useCallback(() => {
    console.log('Attempting to navigate to medication reminder...');
    try {
      router.navigate('/screens/medication-reminder');
      console.log('Navigation to medication reminder attempted');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(t('navigation_error'), `${t('could_not_navigate')} ${t('medication_reminder')}`);
    }
  }, [t]);

  const handleDoctorConnect = useCallback(() => {
    console.log('Attempting to navigate to doctor connect...');
    try {
      router.navigate('/screens/doctor-connect');
      console.log('Navigation to doctor connect attempted');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(t('navigation_error'), `${t('could_not_navigate')} ${t('doctor_connect')}`);
    }
  }, [t]);

  const handleEducation = useCallback(() => {
    console.log('Attempting to navigate to education...');
    try {
      router.navigate('/screens/education');
      console.log('Navigation to education attempted');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(t('navigation_error'), `${t('could_not_navigate')} ${t('education')}`);
    }
  }, [t]);

  const handleLanguageSelect = useCallback(() => {
    closeDrawer();
    // Add a small delay to ensure drawer is closed before opening language selector
    setTimeout(() => {
      setIsLanguageSelectorVisible(true);
    }, 300);
  }, [closeDrawer]);

  const handleGoToLogin = useCallback(() => {
    router.replace('/login'); 
  }, []);

  const DrawerMenu = () => (
    <Modal
      visible={isDrawerOpen}
      transparent={true}
      animationType="none"
      onRequestClose={closeDrawer}
    >
      {/* Blurred Background Overlay */}
      <Animated.View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: overlayOpacity,
        }}
      >
        <BlurView
          intensity={30}
          tint="dark"
          style={{
            flex: 1,
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={closeDrawer}
            activeOpacity={1}
          />
        </BlurView>
      </Animated.View>

      {/* Drawer Content */}
      <Animated.View
        style={{
          position: 'absolute',
          left: isRTL ? undefined : 0,
          right: isRTL ? 0 : undefined,
          top: 0,
          bottom: 0,
          width: screenWidth * 0.9,
          transform: [{ 
            translateX: isRTL 
              ? Animated.multiply(slideAnimation, -1) 
              : slideAnimation 
          }],
        }}
      >
        <BlurView
          intensity={80}
          tint="light"
          style={{
            flex: 1,
            paddingTop: Platform.OS === 'ios' ? 50 : 30,
            paddingHorizontal: 20,
            borderWidth: 0,
          }}
        >
          {/* Drawer Header */}
          <View 
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 32,
              paddingBottom: 16,
            }}
          >
            <Text 
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#1E293B',
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {t('menu')}
            </Text>
            <TouchableOpacity onPress={closeDrawer} style={{ padding: 8 }}>
              <Ionicons name="close" size={28} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Change Language Option */}
            <TouchableOpacity 
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 8,
                marginBottom: 8,
                borderRadius: 12,
                backgroundColor: 'rgba(74, 144, 226, 0.1)',
              }}
              onPress={handleLanguageSelect}
            >
              <Ionicons 
                name="language" 
                size={24} 
                color="#4A90E2" 
                style={{ 
                  marginRight: isRTL ? 0 : 16, 
                  marginLeft: isRTL ? 16 : 0 
                }} 
              />
              <Text 
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1E293B',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('change_language')}
              </Text>
            </TouchableOpacity>

            {/* Seizure Diary */}
            <TouchableOpacity 
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 8,
                marginBottom: 8,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }}
              onPress={() => {
                closeDrawer();
                setTimeout(handleSeizureDiary, 300);
              }}
            >
              <Ionicons 
                name="calendar" 
                size={24} 
                color="#4A90E2" 
                style={{ 
                  marginRight: isRTL ? 0 : 16, 
                  marginLeft: isRTL ? 16 : 0 
                }} 
              />
              <Text 
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1E293B',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('seizure_diary')}
              </Text>
            </TouchableOpacity>

            {/* Medication Reminder */}
            <TouchableOpacity 
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 8,
                marginBottom: 8,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }}
              onPress={() => {
                closeDrawer();
                setTimeout(handleMedicationReminder, 300);
              }}
            >
              <Ionicons 
                name="medical" 
                size={24} 
                color="#4A90E2" 
                style={{ 
                  marginRight: isRTL ? 0 : 16, 
                  marginLeft: isRTL ? 16 : 0 
                }} 
              />
              <Text 
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1E293B',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('medication_reminder')}
              </Text>
            </TouchableOpacity>

            {/* Doctor Connect */}
            <TouchableOpacity 
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 8,
                marginBottom: 8,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }}
              onPress={() => {
                closeDrawer();
                setTimeout(handleDoctorConnect, 300);
              }}
            >
              <Ionicons 
                name="people" 
                size={24} 
                color="#4A90E2" 
                style={{ 
                  marginRight: isRTL ? 0 : 16, 
                  marginLeft: isRTL ? 16 : 0 
                }} 
              />
              <Text 
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1E293B',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('doctor_connect')}
              </Text>
            </TouchableOpacity>

            {/* Education */}
            <TouchableOpacity 
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 8,
                marginBottom: 8,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }}
              onPress={() => {
                closeDrawer();
                setTimeout(handleEducation, 300);
              }}
            >
              <Ionicons 
                name="book" 
                size={24} 
                color="#4A90E2" 
                style={{ 
                  marginRight: isRTL ? 0 : 16, 
                  marginLeft: isRTL ? 16 : 0 
                }} 
              />
              <Text 
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1E293B',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('education')}
              </Text>
            </TouchableOpacity>

            {/* Settings */}
            <TouchableOpacity 
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 8,
                marginBottom: 8,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }}
              onPress={() => {
                closeDrawer();
                setTimeout(() => {
                  Alert.alert(t('settings'), t('settings_coming_soon'));
                }, 300);
              }}
            >
              <Ionicons 
                name="settings" 
                size={24} 
                color="#4A90E2" 
                style={{ 
                  marginRight: isRTL ? 0 : 16, 
                  marginLeft: isRTL ? 16 : 0 
                }} 
              />
              <Text 
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1E293B',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('settings')}
              </Text>
            </TouchableOpacity>

            {/* Help & Support */}
            <TouchableOpacity 
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 8,
                marginBottom: 8,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }}
              onPress={() => {
                closeDrawer();
                setTimeout(() => {
                  Alert.alert(t('help_support'), t('help_coming_soon'));
                }, 300);
              }}
            >
              <Ionicons 
                name="help-circle" 
                size={24} 
                color="#4A90E2" 
                style={{ 
                  marginRight: isRTL ? 0 : 16, 
                  marginLeft: isRTL ? 16 : 0 
                }} 
              />
              <Text 
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1E293B',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('help_support')}
              </Text>
            </TouchableOpacity>

            {/* About */}
            <TouchableOpacity 
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 8,
                marginBottom: 8,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }}
              onPress={() => {
                closeDrawer();
                setTimeout(() => {
                  Alert.alert(t('about'), t('about_coming_soon'));
                }, 300);
              }}
            >
              <Ionicons 
                name="information-circle" 
                size={24} 
                color="#4A90E2" 
                style={{ 
                  marginRight: isRTL ? 0 : 16, 
                  marginLeft: isRTL ? 16 : 0 
                }} 
              />
              <Text 
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1E293B',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('about')}
              </Text>
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity 
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 8,
                marginBottom: 8,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }}
              onPress={() => {
                closeDrawer();
                setTimeout(handleGoToLogin, 300);
              }}
            >
              <Ionicons 
                name="log-out-outline" 
                size={28} 
                color="red" 
                style={{ 
                  marginRight: isRTL ? 0 : 16, 
                  marginLeft: isRTL ? 16 : 0 
                }} 
              />
              <Text 
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1E293B',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('logout')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </BlurView>
      </Animated.View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <StatusBar barStyle="dark-content" backgroundColor="#E6F3F8" />
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ flexGrow: 1 }}>
        {/* --- Updated Header --- */}
        <View 
          style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            marginTop: 32,
            marginBottom: 10,
            paddingHorizontal: 0,
            justifyContent: Platform.OS === 'android' ? 'flex-start' : 'space-between',
          }}
        >
          {/* Menu Icon */}
          <TouchableOpacity 
            onPress={handleMenuPress} 
            style={{
              marginRight: Platform.OS === 'android' && !isRTL ? 16 : 0,
              marginLeft: Platform.OS === 'android' && isRTL ? 16 : 0,
            }}
          >
            <Ionicons name="menu" size={32} color="#4A90E2" />
          </TouchableOpacity>
          
          {/* Title and Subtitle */}
          <View style={{ alignItems: Platform.OS === 'ios' ? 'center' : (isRTL ? 'flex-end' : 'flex-start') }}>
            <Text 
              style={{
                fontSize: 30,
                fontWeight: 'bold',
                color: '#1E293B',
                textAlign: 'center',
              }}
            >
              {t('seizure_tracker')}
            </Text>
            <Text 
              style={{
                fontSize: 18,
                color: '#64748B',
                textAlign: 'center',
                lineHeight: 24,
              }}
            >
              {t('pediatric_seizure_monitoring')}
            </Text>
          </View>

          {/* Spacer View for iOS to keep title centered */}
          {Platform.OS === 'ios' && <View style={{ width: 32 }} />}
        </View>

        {/* Feature Buttons Grid */}
        <View 
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginTop: 32,
            paddingBottom: 40,
          }}
        >
          {/* Seizure Diary */}
          <TouchableOpacity 
            style={{
              backgroundColor: 'white',
              width: '48%',
              padding: 28,
              borderRadius: 16,
              marginBottom: 24,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
              minHeight: 220,
            }}
            onPress={handleSeizureDiary}
          >
            <View style={{ marginBottom: 16, padding: 8 }}>
              <Ionicons name="calendar" size={60} color="#4A90E2" />
            </View>
            <Text 
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#1E293B',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              {t('seizure_diary')}
            </Text>
            <Text 
              style={{
                fontSize: 16,
                color: '#64748B',
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              {t('seizure_diary_desc')}
            </Text>
          </TouchableOpacity>

          {/* Medication Reminder */}
          <TouchableOpacity 
            style={{
              backgroundColor: 'white',
              width: '48%',
              padding: 28,
              borderRadius: 16,
              marginBottom: 24,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
              minHeight: 220,
            }}
            onPress={handleMedicationReminder}
          >
            <View style={{ marginBottom: 16, padding: 8 }}>
              <Ionicons name="medical" size={60} color="#4A90E2" />
            </View>
            <Text 
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#1E293B',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              {t('medication_reminder')}
            </Text>
            <Text 
              style={{
                fontSize: 16,
                color: '#64748B',
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              {t('medication_reminder_desc')}
            </Text>
          </TouchableOpacity>

          {/* Doctor Connect */}
          <TouchableOpacity 
            style={{
              backgroundColor: 'white',
              width: '48%',
              padding: 24,
              borderRadius: 16,
              marginBottom: 24,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
              minHeight: 220,
            }}
            onPress={handleDoctorConnect}
          >
            <View style={{ marginBottom: 16, padding: 8 }}>
              <Ionicons name="people" size={60} color="#4A90E2" />
            </View>
            <Text 
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#1E293B',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              {t('doctor_connect')}
            </Text>
            <Text 
              style={{
                fontSize: 16,
                color: '#64748B',
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              {t('doctor_connect_desc')}
            </Text>
          </TouchableOpacity>

          {/* Education */}
          <TouchableOpacity 
            style={{
              backgroundColor: 'white',
              width: '48%',
              padding: 24,
              borderRadius: 16,
              marginBottom: 24,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
              minHeight: 220,
            }}
            onPress={handleEducation}
          >
            <View style={{ marginBottom: 16, padding: 8 }}>
              <Ionicons name="book" size={60} color="#4A90E2" />
            </View>
            <Text 
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#1E293B',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              {t('education')}
            </Text>
            <Text 
              style={{
                fontSize: 16,
                color: '#64748B',
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              {t('education_desc')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Drawer Component */}
      <DrawerMenu />
      
      {/* Language Selector Modal */}
      <LanguageSelector 
        visible={isLanguageSelectorVisible}
        onClose={() => setIsLanguageSelectorVisible(false)}
      />
    </SafeAreaView>
  );
}