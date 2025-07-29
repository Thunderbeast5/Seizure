import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import "../global.css";
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppWrapper } from '@/components/AppWrapper';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
      <AppWrapper>
        <Stack 
          screenOptions={{ headerShown: false }}
        >
          {/* Default index route that shows landing */}
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false,
              animation: 'fade',
              gestureEnabled: false,
            }} 
          />
          
          {/* Signup screen */}
          <Stack.Screen 
            name="login" 
            options={{ 
              headerShown: false,
              animation: 'fade',
              gestureEnabled: true,
            }} 
          />
          <Stack.Screen 
            name="signup" 
            options={{ 
              headerShown: false,
              animation: 'fade',
              gestureEnabled: true,
            }} 
          />
        
          {/* Main tabs group */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          
          {/* Individual feature screens */}
          <Stack.Screen 
            name="screens/seizure-diary" 
            options={{ 
              headerShown: false, 
              title: "Seizure Diary",
              presentation: "card"
            }} 
          />
          <Stack.Screen 
            name="screens/medication-reminder" 
            options={{ 
              headerShown: false, 
              title: "Medication Reminder" 
            }} 
          />
          <Stack.Screen 
            name="screens/doctor-connect" 
            options={{ 
              headerShown: false, 
              title: "Doctor Connect" 
            }} 
          />
          <Stack.Screen 
            name="screens/education" 
            options={{ 
              headerShown: false, 
              title: "Education" 
            }} 
          />
        </Stack>
      </AppWrapper>
      <StatusBar style="auto" />
    </AuthProvider>
    </ThemeProvider>
  );
}