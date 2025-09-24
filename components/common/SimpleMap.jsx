import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Platform } from 'react-native';
import * as Location from 'expo-location';

const SimpleMap = () => {
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
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>🗺️ 3D Map Loading...</Text>
        <Text style={styles.locationText}>
          📍 Your Location:
        </Text>
        <Text style={styles.coordsText}>
          Lat: {location.coords.latitude.toFixed(4)}
        </Text>
        <Text style={styles.coordsText}>
          Lng: {location.coords.longitude.toFixed(4)}
        </Text>
        <Text style={styles.statusText}>
          ✅ Map is working! Ready for 3D elements.
        </Text>
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
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#87CEEB',
    padding: 20,
  },
  mapText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 20,
  },
  locationText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  coordsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 16,
    color: '#2E8B57',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default SimpleMap;
