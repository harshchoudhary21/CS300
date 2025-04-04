import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { auth } from '../../services/firebaseConfig';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

export default function StudentLayout() {
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
        // Check if the logged-in user is a student
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

        if (!userDoc.exists() || userDoc.data().role !== 'student') {
          // If not a student, logout and redirect to login
          await auth.signOut();
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error verifying user role:', error);
        router.replace('/login');
      }
    };

    checkAuth();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" options={{ title: 'Student Dashboard' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} /> {/* Added notifications route */}
    </Stack>
  );
}