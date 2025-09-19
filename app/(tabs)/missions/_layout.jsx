import { Stack } from 'expo-router';
import React from 'react';

export default function MissionsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'All Missions' }} />
      <Stack.Screen name="[missionId]" options={{ title: 'Mission Details' }} />
    </Stack>
  );
}
