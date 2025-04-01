// frontend/app/components/LateEntriesCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../../styles/dashboard.style'; 

export default function LateEntriesCard() {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Late Entries</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>March 28, 2025 - 15 min late</Text>
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>March 27, 2025 - 10 min late</Text>
      </View>
    </View>
  );
}