import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import styles from '../../styles/dashboard.style';

interface HeaderProps {
  onMenuPress: () => void;
  userName?: string;
  notificationCount?: number;
}

export default function Header({ onMenuPress, userName, notificationCount = 0 }: HeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
        <Text style={styles.menuIcon}>≡</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>
        {userName ? `Welcome, ${userName}` : 'Dashboard'}
      </Text>
      
      <TouchableOpacity 
        style={styles.notificationButton} 
        onPress={() => router.push('./components/Notifications')} // Corrected route
      >
        <Bell size={24} color="#FFFFFF" />
        {notificationCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>{notificationCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}