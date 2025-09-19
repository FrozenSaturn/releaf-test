import { Redirect } from 'expo-router';
import React from 'react';

export default function StartPage() {
  // This page will handle initial logic, like checking if the user is logged in.
  // For now, we'll just redirect to the auth flow.
  return <Redirect href="/(auth)/login" />;
}
