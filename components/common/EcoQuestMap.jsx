import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Platform, Alert, TouchableOpacity, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { Canvas } from '@react-three/fiber/native';
import { OrbitControls, Sphere, Box, Cylinder } from '@react-three/drei';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../firebase/config';
import Character3D from '../specific/Character3D';
import Tree3D from '../specific/Tree3D';
import Garbage3D from '../specific/Garbage3D';
import TreeCamera from './TreeCamera';

const EcoQuestMap = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [show3D, setShow3D] = useState(false);
  const [mapHtml, setMapHtml] = useState('');
  const [plantedTrees, setPlantedTrees] = useState([]);
  const [garbageItems, setGarbageItems] = useState([]);
  const [missions, setMissions] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showGarbageModal, setShowGarbageModal] = useState(false);
  const [showTreeDetails, setShowTreeDetails] = useState(false);
  const [selectedTree, setSelectedTree] = useState(null);
  const [selectedGarbageType, setSelectedGarbageType] = useState('plastic');

  const garbageTypes = [
    { id: 'plastic', name: 'Plastic', emoji: '🥤' },
    { id: 'paper', name: 'Paper', emoji: '📄' },
    { id: 'metal', name: 'Metal', emoji: '🥫' },
    { id: 'glass', name: 'Glass', emoji: '🍾' },
    { id: 'organic', name: 'Organic', emoji: '🍎' }
  ];

  useEffect(() => {
    (async () => {
      // Skip location on web platform
      if (Platform.OS === 'web') {
        setLocation({
          coords: {
            latitude: 37.7749, // San Francisco default
            longitude: -122.4194
          }
        });
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      
      try {
        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);
      } catch (error) {
        setErrorMsg('Error getting location: ' + error.message);
      }
    })();
  }, []);

  useEffect(() => {
    loadStoredData();
  }, []);

  useEffect(() => {
    if (location) {
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>EcoQuest Map</title>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
            .user-marker {
              background: #4CAF50;
              border: 3px solid #fff;
              border-radius: 50%;
              width: 25px;
              height: 25px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .tree-marker {
              background: transparent;
              border: none;
              border-radius: 50%;
              width: 30px;
              height: 30px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .garbage-marker {
              background: #FF6B35;
              border: 2px solid #fff;
              border-radius: 50%;
              width: 18px;
              height: 18px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .mission-marker {
              background: transparent;
              border: none;
              border-radius: 50%;
              width: 30px;
              height: 30px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            // Initialize map
            const map = L.map('map').setView([${lat}, ${lng}], 15);
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19
            }).addTo(map);
            
            // Add user location marker
            const userIcon = L.divIcon({
              className: 'user-marker',
              html: '🌱',
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            });
            
            L.marker([${lat}, ${lng}], { icon: userIcon })
              .addTo(map)
              .bindPopup('You are here!<br>🌱 Eco-Warrior');
            
            // Add planted trees
            const plantedTrees = ${JSON.stringify(plantedTrees)};
            plantedTrees.forEach((tree) => {
              const treeIcon = L.divIcon({
                className: 'tree-marker',
                html: '<div style="font-size: 30px; text-align: center; line-height: 1;">🌳</div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
              });
              
              L.marker([tree.latitude, tree.longitude], { icon: treeIcon })
                .addTo(map)
                .bindPopup(\`
                  <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 40px; margin-bottom: 10px;">🌳</div>
                    <b style="color: #2E8B57; font-size: 16px;">Planted Tree</b><br>
                    <small style="color: #666;">Planted by: \${tree.userName}</small><br>
                    <small style="color: #666;">Date: \${new Date(tree.plantedAt).toLocaleDateString()}</small><br>
                    <small style="color: #666;">Location: \${tree.latitude.toFixed(4)}, \${tree.longitude.toFixed(4)}</small>
                  </div>
                \`)
                .on('click', function() {
                  // Send message to React Native
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'treeClick',
                    tree: tree
                  }));
                });
            });
            
            // Add teacher missions
            const missions = ${JSON.stringify(missions)};
            missions.forEach((mission) => {
              if (mission.status === 'active') {
                const missionIcon = L.divIcon({
                  className: 'mission-marker',
                  html: '<div style="font-size: 30px; text-align: center; line-height: 1;">🎯</div>',
                  iconSize: [30, 30],
                  iconAnchor: [15, 15]
                });
                
                L.marker([mission.latitude, mission.longitude], { icon: missionIcon })
                  .addTo(map)
                  .bindPopup(\`
                    <div style="text-align: center; padding: 10px; max-width: 250px;">
                      <div style="font-size: 40px; margin-bottom: 10px;">🎯</div>
                      <b style="color: #FF6B35; font-size: 16px;">Teacher Mission</b><br>
                      <p style="color: #333; margin: 10px 0; font-size: 14px;">\${mission.description}</p>
                      <small style="color: #666;">Assigned by: \${mission.teacherName}</small><br>
                      <small style="color: #666;">Created: \${new Date(mission.createdAt).toLocaleDateString()}</small><br>
                      <small style="color: #666;">Status: \${mission.status}</small>
                    </div>
                  \`)
                  .on('click', function() {
                    // Send message to React Native
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'missionClick',
                      mission: mission
                    }));
                  });
              }
            });
            
            // Add random garbage items for collection
            const garbageItems = [
              { lat: ${lat + 0.001}, lng: ${lng + 0.001}, type: 'plastic', title: 'Plastic Bottle' },
              { lat: ${lat - 0.001}, lng: ${lng - 0.001}, type: 'paper', title: 'Paper Waste' },
              { lat: ${lat + 0.002}, lng: ${lng - 0.001}, type: 'metal', title: 'Metal Can' },
              { lat: ${lat - 0.001}, lng: ${lng + 0.002}, type: 'glass', title: 'Glass Bottle' },
              { lat: ${lat + 0.001}, lng: ${lng - 0.002}, type: 'organic', title: 'Organic Waste' }
            ];
            
            garbageItems.forEach((item, index) => {
              const garbageIcon = L.divIcon({
                className: 'garbage-marker',
                html: '🗑️',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              });
              
              L.marker([item.lat, item.lng], { icon: garbageIcon })
                .addTo(map)
                .bindPopup(\`<b>\${item.title}</b><br>Tap to clean up!<br>Type: \${item.type}\`)
                .on('click', function() {
                  alert(\`Cleaned up \${item.title}! +10 Eco Points\`);
                });
            });
          </script>
        </body>
        </html>
      `;
      
      setMapHtml(html);
    }
  }, [location, plantedTrees, missions]);

  const loadStoredData = async () => {
    try {
      const [treesRaw, garbageRaw, missionsRaw] = await Promise.all([
        AsyncStorage.getItem('plantedTrees'),
        AsyncStorage.getItem('garbagePoints'),
        AsyncStorage.getItem('teacherMissions')
      ]);

      if (treesRaw) {
        const trees = JSON.parse(treesRaw);
        setPlantedTrees(Array.isArray(trees) ? trees : []);
      }

      if (garbageRaw) {
        const garbage = JSON.parse(garbageRaw);
        setGarbageItems(Array.isArray(garbage) ? garbage : []);
      }

      if (missionsRaw) {
        const missions = JSON.parse(missionsRaw);
        setMissions(Array.isArray(missions) ? missions : []);
      }
    } catch (error) {
      console.log('Error loading stored data:', error);
    }
  };

  const plantTree = async (photoUri, photoBase64) => {
    if (!location) return;

    const currentUser = auth.currentUser;
    const newTree = {
      id: Date.now().toString(),
      userId: currentUser?.uid || 'anonymous',
      userEmail: currentUser?.email || 'anonymous@example.com',
      userName: currentUser?.displayName || 'Anonymous User',
      latitude: location.coords.latitude, // Exact user location
      longitude: location.coords.longitude, // Exact user location
      photoUri: photoUri,
      photoBase64: photoBase64,
      plantedAt: new Date().toISOString(),
      x: 0, // Center of 3D scene
      z: 0  // Center of 3D scene
    };

    const updatedTrees = [...plantedTrees, newTree];
    setPlantedTrees(updatedTrees);
    
    try {
      await AsyncStorage.setItem('plantedTrees', JSON.stringify(updatedTrees));
      Alert.alert('Success!', `🌳 Tree planted successfully! +20 Eco Points`);
    } catch (error) {
      Alert.alert('Error', 'Could not save tree. Please try again.');
    }
  };

  const handlePhotoTaken = (photoUri, photoBase64) => {
    plantTree(photoUri, photoBase64);
  };

  const acceptMission = async (mission) => {
    try {
      // Update mission to be accepted by current user
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

  const collectGarbage = async (garbageType) => {
    const newGarbage = {
      id: Date.now().toString(),
      userId: auth.currentUser?.uid || 'anonymous',
      type: garbageType,
      collectedAt: new Date().toISOString(),
      x: 0, // Will be positioned in circle in 3D
      z: 0  // Will be positioned in circle in 3D
    };

    const updatedGarbage = [...garbageItems, newGarbage];
    setGarbageItems(updatedGarbage);
    
    try {
      await AsyncStorage.setItem('garbagePoints', JSON.stringify(updatedGarbage));
      Alert.alert('Great Job!', `🗑️ ${garbageTypes.find(g => g.id === garbageType)?.name} collected! +10 Eco Points`);
    } catch (error) {
      Alert.alert('Error', 'Could not save garbage collection. Please try again.');
    }
    
    setShowGarbageModal(false);
  };

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location || !mapHtml) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading EcoQuest map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Real Map using WebView */}
      <WebView
        source={{ html: mapHtml }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'treeClick') {
              setSelectedTree(data.tree);
              setShowTreeDetails(true);
            } else if (data.type === 'missionClick') {
              Alert.alert(
                '🎯 Teacher Mission',
                data.mission.description,
                [
                  { text: 'Close', style: 'cancel' },
                  { text: 'Accept Mission', onPress: () => acceptMission(data.mission) }
                ]
              );
            }
          } catch (error) {
            console.log('Error parsing WebView message:', error);
          }
        }}
      />

      {/* 3D Overlay */}
      {show3D && (
        <View style={styles.overlay3D}>
          <Canvas camera={{ position: [0, 2, 8], fov: 75 }}>
            {/* Lighting */}
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1.2} />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} />
            
            {/* Ground/Map Surface */}
            <Box args={[20, 0.2, 20]} position={[0, -0.1, 0]}>
              <meshStandardMaterial 
                attach="material" 
                color="#4CAF50" 
                roughness={0.8}
                metalness={0.1}
                transparent={true}
                opacity={0.7}
              />
            </Box>
            
            {/* 3D Character at center */}
            <Character3D position={[0, 0.1, 0]} scale={1} />
            
            {/* Planted Trees */}
            {plantedTrees.map((tree, index) => {
              // Position trees in a circle around the center
              const angle = (index * 2 * Math.PI) / plantedTrees.length;
              const radius = 2 + (index * 0.5); // Spread them out
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              
              return (
                <Tree3D 
                  key={tree.id} 
                  position={[x, 0, z]} 
                  scale={0.8} 
                  type="oak" 
                />
              );
            })}
            
            {/* Garbage Items */}
            {garbageItems.map((garbage, index) => {
              // Position garbage items in a different pattern
              const angle = (index * 2 * Math.PI) / garbageItems.length + Math.PI / 4; // Offset by 45 degrees
              const radius = 3 + (index * 0.3);
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              
              return (
                <Garbage3D 
                  key={garbage.id} 
                  position={[x, 0.5, z]} 
                  scale={0.6} 
                  type={garbage.type} 
                />
              );
            })}
            
            {/* Camera Controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={false}
              minDistance={2}
              maxDistance={15}
            />
          </Canvas>
        </View>
      )}
      
      {/* UI Overlay */}
      <View style={styles.uiOverlay}>
        <View style={styles.infoPanel}>
          <Text style={styles.title}>🌱 EcoQuest Map</Text>
          <Text style={styles.locationText}>
            📍 Location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </Text>
          <Text style={styles.statsText}>
            🌳 Trees: {plantedTrees.length} | 🗑️ Cleaned: {garbageItems.length}
          </Text>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.plantButton]} 
            onPress={() => setShowCamera(true)}
          >
            <Text style={styles.actionButtonText}>🌳 Plant Tree</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.garbageButton]} 
            onPress={() => setShowGarbageModal(true)}
          >
            <Text style={styles.actionButtonText}>🗑️ Collect</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.toggle3DButton]} 
            onPress={() => setShow3D(!show3D)}
          >
            <Text style={styles.actionButtonText}>
              {show3D ? '🗺️ 2D' : '🎮 3D'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tree Camera */}
      <TreeCamera
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onPhotoTaken={handlePhotoTaken}
      />

      {/* Tree Details Modal */}
      <Modal
        visible={showTreeDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTreeDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🌳 Tree Details</Text>
            
            {selectedTree && (
              <>
                <View style={styles.treeIconContainer}>
                  <Text style={styles.treeIcon}>🌳</Text>
                  <Text style={styles.treeIconText}>Planted Tree</Text>
                </View>
                
                <View style={styles.treeInfo}>
                  <Text style={styles.treeInfoLabel}>Planted by:</Text>
                  <Text style={styles.treeInfoValue}>{selectedTree.userName}</Text>
                  
                  <Text style={styles.treeInfoLabel}>Email:</Text>
                  <Text style={styles.treeInfoValue}>{selectedTree.userEmail}</Text>
                  
                  <Text style={styles.treeInfoLabel}>Date planted:</Text>
                  <Text style={styles.treeInfoValue}>
                    {new Date(selectedTree.plantedAt).toLocaleDateString()}
                  </Text>
                  
                  <Text style={styles.treeInfoLabel}>Location:</Text>
                  <Text style={styles.treeInfoValue}>
                    {selectedTree.latitude.toFixed(6)}, {selectedTree.longitude.toFixed(6)}
                  </Text>
                </View>
              </>
            )}
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmButton]} 
              onPress={() => setShowTreeDetails(false)}
            >
              <Text style={styles.confirmButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Collect Garbage Modal */}
      <Modal
        visible={showGarbageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGarbageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🗑️ Collect Garbage</Text>
            <Text style={styles.modalSubtitle}>What type of garbage did you collect?</Text>
            
            {garbageTypes.map((garbage) => (
              <TouchableOpacity
                key={garbage.id}
                style={[
                  styles.garbageOption,
                  selectedGarbageType === garbage.id && styles.selectedOption
                ]}
                onPress={() => setSelectedGarbageType(garbage.id)}
              >
                <Text style={styles.garbageEmoji}>{garbage.emoji}</Text>
                <Text style={styles.garbageName}>{garbage.name}</Text>
              </TouchableOpacity>
            ))}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowGarbageModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={() => collectGarbage(selectedGarbageType)}
              >
                <Text style={styles.confirmButtonText}>Collect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  overlay3D: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  uiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  infoPanel: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 10,
    pointerEvents: 'none',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  statsText: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  plantButton: {
    backgroundColor: '#4CAF50',
  },
  garbageButton: {
    backgroundColor: '#FF6B35',
  },
  toggle3DButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  treeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  garbageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  selectedOption: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  treeEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  garbageEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  treeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  garbageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  treeIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#E8F5E8',
    borderRadius: 15,
  },
  treeIcon: {
    fontSize: 80,
    marginBottom: 10,
  },
  treeIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  treeInfo: {
    marginBottom: 20,
  },
  treeInfoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  treeInfoValue: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
});

export default EcoQuestMap;
