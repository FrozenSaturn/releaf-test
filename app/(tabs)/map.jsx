import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../firebase/config';

// Simple ID generator to avoid crypto dependency issues on RN
const generateId = () => `tree-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [garbageModalVisible, setGarbageModalVisible] = useState(false);
  const [selectedGarbage, setSelectedGarbage] = useState(null);
  const [plantedTrees, setPlantedTrees] = useState([]);
  const [garbagePoints, setGarbagePoints] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  // Local storage key for persisted trees
  const STORAGE_KEY = 'plantedTrees';
  const GARBAGE_STORAGE_KEY = 'garbagePoints';
  
  const mapRef = useRef(null);

  // Fetch user's location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      mapRef.current?.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    })();
  }, []);
  
  // Load planted trees from local storage on mount
  useEffect(() => {
    const loadTrees = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Basic validation to avoid crashes if storage is corrupted
          if (Array.isArray(parsed)) {
            setPlantedTrees(parsed);
          }
        }
      } catch (error) {
        console.error('Failed to load planted trees from storage:', error);
      }
    };
    const loadGarbage = async () => {
      try {
        const raw = await AsyncStorage.getItem(GARBAGE_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setGarbagePoints(parsed);
          }
        }
      } catch (error) {
        console.error('Failed to load garbage points from storage:', error);
      }
    };
    loadTrees();
    loadGarbage();
  }, []);

  const persistTrees = async (trees) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trees));
    } catch (error) {
      console.error('Failed to persist planted trees to storage:', error);
    }
  };

  const persistGarbage = async (points) => {
    try {
      await AsyncStorage.setItem(GARBAGE_STORAGE_KEY, JSON.stringify(points));
    } catch (error) {
      console.error('Failed to persist garbage points to storage:', error);
    }
  };

  const handleAddAction = () => {
    setModalVisible(true);
  };
  
  // Add a planted tree locally and persist
  const handlePlantTree = async () => {
    setModalVisible(false);
    setSubmitting(true);
    
    try {
      // Request camera permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Camera Permission Required", "You need to allow camera access to verify planting a tree.");
        setSubmitting(false);
        return;
      }
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.3,
        allowsEditing: false,
        exif: false,
      });

      if (!result.canceled) {
        // Get the user's current location
        const userLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const newTree = {
          id: generateId(),
          location: {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          },
          userId: auth.currentUser?.uid,
          username: auth.currentUser?.displayName || auth.currentUser?.email,
          timestamp: new Date().toISOString(),
        };

        const updated = [newTree, ...plantedTrees];
        setPlantedTrees(updated);
        await persistTrees(updated);

        Alert.alert('Success!', 'Your newly planted tree has been added to the map.');
      }
    } catch (error) {
      console.error('Error logging tree:', error);
      Alert.alert('Error', "Could not save your tree's location. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Add a garbage point locally and persist
  const handleReportGarbage = async () => {
    setModalVisible(false);
    setSubmitting(true);
    try {
      const userLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newPoint = {
        id: generateId(),
        location: {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        },
        userId: auth.currentUser?.uid,
        username: auth.currentUser?.displayName || auth.currentUser?.email,
        timestamp: new Date().toISOString(),
      };

      const updated = [newPoint, ...garbagePoints];
      setGarbagePoints(updated);
      await persistGarbage(updated);

      Alert.alert('Thanks!', 'Garbage disposal spot reported.');
    } catch (error) {
      console.error('Error reporting garbage:', error);
      Alert.alert('Error', 'Could not report garbage location. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGarbageMarkerPress = (garbagePoint) => {
    setSelectedGarbage(garbagePoint);
    setGarbageModalVisible(true);
  };

  const handleCleanupGarbage = async () => {
    if (!selectedGarbage) return;
    
    try {
      const updated = garbagePoints.filter(p => p.id !== selectedGarbage.id);
      setGarbagePoints(updated);
      await persistGarbage(updated);
      setGarbageModalVisible(false);
      setSelectedGarbage(null);
      Alert.alert('Success!', 'Garbage has been cleaned up and removed from the map.');
    } catch (error) {
      console.error('Failed to cleanup garbage point:', error);
      Alert.alert('Error', 'Could not remove this marker.');
    }
  };

  return (
    <View style={styles.container}>

      <MapView ref={mapRef} style={styles.map}>
        {location && (
          <Marker coordinate={location.coords}>
            <Image
              source={require('../../assets/images/character.png')}
              style={styles.character}
            />
          </Marker>
        )}
        {plantedTrees.map(tree => (
          <Marker
            key={tree.id}
            coordinate={tree.location}
            title={`Planted by ${tree.username || 'a hero'}`}
          >
            <Text style={styles.treeMarker}>🌳</Text>
          </Marker>
        ))}

        {garbagePoints.map(point => (
          <Marker
            key={point.id}
            coordinate={point.location}
            onPress={() => handleGarbageMarkerPress(point)}
          >
            <Image
              source={require('../../assets/images/garbage.png')}
              style={styles.garbageMarker}
            />
          </Marker>
        ))}
      </MapView>

      {/* Action Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.modalButton} onPress={handlePlantTree}>
              <Text style={styles.modalButtonText}>Planted a tree</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleReportGarbage}>
              <Text style={styles.modalButtonText}>Garbage Disposal needed</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Garbage Cleanup Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={garbageModalVisible}
        onRequestClose={() => setGarbageModalVisible(false)}
      >
        <View style={styles.garbageModalContainer}>
          <View style={styles.garbageModalView}>
            <Text style={styles.garbageModalTitle}>Garbage Report</Text>
            <Text style={styles.garbageModalSubtitle}>
              Reported by {selectedGarbage?.username || 'a hero'}
            </Text>
            <Text style={styles.garbageModalDescription}>
              This location has been reported as needing garbage cleanup.
            </Text>
            
            <View style={styles.garbageModalButtons}>
              <TouchableOpacity 
                style={[styles.garbageModalButton, styles.cleanupButton]} 
                onPress={handleCleanupGarbage}
              >
                <Text style={styles.garbageModalButtonText}>Cleaned Up</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.garbageModalButton, styles.cancelGarbageButton]} 
                onPress={() => setGarbageModalVisible(false)}
              >
                <Text style={styles.garbageModalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddAction}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
      
      {/* Submitting Indicator */}
      {submitting && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.uploadingText}>Submitting...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  character: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#2E8B57',
  },
  treeMarker: {
    fontSize: 30,
  },
  garbageMarker: {
    width: 30,
    height: 30,
  },
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    backgroundColor: '#2E8B57',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabIcon: {
    fontSize: 30,
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 35,
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#3CB371',
    borderRadius: 20,
    padding: 15,
    elevation: 2,
    width: '100%',
    marginBottom: 15,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#d9534f',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  calloutContainer: {
    width: 180,
    padding: 8,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutSubtitle: {
    color: 'gray',
    marginBottom: 8,
  },
  calloutButton: {
    backgroundColor: '#3CB371',
    paddingVertical: 8,
    borderRadius: 8,
  },
  calloutButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  connectionWarning: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: '#ff6b6b',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  connectionWarningText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  garbageModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  garbageModalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    width: '85%',
    maxWidth: 350,
  },
  garbageModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  garbageModalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  garbageModalDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  garbageModalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  garbageModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  cleanupButton: {
    backgroundColor: '#3CB371',
  },
  cancelGarbageButton: {
    backgroundColor: '#d9534f',
  },
  garbageModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});