import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';

export default function ProfileScreen() {

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The root layout will handle redirecting to the login screen
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    }
  };
  
  // Use displayName for a personalized welcome, fallback to email
  const username = auth.currentUser?.displayName;
  const email = auth.currentUser?.email;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {username || 'Eco-Warrior'}!</Text>
      <Text style={styles.emailText}>{email}</Text>
      <Text style={styles.info}>Your points and badges will be shown here.</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginVertical: 20,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#d9534f',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});