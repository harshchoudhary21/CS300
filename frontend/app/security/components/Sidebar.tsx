import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserCircle, QrCode, Edit, LogOut, X, Shield } from 'lucide-react-native';
import { router } from 'expo-router';
import { auth } from '../../../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  securityData: any;
  onProfilePress: () => void;
  activeMenuItem?: string;
}

export default function Sidebar({ 
  isVisible, 
  onClose, 
  securityData, 
  onProfilePress,
  activeMenuItem = 'Dashboard'
}: SidebarProps) {
  if (!isVisible) return null;

  // Handle security officer logout
  const handleLogout = async () => {
    try {
      console.log('Logging out from security dashboard...');
      
      // Clear all AsyncStorage
      await AsyncStorage.clear();
      console.log('AsyncStorage cleared');
      
      // Sign out from Firebase
      await signOut(auth);
      console.log('Signed out from Firebase');
      
      // Navigate to login
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      router.replace('/login');
    }
  };

  // Menu items with their actions
  const menuItems = [
    { 
      icon: Shield, 
      label: 'Dashboard', 
      onPress: () => {
        onClose();
        router.push('/security/dashboard');
      }
    },
    { 
      icon: UserCircle, 
      label: 'Profile', 
      onPress: () => {
        onClose();
        onProfilePress();
      }
    },
    { 
      icon: QrCode, 
      label: 'QR Entry', 
      onPress: () => {
        onClose();
        alert('QR Entry feature will be implemented in the next update');
        // router.push('/security/qr-entry');
      }
    },
    { 
      icon: Edit, 
      label: 'Manual Entry', 
      onPress: () => {
        onClose();
        alert('Manual Entry feature will be implemented in the next update');
        // router.push('/security/manual-entry');
      }
    },
    { 
      icon: LogOut, 
      label: 'Logout', 
      onPress: handleLogout 
    },
  ];

  // Generate initials from name
  const getInitials = (name: string) => {
    if (!name) return 'S';
    return name.split(' ')
      .map(word => word[0]?.toUpperCase() || '')
      .join('')
      .substring(0, 2);
  };

  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>CampusFlow</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeSidebarButton}>
          <X size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.sidebarContent}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitials}>
              {getInitials(securityData?.name || '')}
            </Text>
          </View>
          <Text style={styles.userName}>{securityData?.name || 'Security Officer'}</Text>
          <Text style={styles.userRole}>Security ID: {securityData?.securityId || 'N/A'}</Text>
        </View>
        
        <View style={styles.menuItems}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                activeMenuItem === item.label && styles.activeMenuItem
              ]}
              onPress={item.onPress}
            >
              <item.icon
                size={20}
                color={activeMenuItem === item.label ? '#FFFFFF' : '#B8C2FF'}
              />
              <Text
                style={[
                  styles.menuItemText,
                  activeMenuItem === item.label && styles.activeMenuItemText
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '80%',
    height: '100%',
    backgroundColor: 'rgba(13, 23, 64, 0.98)',
    zIndex: 1000,
    borderRightWidth: 1,
    borderRightColor: 'rgba(184, 194, 255, 0.1)',
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(184, 194, 255, 0.1)',
    marginTop: 30,
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeSidebarButton: {
    padding: 5,
  },
  sidebarContent: {
    flex: 1,
    padding: 20,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(184, 194, 255, 0.1)',
  },
  userAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(102, 165, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInitials: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#B8C2FF',
  },
  menuItems: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  activeMenuItem: {
    backgroundColor: 'rgba(102, 165, 255, 0.15)',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#B8C2FF',
  },
  activeMenuItemText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});