import { Stack } from 'expo-router';
import React from 'react';

export default function TeacherLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ title: 'Teacher Dashboard' }} />
      <Stack.Screen name="approvals" options={{ title: 'Mission Approvals' }} />
    </Stack>
  );
}
