// contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define supported languages
export type Language = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'ar';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
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
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const isRTL = currentLanguage === 'ar';

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

// Translation strings
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
  
  es: {
    // App Title
    seizure_tracker: 'Rastreador de Convulsiones',
    pediatric_seizure_monitoring: 'Monitoreo de Convulsiones Pediátricas',
    
    // Menu
    menu: 'Menú',
    change_language: 'Cambiar Idioma',
    
    // Main Features
    seizure_diary: 'Diario de Convulsiones',
    seizure_diary_desc: 'Registrar y rastrear convulsiones',
    medication_reminder: 'Recordatorio de Medicación',
    medication_reminder_desc: 'Rastrear y configurar recordatorios',
    doctor_connect: 'Conectar con Doctor',
    doctor_connect_desc: 'Compartir datos con doctores',
    education: 'Educación',
    education_desc: 'Artículos y consejos',
    
    // Menu Items
    settings: 'Configuración',
    help_support: 'Ayuda y Soporte',
    about: 'Acerca de',
    logout: 'Cerrar Sesión',
    
    // Language Selection
    select_language: 'Seleccionar Idioma',
    current_language: 'Idioma Actual',
    
    // Common
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    ok: 'OK',
    
    // Alerts
    settings_coming_soon: '¡Pantalla de configuración próximamente!',
    help_coming_soon: '¡Ayuda y soporte próximamente!',
    about_coming_soon: '¡Acerca del Rastreador de Convulsiones próximamente!',
    logout_coming_soon: '¡Cerrar sesión próximamente!',
    language_changed: '¡Idioma cambiado exitosamente!',
    navigation_error: 'Error de Navegación',
    could_not_navigate: 'No se pudo navegar a',
  },

  fr: {
    // App Title
    seizure_tracker: 'Suivi des Crises',
    pediatric_seizure_monitoring: 'Surveillance des Crises Pédiatriques',
    
    // Menu
    menu: 'Menu',
    change_language: 'Changer la Langue',
    
    // Main Features
    seizure_diary: 'Journal des Crises',
    seizure_diary_desc: 'Enregistrer et suivre les crises',
    medication_reminder: 'Rappel de Médicament',
    medication_reminder_desc: 'Suivre et définir des rappels',
    doctor_connect: 'Connexion Médecin',
    doctor_connect_desc: 'Partager des données avec les médecins',
    education: 'Éducation',
    education_desc: 'Articles et conseils',
    
    // Menu Items
    settings: 'Paramètres',
    help_support: 'Aide et Support',
    about: 'À propos',
    logout: 'Déconnexion',
    
    // Language Selection
    select_language: 'Sélectionner la Langue',
    current_language: 'Langue Actuelle',
    
    // Common
    cancel: 'Annuler',
    confirm: 'Confirmer',
    ok: 'OK',
    
    // Alerts
    settings_coming_soon: 'Écran des paramètres bientôt disponible!',
    help_coming_soon: 'Aide et support bientôt disponible!',
    about_coming_soon: 'À propos du Suivi des Crises bientôt disponible!',
    logout_coming_soon: 'Déconnexion bientôt disponible!',
    language_changed: 'Langue changée avec succès!',
    navigation_error: 'Erreur de Navigation',
    could_not_navigate: 'Impossible de naviguer vers',
  },

  de: {
    // App Title
    seizure_tracker: 'Anfalls-Tracker',
    pediatric_seizure_monitoring: 'Pädiatrische Anfallsüberwachung',
    
    // Menu
    menu: 'Menü',
    change_language: 'Sprache Ändern',
    
    // Main Features
    seizure_diary: 'Anfalls-Tagebuch',
    seizure_diary_desc: 'Anfälle protokollieren und verfolgen',
    medication_reminder: 'Medikamenten-Erinnerung',
    medication_reminder_desc: 'Verfolgen und Erinnerungen setzen',
    doctor_connect: 'Arzt-Verbindung',
    doctor_connect_desc: 'Daten mit Ärzten teilen',
    education: 'Bildung',
    education_desc: 'Artikel und Tipps',
    
    // Menu Items
    settings: 'Einstellungen',
    help_support: 'Hilfe & Support',
    about: 'Über',
    logout: 'Abmelden',
    
    // Language Selection
    select_language: 'Sprache Auswählen',
    current_language: 'Aktuelle Sprache',
    
    // Common
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    ok: 'OK',
    
    // Alerts
    settings_coming_soon: 'Einstellungsbildschirm kommt bald!',
    help_coming_soon: 'Hilfe & Support kommt bald!',
    about_coming_soon: 'Über Anfalls-Tracker kommt bald!',
    logout_coming_soon: 'Abmelden kommt bald!',
    language_changed: 'Sprache erfolgreich geändert!',
    navigation_error: 'Navigationsfehler',
    could_not_navigate: 'Konnte nicht navigieren zu',
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

  ar: {
    // App Title
    seizure_tracker: 'متتبع النوبات',
    pediatric_seizure_monitoring: 'مراقبة النوبات للأطفال',
    
    // Menu
    menu: 'القائمة',
    change_language: 'تغيير اللغة',
    
    // Main Features
    seizure_diary: 'يوميات النوبات',
    seizure_diary_desc: 'تسجيل وتتبع النوبات',
    medication_reminder: 'تذكير الدواء',
    medication_reminder_desc: 'تتبع وتعيين التذكيرات',
    doctor_connect: 'اتصال الطبيب',
    doctor_connect_desc: 'مشاركة البيانات مع الأطباء',
    education: 'التعليم',
    education_desc: 'مقالات ونصائح',
    
    // Menu Items
    settings: 'الإعدادات',
    help_support: 'المساعدة والدعم',
    about: 'حول',
    logout: 'تسجيل الخروج',
    
    // Language Selection
    select_language: 'اختر اللغة',
    current_language: 'اللغة الحالية',
    
    // Common
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    ok: 'موافق',
    
    // Alerts
    settings_coming_soon: 'شاشة الإعدادات قريباً!',
    help_coming_soon: 'المساعدة والدعم قريباً!',
    about_coming_soon: 'حول متتبع النوبات قريباً!',
    logout_coming_soon: 'تسجيل الخروج قريباً!',
    language_changed: 'تم تغيير اللغة بنجاح!',
    navigation_error: 'خطأ في التنقل',
    could_not_navigate: 'لا يمكن التنقل إلى',
  },
};