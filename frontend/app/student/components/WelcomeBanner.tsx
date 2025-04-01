// frontend/app/components/WelcomeBanner.tsx
import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../styles/dashboard.style'; 

interface WelcomeBannerProps {
  name: string;
  rollNumber: string;
}

export default function WelcomeBanner({ name, rollNumber }: WelcomeBannerProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.welcomeText}>Welcome, {name}</Text>
      <Text style={styles.rollNumber}>Roll Number: {rollNumber}</Text>
    </View>
  );
}