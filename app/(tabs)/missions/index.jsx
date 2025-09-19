import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import React from 'react';

export default function MissionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Missions List</Text>
      <Link href="/(tabs)/missions/1" style={styles.link}>
        View Mission 1
      </Link>
      <Link href="/(tabs)/missions/2" style={styles.link}>
        View Mission 2
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
    marginBottom: 16,
  },
  link: {
    marginVertical: 10,
    color: '#007BFF',
  },
});
