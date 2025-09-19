import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

// Import your custom character image
import characterImage from '../../assets/images/character.png';

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    // Initial region set to North Dumdum, West Bengal, India
    latitude: 22.65,
    longitude: 88.42,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      // Request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get the current location
      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        const region = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01, // Zoom level
          longitudeDelta: 0.01, // Zoom level
        };
        setLocation(currentLocation);
        setMapRegion(region);
      } catch (error) {
        setErrorMsg('Could not fetch location. Please try again later.');
        console.error(error);
      }
    })();
  }, []);

  let content = <ActivityIndicator size="large" color="#2E8B57" />;

  if (errorMsg) {
    content = <Text style={styles.errorText}>{errorMsg}</Text>;
  } else if (location) {
    content = (
      <MapView style={styles.map} region={mapRegion}>
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Your Location"
        >
          {/* Your custom character on the map */}
          <Image
            source={characterImage}
            style={styles.character}
          />
        </Marker>
      </MapView>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
  character: {
    width: 50,
    height: 50,
    borderRadius: 25, // Makes the image circular
  },
});