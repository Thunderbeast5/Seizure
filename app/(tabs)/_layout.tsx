import { HapticTab } from '@/components/HapticTab';
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../../global.css";



export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <LanguageProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#fff',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'android' ? Math.max(insets.bottom + 50, 35) : 55,
          left: 40,
          right: 40,
          height: 80,
          borderRadius: 100,
          backgroundColor: '#1E88E5',
          borderTopWidth: 0,
          borderWidth: 0,
          // Platform-specific shadow for a floating effect
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
            },
            android: {
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
            },
          }),
        },
        tabBarIconStyle: {
          marginTop: 10,
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>
      
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "bar-chart" : "bar-chart-outline"} 
              size={28} 
              color={color}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="sos"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: Platform.OS === 'android' ? 95 : 120,
              height: Platform.OS === 'android' ? 95 : 120,
              borderRadius: Platform.OS === 'android' ? 47.5 : 60,
              backgroundColor: focused ? '#ff4444' : '#ff6666',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              top: Platform.OS === 'android' ? -25 : -40,
              left: '50%',
              marginLeft: Platform.OS === 'android' ? -47.5 : -60,
              borderWidth: Platform.OS === 'android' ? 2 : 4,
              borderColor: 'white',
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                },
                android: {
                  elevation: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                },
              }),
            }}>
              <Ionicons 
                name="warning" 
                size={60} 
                color="white" 
              />
            </View>
          ),
          tabBarLabelStyle: { 
            fontSize: 16,
            fontWeight: 'bold',
            color: '#ff4444',
            marginTop: -45,
          },
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person-circle" : "person-circle-outline"} 
              size={28} 
              color={color}
            />
          ),
        }}
      />

      {/* Hidden tab for home screen - always accessible but not shown in tab bar */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // This hides it from the tab bar
          headerShown: false,
        }}
      />
    </Tabs>
    </LanguageProvider>
  );
}