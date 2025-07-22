import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function LandingPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>seizure tracker</Text>
      <View style={styles.buttonContainer}>
        <Link href="/(tabs)" style={styles.button}>
          <Text style={styles.buttonText}>Get Started</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#2563eb',
  },
  buttonContainer: {
    width: '60%',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
