import "../../global.css";
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000', // A dark color for contrast against the light blue BG
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: 45, // Adjust for vertical positioning from the bottom
          left: 20,   // Margin from the left edge
          right: 20,  // Margin from the right edge
          height: 60,
          borderRadius: 35, // Half of the height to create a perfect pill shape
          backgroundColor: 'lightblue',
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
      }}>
      
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="exclamationmark.triangle.fill" color={color} />,
          tabBarLabelStyle: { 
           
            fontSize: 14, // Slightly larger label text
          },
          
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.circle" color={color} />,
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
  );
}