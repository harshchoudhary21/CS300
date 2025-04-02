import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, Menu, Shield } from 'lucide-react-native';

interface HeaderProps {
  name: string;
  securityId: string;
  onMenuPress: () => void;
  onNotificationPress: () => void;
}

export default function Header({ name, securityId, onMenuPress, onNotificationPress }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <Menu size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.headerInfo}>
            <View style={styles.profileImageContainer}>
              <Shield size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerName}>Hello, {name}</Text>
              <Text style={styles.headerRole}>Security ID: {securityId || 'N/A'}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={onNotificationPress}
        >
          <Bell size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 165, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRole: {
    fontSize: 12,
    color: '#B8C2FF',
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
  },
});