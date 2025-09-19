import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import React from 'react';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>
      <Text>User points and badges will be shown here.</Text>
       <Link href="/(auth)/login" style={styles.link}>
        Log Out
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
    color: 'red',
    fontSize: 16,
  },
});
