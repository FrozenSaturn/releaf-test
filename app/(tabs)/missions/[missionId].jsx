import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function MissionDetailScreen() {
  const { missionId } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mission Details</Text>
      <Text>Details for mission {missionId}</Text>
      <Text>Photo+GPS submission will happen here.</Text>
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
