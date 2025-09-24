import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';

export default function ProfileScreen() {
  const [school, setSchool] = useState('Not set');
  const [treesPlanted, setTreesPlanted] = useState(0);
  const [garbageCleaned, setGarbageCleaned] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [treesRaw, garbageRaw, schoolRaw] = await Promise.all([
          AsyncStorage.getItem('plantedTrees'),
          AsyncStorage.getItem('garbagePoints'),
          AsyncStorage.getItem('userSchool'),
        ]);

        const uid = auth.currentUser?.uid;

        if (treesRaw) {
          const arr = JSON.parse(treesRaw);
          if (Array.isArray(arr)) {
            setTreesPlanted(uid ? arr.filter(i => i.userId === uid).length : arr.length);
          }
        }

        if (garbageRaw) {
          const arr = JSON.parse(garbageRaw);
          if (Array.isArray(arr)) {
            setGarbageCleaned(uid ? arr.filter(i => i.userId === uid).length : arr.length);
          }
        }

        if (schoolRaw) {
          setSchool(schoolRaw);
        } else {
          // Simple heuristic: derive from email domain if available, else leave as Not set
          const emailDomain = auth.currentUser?.email?.split('@')[1] || '';
          if (emailDomain) {
            setSchool(emailDomain.replace(/\..*$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
          }
        }
      } catch (e) {
        // Silently ignore; keep defaults
      }
    };

    loadStats();
  }, []);

  const handleClearMyTrees = async () => {
    Alert.alert(
      'Remove My Trees',
      'This will remove all trees you have planted. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove My Trees',
          style: 'destructive',
          onPress: async () => {
            try {
              const uid = auth.currentUser?.uid;
              const raw = await AsyncStorage.getItem('plantedTrees');
              const all = raw ? JSON.parse(raw) : [];

              const filtered = uid ? all.filter((t) => t.userId !== uid) : [];
              await AsyncStorage.setItem('plantedTrees', JSON.stringify(filtered));
              setTreesPlanted(0);
              Alert.alert('Done', 'All your planted trees have been removed. The map will reload markers on focus.');
            } catch (e) {
              Alert.alert('Error', 'Could not remove your trees. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleClearAllTrees = async () => {
    Alert.alert(
      'Remove All Trees',
      'This will remove ALL trees from the map, including those planted by other users. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem('plantedTrees', JSON.stringify([]));
              setTreesPlanted(0);
              Alert.alert('Done', 'All trees have been removed from the map. The map will reload markers on focus.');
            } catch (e) {
              Alert.alert('Error', 'Could not remove trees. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleClearMyGarbage = async () => {
    Alert.alert(
      'Clear My Garbage Collection',
      'This will clear all your garbage collection records. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear My Records',
          style: 'destructive',
          onPress: async () => {
            try {
              const uid = auth.currentUser?.uid;
              const raw = await AsyncStorage.getItem('garbagePoints');
              const all = raw ? JSON.parse(raw) : [];

              const filtered = uid ? all.filter((g) => g.userId !== uid) : [];
              await AsyncStorage.setItem('garbagePoints', JSON.stringify(filtered));
              setGarbageCleaned(0);
              Alert.alert('Done', 'Your garbage collection records have been cleared.');
            } catch (e) {
              Alert.alert('Error', 'Could not clear your records. Please try again.');
            }
          },
        },
      ]
    );
  };

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
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Affiliation</Text>
        <Text style={styles.cardValue}>{school}</Text>
      </View>

      <View style={styles.rowStats}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{treesPlanted}</Text>
          <Text style={styles.statLabel}>Trees Planted</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{garbageCleaned}</Text>
          <Text style={styles.statLabel}>Garbage Cleaned</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.removeButton} onPress={handleClearMyTrees}>
        <Text style={styles.removeButtonText}>Remove My Trees</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.removeButton, styles.garbageButton]} onPress={handleClearMyGarbage}>
        <Text style={styles.removeButtonText}>Clear My Garbage Records</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.removeButton, styles.removeAllButton]} onPress={handleClearAllTrees}>
        <Text style={styles.removeButtonText}>Remove All Trees</Text>
      </TouchableOpacity>

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
  card: {
    width: '100%',
    backgroundColor: '#F7F9F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  rowStats: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#EAF7EF',
    marginHorizontal: 6,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  statLabel: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
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
  removeButton: {
    marginTop: 14,
    backgroundColor: '#ef5350',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeAllButton: {
    backgroundColor: '#d32f2f',
  },
  garbageButton: {
    backgroundColor: '#FF6B35',
  },
});