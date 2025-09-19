import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import React from 'react';

export default function ApprovalsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Approvals Screen</Text>
      <Text>Teacher approval flow for submissions will be here.</Text>
      <Link href="/(teacher)/dashboard" style={styles.link}>
        Back to Dashboard
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 10,
    color: '#007BFF',
    fontSize: 16,
  },
});
