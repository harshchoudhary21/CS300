import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../styles/dashboard.style';

export default function RecentActivityCard({ notifications }: { notifications: any[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listText}>{notification.message}</Text>
            <Text style={styles.timestamp}>
              {new Date(notification.timestamp).toLocaleString()}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.listText}>No recent activity available.</Text>
      )}
    </View>
  );
}