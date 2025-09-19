import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import React from 'react';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Screen</Text>
      <Link href="/(auth)/signup" style={styles.link}>
        Go to Sign Up
      </Link>
      <Link href="/(tabs)/map" style={styles.link}>
        Log In (to Student View)
      </Link>
      <Link href="/(teacher)/dashboard" style={styles.link}>
        Log In (to Teacher View)
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  link: {
    marginTop: 15,
    paddingVertical: 10,
    color: '#007BFF',
    fontSize: 16,
  },
});
