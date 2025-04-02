import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { X, User, Mail, Phone, Shield, Calendar } from 'lucide-react-native';

interface ProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  securityData: {
    name?: string;
    securityId?: string;
    email?: string;
    phone?: string;
    phoneNumber?: string;
    status?: string;
    joinedDate?: string;
  } | null;
  loading?: boolean;
}

export default function ProfileModal({ isVisible, onClose, securityData, loading = false }: ProfileModalProps) {
  if (!isVisible) return null;

  // Handle loading state
  if (loading) {
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Security Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeIconButton}>
              <X size={20} color="#B8C2FF" />
            </TouchableOpacity>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#66A5FF" />
            <Text style={styles.loadingText}>Loading profile data...</Text>
          </View>
        </View>
      </View>
    );
  }

  // Get phone from either phone or phoneNumber field
  const phoneDisplay = securityData?.phone || securityData?.phoneNumber || 'Not available';

  // Format date if available
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Security Profile</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeIconButton}>
            <X size={20} color="#B8C2FF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileAvatar}>
          <Shield size={40} color="#FFFFFF" />
        </View>
        
        <View style={styles.profileItem}>
          <User size={20} color="#66A5FF" style={styles.profileIcon} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileLabel}>Name</Text>
            <Text style={styles.profileValue}>{securityData?.name || 'Not available'}</Text>
          </View>
        </View>
        
        <View style={styles.profileItem}>
          <Shield size={20} color="#66A5FF" style={styles.profileIcon} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileLabel}>Security ID</Text>
            <Text style={styles.profileValue}>{securityData?.securityId || 'Not available'}</Text>
          </View>
        </View>
        
        <View style={styles.profileItem}>
          <Mail size={20} color="#66A5FF" style={styles.profileIcon} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileLabel}>Email</Text>
            <Text style={styles.profileValue}>{securityData?.email || 'Not available'}</Text>
          </View>
        </View>
        
        <View style={styles.profileItem}>
          <Phone size={20} color="#66A5FF" style={styles.profileIcon} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileLabel}>Phone</Text>
            <Text style={styles.profileValue}>{phoneDisplay}</Text>
          </View>
        </View>
        
        <View style={styles.profileItem}>
          <Calendar size={20} color="#66A5FF" style={styles.profileIcon} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileLabel}>Status</Text>
            <Text style={[
              styles.profileValue, 
              styles.statusText,
              securityData?.status?.toLowerCase() === 'active' ? styles.activeStatus : null
            ]}>
              {securityData?.status || 'Not available'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 17, 40, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'rgba(26, 41, 128, 0.95)',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(184, 194, 255, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeIconButton: {
    padding: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    color: '#B8C2FF',
    marginTop: 16,
    fontSize: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(102, 165, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  profileIcon: {
    marginRight: 16,
  },
  profileTextContainer: {
    flex: 1,
  },
  profileLabel: {
    fontSize: 12,
    color: '#B8C2FF',
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statusText: {
    color: '#FF9A9A',
  },
  activeStatus: {
    color: '#6DE195',
  },
  closeButton: {
    backgroundColor: 'rgba(102, 165, 255, 0.15)',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});