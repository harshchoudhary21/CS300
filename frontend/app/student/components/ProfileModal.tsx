import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import styles from '../../styles/dashboard.style';

interface ProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  userData: {
    name?: string;
    rollNumber?: string;
    email?: string;
    phoneNumber?: string;
  } | null;
  loading?: boolean;
}

export default function ProfileModal({ isVisible, onClose, userData, loading = false }: ProfileModalProps) {
  if (!isVisible) return null;

  // Handle loading state
  if (loading) {
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Profile</Text>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#66A5FF" />
            <Text style={styles.loadingText}>Loading profile data...</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Student Profile</Text>
        
        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Name:</Text>
          <Text style={styles.profileValue}>{userData?.name || 'Not available'}</Text>
        </View>
        
        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Roll Number:</Text>
          <Text style={styles.profileValue}>{userData?.rollNumber || 'Not available'}</Text>
        </View>
        
        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Email:</Text>
          <Text style={styles.profileValue}>{userData?.email || 'Not available'}</Text>
        </View>
        
        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Phone:</Text>
          <Text style={styles.profileValue}>{userData?.phoneNumber || 'Not available'}</Text>
        </View>
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}