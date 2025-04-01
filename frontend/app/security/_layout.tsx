import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';

// Import Firebase
import { auth } from '../../services/firebaseConfig';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { signOut } from 'firebase/auth';

export default function SecurityLayout() {
  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        // Not logged in, redirect to login
        router.replace('/login');
        return;
      }
      
      try {
        // Check if the logged in user is security staff
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        
        if (!userDoc.exists() || userDoc.data().role !== 'security') {
          // If not security staff, logout and redirect to login
          await signOut(auth);
          router.replace('/login');
        }
      } catch (error) {
        console.error("Error verifying user role:", error);
        router.replace('/login');
      }
    };
    
    checkAuth();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" options={{ title: "Security Dashboard" }} />
    </Stack>
  );
}