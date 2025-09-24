import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Image } from 'react-native';
import { Link } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// Hardcoded teacher data
const TEACHER_DATA = {
  name: 'Dr. Sarah Johnson',
  school: 'Green Valley High School',
  class: 'Environmental Science - Grade 10',
  students: 28,
  achievements: {
    treesPlanted: 147,
    garbageReports: 89,
    activeStudents: 25,
    completedMissions: 12
  }
};

const RECENT_ACTIVITIES = [
  { id: 1, student: 'Alex Chen', action: 'Planted tree', location: 'School Garden', time: '2 hours ago' },
  { id: 2, student: 'Emma Davis', action: 'Reported garbage', location: 'Main Street', time: '4 hours ago' },
  { id: 3, student: 'Michael Brown', action: 'Cleaned garbage', location: 'Park Avenue', time: '1 day ago' },
  { id: 4, student: 'Sophia Wilson', action: 'Planted tree', location: 'Community Park', time: '1 day ago' },
  { id: 5, student: 'James Miller', action: 'Completed mission', location: 'Downtown Area', time: '2 days ago' }
];

const TOP_STUDENTS = [
  { rank: 1, name: 'Alex Chen', points: 350, trees: 8, garbage: 12 },
  { rank: 2, name: 'Emma Davis', points: 320, trees: 6, garbage: 15 },
  { rank: 3, name: 'Sophia Wilson', points: 285, trees: 9, garbage: 8 },
  { rank: 4, name: 'Michael Brown', points: 270, trees: 7, garbage: 10 },
  { rank: 5, name: 'James Miller', points: 245, trees: 5, garbage: 11 }
];

export default function TeacherDashboard() {
  const [exportingData, setExportingData] = useState(false);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [missionDescription, setMissionDescription] = useState('');
  const [missionImage, setMissionImage] = useState(null);
  const [missionLocation, setMissionLocation] = useState(null);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userType');
      await signOut(auth);
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    }
  };

  const handleExportData = () => {
    setExportingData(true);
    // Simulate export process
    setTimeout(() => {
      setExportingData(false);
      Alert.alert('Export Complete', 'Student activity data has been exported to CSV format.');
    }, 2000);
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed to assign missions.');
        return null;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return location;
    } catch (error) {
      Alert.alert('Error', 'Could not get current location. Please try again.');
      return null;
    }
  };

  const handleCreateMission = async () => {
    if (!missionDescription.trim()) {
      Alert.alert('Error', 'Please enter a mission description.');
      return;
    }

    try {
      const location = await getCurrentLocation();
      if (!location) return;

      const newMission = {
        id: Date.now().toString(),
        teacherId: auth.currentUser?.uid || 'teacher_anonymous',
        teacherName: auth.currentUser?.displayName || 'Teacher',
        description: missionDescription.trim(),
        imageUri: missionImage,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        createdAt: new Date().toISOString(),
        status: 'active', // active, completed, expired
        acceptedBy: null,
        completedAt: null
      };

      // Load existing missions
      const existingMissions = await AsyncStorage.getItem('teacherMissions');
      const missions = existingMissions ? JSON.parse(existingMissions) : [];
      
      // Add new mission
      missions.push(newMission);
      
      // Save back to storage
      await AsyncStorage.setItem('teacherMissions', JSON.stringify(missions));

      // Reset form
      setMissionDescription('');
      setMissionImage(null);
      setShowMissionModal(false);

      Alert.alert('Success!', 'Mission created successfully! Students can now see and accept this mission.');
    } catch (error) {
      Alert.alert('Error', 'Failed to create mission. Please try again.');
      console.error('Mission creation error:', error);
    }
  };

  const handleAddImage = () => {
    // For now, we'll use a mock image
    // In a real app, you'd use expo-image-picker here
    setMissionImage('mock_mission_image_' + Date.now());
    Alert.alert('Image Added', 'Mission image added successfully!');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Teacher Dashboard</Text>
        <Text style={styles.welcomeText}>Welcome back, {TEACHER_DATA.name}</Text>
        <Text style={styles.schoolText}>{TEACHER_DATA.school}</Text>
        <Text style={styles.classText}>{TEACHER_DATA.class}</Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{TEACHER_DATA.students}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{TEACHER_DATA.achievements.activeStudents}</Text>
          <Text style={styles.statLabel}>Active This Week</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{TEACHER_DATA.achievements.treesPlanted}</Text>
          <Text style={styles.statLabel}>Trees Planted</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{TEACHER_DATA.achievements.garbageReports}</Text>
          <Text style={styles.statLabel}>Garbage Reports</Text>
        </View>
      </View>

      {/* Top Students */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Students This Month</Text>
        {TOP_STUDENTS.map(student => (
          <View key={student.rank} style={styles.studentRow}>
            <Text style={styles.studentRank}>#{student.rank}</Text>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentStats}>{student.points} pts • {student.trees} trees • {student.garbage} reports</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {RECENT_ACTIVITIES.map(activity => (
          <View key={activity.id} style={styles.activityRow}>
            <View style={styles.activityInfo}>
              <Text style={styles.activityText}>
                <Text style={styles.studentNameBold}>{activity.student}</Text> {activity.action}
              </Text>
              <Text style={styles.activityLocation}>{activity.location} • {activity.time}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.missionButton]} 
          onPress={() => setShowMissionModal(true)}
        >
          <Text style={styles.actionButtonText}>🎯 Create Mission</Text>
        </TouchableOpacity>

        <Link href="/(teacher)/approvals" asChild>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Mission Approvals</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
          <Text style={styles.actionButtonText}>
            {exportingData ? 'Exporting...' : 'Export Data (CSV)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.actionButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Mission Creation Modal */}
      <Modal
        visible={showMissionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎯 Create New Mission</Text>
            
            <Text style={styles.inputLabel}>Mission Description:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter mission description (e.g., 'Plant 5 trees in the school garden')"
              value={missionDescription}
              onChangeText={setMissionDescription}
              multiline={true}
              numberOfLines={4}
            />
            
            <Text style={styles.inputLabel}>Mission Image (Optional):</Text>
            <TouchableOpacity style={styles.imageButton} onPress={handleAddImage}>
              <Text style={styles.imageButtonText}>
                {missionImage ? '📷 Image Added' : '📷 Add Image'}
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.locationNote}>
              📍 Mission will be created at your current location
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowMissionModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]} 
                onPress={handleCreateMission}
              >
                <Text style={styles.createButtonText}>Create Mission</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2E8B57',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 4,
  },
  schoolText: {
    fontSize: 16,
    color: '#E8F5E8',
    marginBottom: 2,
  },
  classText: {
    fontSize: 14,
    color: '#E8F5E8',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  studentRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
    width: 40,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  studentStats: {
    fontSize: 14,
    color: 'gray',
  },
  activityRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    marginBottom: 2,
  },
  studentNameBold: {
    fontWeight: 'bold',
  },
  activityLocation: {
    fontSize: 12,
    color: 'gray',
  },
  buttonsContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  actionButton: {
    backgroundColor: '#3CB371',
    borderRadius: 25,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#d9534f',
  },
  missionButton: {
    backgroundColor: '#FF6B35',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  imageButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageButtonText: {
    fontSize: 16,
    color: '#666',
  },
  locationNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  createButton: {
    backgroundColor: '#FF6B35',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
