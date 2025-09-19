import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Store user type for routing
      await AsyncStorage.setItem('userType', isTeacher ? 'teacher' : 'student');
      // The root layout will automatically handle the redirect on auth state change.
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ReLeaf</Text>
      <Text style={styles.subtitle}>Welcome Back!</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      {/* Teacher Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Login as:</Text>
        <View style={styles.toggleButtons}>
          <TouchableOpacity 
            style={[styles.toggleButton, !isTeacher && styles.toggleButtonActive]}
            onPress={() => setIsTeacher(false)}
          >
            <Text style={[styles.toggleButtonText, !isTeacher && styles.toggleButtonTextActive]}>Student</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, isTeacher && styles.toggleButtonActive]}
            onPress={() => setIsTeacher(true)}
          >
            <Text style={[styles.toggleButtonText, isTeacher && styles.toggleButtonTextActive]}>Teacher</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
      <Link href="/(auth)/signup" asChild>
          <TouchableOpacity>
             <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#3CB371',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 20,
    color: '#2E8B57',
    fontSize: 16,
  },
  toggleContainer: {
    width: '100%',
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
    textAlign: 'center',
  },
  toggleButtons: {
    flexDirection: 'row',
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#3CB371',
  },
  toggleButtonText: {
    fontSize: 16,
    color: 'gray',
  },
  toggleButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
});