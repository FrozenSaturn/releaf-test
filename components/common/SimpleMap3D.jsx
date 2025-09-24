import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Platform } from 'react-native';
import * as Location from 'expo-location';
import { Canvas } from '@react-three/fiber/native';
import { OrbitControls, Sphere, Box, Cylinder } from '@react-three/drei';
import Character3D from '../specific/Character3D';

const SimpleMap3D = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 2, 8], fov: 75 }} style={{ backgroundColor: '#87CEEB' }}>
        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Grid lines for better map visibility */}
        <gridHelper args={[20, 20, '#666666', '#666666']} position={[0, 0, 0]} />
        
        {/* Ground/Map Surface */}
        <Box args={[20, 0.2, 20]} position={[0, -0.1, 0]}>
          <meshStandardMaterial 
            attach="material" 
            color="#4CAF50" 
            roughness={0.8}
            metalness={0.1}
          />
        </Box>
        
        {/* Roads - Horizontal */}
        <Box args={[20, 0.05, 1]} position={[0, 0, 0]}>
          <meshStandardMaterial attach="material" color="#2C2C2C" />
        </Box>
        <Box args={[20, 0.05, 1]} position={[0, 0, -5]}>
          <meshStandardMaterial attach="material" color="#2C2C2C" />
        </Box>
        <Box args={[20, 0.05, 1]} position={[0, 0, 5]}>
          <meshStandardMaterial attach="material" color="#2C2C2C" />
        </Box>
        
        {/* Roads - Vertical */}
        <Box args={[1, 0.05, 20]} position={[0, 0, 0]}>
          <meshStandardMaterial attach="material" color="#2C2C2C" />
        </Box>
        <Box args={[1, 0.05, 20]} position={[-5, 0, 0]}>
          <meshStandardMaterial attach="material" color="#2C2C2C" />
        </Box>
        <Box args={[1, 0.05, 20]} position={[5, 0, 0]}>
          <meshStandardMaterial attach="material" color="#2C2C2C" />
        </Box>
        
        {/* Road markings - White lines */}
        <Box args={[20, 0.01, 0.1]} position={[0, 0.03, 0]}>
          <meshStandardMaterial attach="material" color="#FFFFFF" />
        </Box>
        <Box args={[0.1, 0.01, 20]} position={[0, 0.03, 0]}>
          <meshStandardMaterial attach="material" color="#FFFFFF" />
        </Box>
        
        {/* Buildings along roads - Pokemon GO style */}
        <Box args={[2, 2, 2]} position={[-3, 1, 0]}>
          <meshStandardMaterial attach="material" color="#8B4513" />
        </Box>
        <Box args={[1.5, 3, 1.5]} position={[3, 1.5, 0]}>
          <meshStandardMaterial attach="material" color="#696969" />
        </Box>
        <Box args={[1, 1.5, 1]} position={[0, 0.75, -3]}>
          <meshStandardMaterial attach="material" color="#A0522D" />
        </Box>
        <Box args={[1.2, 2.5, 1.2]} position={[0, 1.25, 3]}>
          <meshStandardMaterial attach="material" color="#4A4A4A" />
        </Box>
        
        {/* Collectible Items along roads - Pokemon GO style */}
        <Sphere args={[0.2, 16, 16]} position={[-1, 0.5, 0]}>
          <meshStandardMaterial attach="material" color="#FF0000" emissive="#FF0000" emissiveIntensity={0.3} />
        </Sphere>
        <Box args={[0.3, 0.3, 0.3]} position={[2, 0.5, 0]}>
          <meshStandardMaterial attach="material" color="#9C27B0" emissive="#9C27B0" emissiveIntensity={0.2} />
        </Box>
        <Cylinder args={[0.15, 0.15, 0.1, 16]} position={[0, 0.5, -2]}>
          <meshStandardMaterial attach="material" color="#FFD700" emissive="#FFD700" emissiveIntensity={0.2} />
        </Cylinder>
        <Sphere args={[0.18, 16, 16]} position={[1, 0.5, 2]}>
          <meshStandardMaterial attach="material" color="#00FF00" emissive="#00FF00" emissiveIntensity={0.3} />
        </Sphere>
        <Box args={[0.25, 0.25, 0.25]} position={[-2, 0.5, -1]}>
          <meshStandardMaterial attach="material" color="#FF6B35" emissive="#FF6B35" emissiveIntensity={0.2} />
        </Box>
        
        {/* 3D Character at center */}
        <Character3D position={[0, 0.1, 0]} scale={1} />
        
        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <View style={styles.uiOverlay}>
        <View style={styles.infoPanel}>
          <Text style={styles.title}>🎮 Pokemon GO-like 3D Map</Text>
          <Text style={styles.locationText}>
            📍 Location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </Text>
          <Text style={styles.instructionText}>
            👆 Drag to rotate • 🤏 Pinch to zoom • 🎯 Tap items to collect
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  instructionText: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SimpleMap3D;
