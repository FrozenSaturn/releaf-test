import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../../firebase/config';

export default function MissionsScreen() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const missionsRaw = await AsyncStorage.getItem('teacherMissions');
      const allMissions = missionsRaw ? JSON.parse(missionsRaw) : [];
      
      // Filter active missions
      const activeMissions = allMissions.filter(mission => mission.status === 'active');
      setMissions(activeMissions);
    } catch (error) {
      console.log('Error loading missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptMission = async (mission) => {
    try {
      const updatedMissions = missions.map(m => 
        m.id === mission.id 
          ? { ...m, acceptedBy: auth.currentUser?.uid || 'anonymous', status: 'accepted' }
          : m
      );
      
      setMissions(updatedMissions);
      await AsyncStorage.setItem('teacherMissions', JSON.stringify(updatedMissions));
      
      Alert.alert('Mission Accepted!', 'You have accepted this mission. Good luck! 🎯');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept mission. Please try again.');
      console.error('Mission acceptance error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading missions...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Available Missions</Text>
        <Text style={styles.subtitle}>Complete missions assigned by your teachers</Text>
      </View>

      {missions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>No Active Missions</Text>
          <Text style={styles.emptyText}>
            Your teachers haven't assigned any missions yet. Check back later!
          </Text>
        </View>
      ) : (
        missions.map((mission) => (
          <View key={mission.id} style={styles.missionCard}>
            <View style={styles.missionHeader}>
              <Text style={styles.missionIcon}>🎯</Text>
              <View style={styles.missionInfo}>
                <Text style={styles.missionTitle}>Teacher Mission</Text>
                <Text style={styles.missionTeacher}>by {mission.teacherName}</Text>
              </View>
            </View>
            
            <Text style={styles.missionDescription}>{mission.description}</Text>
            
            <View style={styles.missionDetails}>
              <Text style={styles.missionDate}>
                📅 Created: {new Date(mission.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.missionStatus}>
                Status: {mission.status}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.acceptButton} 
              onPress={() => acceptMission(mission)}
            >
              <Text style={styles.acceptButtonText}>Accept Mission</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6B35',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  missionCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  missionIcon: {
    fontSize: 30,
    marginRight: 12,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  missionTeacher: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  missionDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  missionDetails: {
    marginBottom: 16,
  },
  missionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  missionStatus: {
    fontSize: 14,
    color: '#666',
  },
  acceptButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
