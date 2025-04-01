import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Home, UserCircle, Bell, Clock, LogOut, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { auth } from '../../../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import styles from '../../styles/dashboard.style';

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  userData: any;
  onProfilePress: () => void;
  activeMenuItem?: string;
}

export default function Sidebar({ 
  isVisible, 
  onClose, 
  userData, 
  onProfilePress,
  activeMenuItem = 'Dashboard'
}: SidebarProps) {
  if (!isVisible) return null;

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Menu items with their actions
  const menuItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      onPress: () => router.push('/student/dashboard') 
    },
    { 
      icon: UserCircle, 
      label: 'Profile', 
      onPress: onProfilePress 
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      // onPress: () => router.push('/student/notifications') 
    },
    { 
      icon: Clock, 
      label: 'Late Entries', 
      // onPress: () => router.push('/student/late-entries') 
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
              {getInitials(userData?.name || '')}
            </Text>
          </View>
          <Text style={styles.userName}>{userData?.name || 'Student'}</Text>
          <Text style={styles.userRole}>Student</Text>
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