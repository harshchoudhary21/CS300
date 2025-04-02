import React from 'react';
import { Stack } from 'expo-router';

export default function SecurityLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" options={{ title: "Security Dashboard" }} />
    </Stack>
  );
}