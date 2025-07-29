import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import "../../global.css";



export default function TabLayout() {
  return (
    <LanguageProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor:'#fff', // A dark color for contrast against the light blue BG
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: 55, // Adjust for vertical positioning from the bottom
          left: 40,   // Further increased margin to make tab narrower
          right: 40,  // Further increased margin to make tab narrower
          height: 80, // Slightly increased height to accommodate larger buttons
          borderRadius: 100, // Adjusted to maintain pill shape
          backgroundColor: '#1E88E5',
          // Platform-specific shadow for a floating effect
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
            },
            android: {
              elevation: 5,
            },
          }),
        },
        tabBarIconStyle: {
          marginTop: 10, // Add some top margin for better spacing
        },
        tabBarLabelStyle: {
          fontSize: 16, // Larger font size for better readability
          fontWeight: '600', // Semi-bold for better visibility
          marginTop: 2,
        },
      }}>
      
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={32} 
              name={focused ? "chart.bar.fill" : "chart.bar"} 
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
              width: 120,  // Increased from 100
              height: 120, // Increased from 100
              borderRadius: 60, // Adjusted for new size
              backgroundColor: focused ? '#ff4444' : '#ff6666',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              top: -40, // Centers vertically: -(height/2) + (tabBar height/2) = -(120/2) + (80/2) = -60 + 40 = -20, but we want it more centered so -60
              left: '50%',
              marginLeft: -60, // Centers horizontally: -(width/2) = -(120/2) = -60
              borderWidth: 4,
              borderColor: 'white',
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                },
                android: {
                  elevation: 8,
                },
              }),
            }}>
              <IconSymbol size={70} name="light.beacon.max.fill" color="white" />
            </View>
          ),
          tabBarLabelStyle: { 
            fontSize: 16,
            fontWeight: 'bold',
            color: '#ff4444',
            marginTop: -45, // Adjusted for the larger button
          },
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={32} 
              name={focused ? "person.circle.fill" : "person.circle"} 
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