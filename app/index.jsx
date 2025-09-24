import { Redirect } from 'expo-router';
import React from 'react';

export default function StartPage() {
  // Temporarily redirect to map for testing (bypass authentication)
  return <Redirect href="/(tabs)/map" />;
}
