import "../../global.css";
import { Tabs, usePathname } from 'expo-router';
import React from 'react';
import { Platform, View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Helper function to get header title from route name
const getHeaderTitle = (path: string) => {
  const route = path.split('/').pop();
  if (!route || route === 'index') return 'Home';
  return route.charAt(0).toUpperCase() + route.slice(1);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 35,
    backgroundColor: '#1E88E5',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    // Remove paddingBottom or adjust as needed
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,        // Changed from 25 to 0
    left: 0,          // Changed from 40 to 0 
    right: 0,         // Changed from 40 to 0
    height: 80,
    backgroundColor: '#1E88E5',
    borderTopLeftRadius: 20,    // Optional: add top border radius
    borderTopRightRadius: 20,   // Optional: add top border radius
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },  // Shadow above the tab bar
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBarIcon: {
    marginTop: 5,
    marginBottom: 0,
  },
  tabBarLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: -10,
    marginBottom: 10,
  },
});


export default function TabLayout() {
  const pathname = usePathname();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{getHeaderTitle(pathname)}</Text>
      </View>
      
      <View style={styles.content}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#fff',
            tabBarInactiveTintColor: '#fff',
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarStyle: styles.tabBar,
            tabBarIconStyle: styles.tabBarIcon,
            tabBarLabelStyle: styles.tabBarLabel,
          }}
          initialRouteName="index"
        >
          {/* Hidden home screen - default route but not shown in tab bar */}
          <Tabs.Screen
            name="index"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          
          <Tabs.Screen
            name="reports"
            options={{
              title: 'Reports',
              tabBarIcon: ({ color, focused }) => (
                <View style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 5,
                }}>
                  <IconSymbol 
                    size={32}
                    name={focused ? "chart.bar.fill" : "chart.bar"} 
                    color={color} 
                  />
                </View>
              ),
            }}
          />
          
          <Tabs.Screen
            name="sos"
            options={{
              title: '',
              tabBarIcon: ({ color, focused }) => (
                <View style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: focused ? '#ff4444' : '#ff6666',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  top: -40,
                  left: '50%',
                  marginLeft: -60,
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
              <IconSymbol size={50} name="exclamationmark.triangle.fill" color="white" />
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
            <View style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 5, // Adjust vertical positioning
            }}>
              <IconSymbol 
                size={32}
                name={focused ? "person.circle.fill" : "person.circle"} 
                color={color} 
              />
            </View>
          ),
        }}
      />
    </Tabs>
    </View>
  </SafeAreaView>
  );
}