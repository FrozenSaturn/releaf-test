import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map Screen</Text>
      <Text>Map exploration will be implemented here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
