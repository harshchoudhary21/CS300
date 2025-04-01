// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';

// Import Firebase
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Once we've checked the auth state, mark initialization as complete
      setInitializing(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Show loading indicator while checking auth state
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1128' }}>
        <ActivityIndicator size="large" color="#66A5FF" />
        <Text style={{ marginTop: 12, color: '#B8C2FF', fontSize: 16 }}>Loading CampusFlow...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="student" />
        <Stack.Screen name="security" />
      </Stack>
    </>
  );
}