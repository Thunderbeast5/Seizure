import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import "../global.css";
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppWrapper } from '@/components/AppWrapper';

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
      <AppWrapper>
      <Stack screenOptions={{ headerShown: false }}
       >
         {/* <Stack screenOptions={{ headerShown: false }}
       initialRouteName="landing">*/}

        {/* Initial landing screen
        <Stack.Screen 
          name="landing" 
          options={{ 
            headerShown: false,
            animation: 'fade',
            // Prevent going back to landing once user proceeds
            gestureEnabled: false,
          }} 
        /> */}

        
        
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
    </ThemeProvider>
  );
}