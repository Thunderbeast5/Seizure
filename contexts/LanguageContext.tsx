// contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define supported languages
export type Language = 'en' | 'hi' | 'mr';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => Promise<void>;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = '@seizure_tracker_language';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  // Load saved language on app start
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLanguage && SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage)) {
        setCurrentLanguage(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  };

  const changeLanguage = async (language: Language) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, language);
      setCurrentLanguage(language);
      
      // Note: RTL handling should be done at app restart level
      // For immediate effect, you might need to restart the app
      console.log('Language changed to:', language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const isRTL = false; // None of these languages are RTL

  // Translation function
  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    t,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation strings - same as before
interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // App Title
    seizure_tracker: 'Seizure Tracker',
    pediatric_seizure_monitoring: 'Pediatric Seizure Monitoring',
    
    // Menu
    menu: 'Menu',
    change_language: 'Change Language',
    
    // Main Features
    seizure_diary: 'Seizure Diary',
    seizure_diary_desc: 'Log and track seizures',
    medication_reminder: 'Medication Reminder',
    medication_reminder_desc: 'Track and set reminders',
    doctor_connect: 'Doctor Connect',
    doctor_connect_desc: 'Share data with doctors',
    education: 'Education',
    education_desc: 'Articles and tips',
    
    // Menu Items
    settings: 'Settings',
    help_support: 'Help & Support',
    about: 'About',
    logout: 'Logout',
    
    // Language Selection
    select_language: 'Select Language',
    current_language: 'Current Language',
    
    // Common
    cancel: 'Cancel',
    confirm: 'Confirm',
    ok: 'OK',
    
    // Alerts
    settings_coming_soon: 'Settings screen coming soon!',
    help_coming_soon: 'Help & Support coming soon!',
    about_coming_soon: 'About Seizure Tracker coming soon!',
    logout_coming_soon: 'Logout coming soon!',
    language_changed: 'Language changed successfully!',
    navigation_error: 'Navigation Error',
    could_not_navigate: 'Could not navigate to',
  },

  hi: {
    // App Title
    seizure_tracker: 'दौरा ट्रैकर',
    pediatric_seizure_monitoring: 'बाल चिकित्सा दौरा निगरानी',
    
    // Menu
    menu: 'मेनू',
    change_language: 'भाषा बदलें',
    
    // Main Features
    seizure_diary: 'दौरा डायरी',
    seizure_diary_desc: 'दौरे लॉग और ट्रैक करें',
    medication_reminder: 'दवा याददाश्त',
    medication_reminder_desc: 'ट्रैक करें और रिमाइंडर सेट करें',
    doctor_connect: 'डॉक्टर कनेक्ट',
    doctor_connect_desc: 'डॉक्टरों के साथ डेटा साझा करें',
    education: 'शिक्षा',
    education_desc: 'लेख और सुझाव',
    
    // Menu Items
    settings: 'सेटिंग्स',
    help_support: 'सहायता और समर्थन',
    about: 'के बारे में',
    logout: 'लॉग आउट',
    
    // Language Selection
    select_language: 'भाषा चुनें',
    current_language: 'वर्तमान भाषा',
    
    // Common
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    ok: 'ठीक है',
    
    // Alerts
    settings_coming_soon: 'सेटिंग्स स्क्रीन जल्द आ रही है!',
    help_coming_soon: 'सहायता और समर्थन जल्द आ रहा है!',
    about_coming_soon: 'दौरा ट्रैकर के बारे में जल्द आ रहा है!',
    logout_coming_soon: 'लॉग आउट जल्द आ रहा है!',
    language_changed: 'भाषा सफलतापूर्वक बदल गई!',
    navigation_error: 'नेवीगेशन त्रुटि',
    could_not_navigate: 'नेवीगेट नहीं कर सका',
  },

  mr: {
    // App Title
    seizure_tracker: 'फिट ट्रॅकर',
    pediatric_seizure_monitoring: 'बालरोग फिट निरीक्षण',
    
    // Menu
    menu: 'मेनू',
    change_language: 'भाषा बदला',
    
    // Main Features
    seizure_diary: 'फिट डायरी',
    seizure_diary_desc: 'फिट नोंदवा आणि ट्रॅक करा',
    medication_reminder: 'औषध आठवणी',
    medication_reminder_desc: 'ट्रॅक करा आणि आठवणी सेट करा',
    doctor_connect: 'डॉक्टर कनेक्ट',
    doctor_connect_desc: 'डॉक्टरांसोबत डेटा शेअर करा',
    education: 'शिक्षण',
    education_desc: 'लेख आणि सुचवणे',
    
    // Menu Items
    settings: 'सेटिंग्ज',
    help_support: 'मदत आणि सपोर्ट',
    about: 'बद्दल',
    logout: 'लॉग आउट',
    
    // Language Selection
    select_language: 'भाषा निवडा',
    current_language: 'सध्याची भाषा',
    
    // Common
    cancel: 'रद्द करा',
    confirm: 'पुष्टी करा',
    ok: 'ठीक आहे',
    
    // Alerts
    settings_coming_soon: 'सेटिंग्ज स्क्रीन लवकरच येत आहे!',
    help_coming_soon: 'मदत आणि सपोर्ट लवकरच येत आहे!',
    about_coming_soon: 'फिट ट्रॅकर बद्दल लवकरच येत आहे!',
    logout_coming_soon: 'लॉग आउट लवकरच येत आहे!',
    language_changed: 'भाषा यशस्वीरित्या बदलली!',
    navigation_error: 'नेव्हिगेशन त्रुटी',
    could_not_navigate: 'नेव्हिगेट करू शकलो नाही',
  },
};