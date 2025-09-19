import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import React from 'react';

export default function SignupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup Screen</Text>
      <Link href="/(auth)/login" style={styles.link}>
        Go back to Login
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