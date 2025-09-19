import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import React from 'react';

export default function TeacherDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Dashboard</Text>
      <Text>Basic impact dashboard and CSV export functionality.</Text>
      <Link href="/(teacher)/approvals" style={styles.link}>
        View Mission Approvals
      </Link>
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
    color: '#007BFF',
    fontSize: 16,
  },
});
