// frontend/app/components/RecentActivityCard.tsx
import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../styles/dashboard.style'; 

export default function RecentActivityCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.listItem}>
        <Text style={styles.listText}>Entry - March 29, 2025, 10:00 AM</Text>
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>Exit - March 28, 2025, 6:00 PM</Text>
      </View>
    </View>
  );
}