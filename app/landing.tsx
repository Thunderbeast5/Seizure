import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';

interface LandingProps {
  onGoNext?: () => void;
}

const Landing: React.FC<LandingProps> = ({ onGoNext }) => {
  const handleGoNext = () => {
    if (onGoNext) {
      onGoNext();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your App</Text>
      <Text style={styles.subtitle}>Ready to get started?</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleGoNext}
      >
        <Text style={styles.buttonText}>Go Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Landing;