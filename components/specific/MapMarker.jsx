import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// This would be a custom map marker component for Mapbox or Google Maps
const MapMarker = () => {
  return (
    <View style={styles.marker}>
      <Text>🌲</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  marker: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'white',
    borderColor: 'green',
    borderWidth: 1,
  },
});

export default MapMarker;
