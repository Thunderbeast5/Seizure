import { View, Text, TouchableOpacity, StatusBar, Alert, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {

  const handleSeizureDiary = () => {
    console.log('Attempting to navigate to seizure diary...');
    try {
      router.navigate('/screens/seizure-diary');
      console.log('Navigation to seizure diary attempted');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to seizure diary');
    }
  };

  const handleMedicationReminder = () => {
    console.log('Attempting to navigate to medication reminder...');
    try {
      router.navigate('/screens/medication-reminder');
      console.log('Navigation to medication reminder attempted');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to medication reminder');
    }
  };

  const handleDoctorConnect = () => {
    console.log('Attempting to navigate to doctor connect...');
    try {
      router.navigate('/screens/doctor-connect');
      console.log('Navigation to doctor connect attempted');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to doctor connect');
    }
  };

  const handleEducation = () => {
    console.log('Attempting to navigate to education...');
    try {
      router.navigate('/screens/education');
      console.log('Navigation to education attempted');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to education');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F3F8" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Updated Header with proper spacing */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Seizure Tracker</Text>
          <Text style={styles.headerSubtitle}>Pediatric Seizure Monitoring</Text>
        </View>

        {/* Feature Buttons Grid */}
        <View style={styles.featuresContainer}>
          <TouchableOpacity 
            style={styles.featureButton} 
            onPress={handleSeizureDiary}
          >
            <View style={styles.featureIconContainer}>
              <Ionicons name="calendar" size={48} color="#4A90E2" />
            </View>
            <Text style={styles.featureText}>Seizure Diary</Text>
            <Text style={styles.featureDescription}>Log and track seizures</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureButton} 
            onPress={handleMedicationReminder}
          >
            <View style={styles.featureIconContainer}>
              <Ionicons name="medical" size={48} color="#4A90E2" />
            </View>
            <Text style={styles.featureText}>Medication Reminder</Text>
            <Text style={styles.featureDescription}>Track and set reminders</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureButton} 
            onPress={handleDoctorConnect}
          >
            <View style={styles.featureIconContainer}>
              <Ionicons name="people" size={48} color="#4A90E2" />
            </View>
            <Text style={styles.featureText}>Doctor Connect</Text>
            <Text style={styles.featureDescription}>Share data with doctors</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureButton} 
            onPress={handleEducation}
          >
            <View style={styles.featureIconContainer}>
              <Ionicons name="book" size={48} color="#4A90E2" />
            </View>
            <Text style={styles.featureText}>Education</Text>
            <Text style={styles.featureDescription}>Articles and tips</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F3F8', // Light blue calming background
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 40, // Keep original header position
    marginBottom: 40, // Keep original spacing
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20, // Reduced margin to bring buttons up
    paddingBottom: 40, // Add bottom padding for better spacing
  },
  featureButton: {
    backgroundColor: 'white',
    width: '48%', 
    padding: 24, 
    borderRadius: 16, 
    marginBottom: 24, 
    alignItems: 'center',
    minHeight: 180, // Keep larger height for bigger icons
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  featureIconContainer: {
    marginBottom: 16, 
    padding: 8, 
  },
  featureText: {
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8, 
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16, 
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22, 
  },
});
