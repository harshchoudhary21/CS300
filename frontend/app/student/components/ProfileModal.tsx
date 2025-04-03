// app/ProfileModal.tsx
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image, 
  Appearance 
} from 'react-native';
import styles from '../../styles/dashboard.style';

interface ProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  userData: {
    name?: string;
    rollNumber?: string;
    email?: string;
    phoneNumber?: string;
    imageUrl?: string; // Optional profile photo URL
  } | null;
  loading?: boolean;
}

export default function ProfileModal({ isVisible, onClose, userData, loading = false }: ProfileModalProps) {
  // Get the current theme ('dark' or 'light')
  const colorScheme = Appearance.getColorScheme();

  if (!isVisible) return null;

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

        {/* Profile Photo */}
        <View style={styles.profilePhotoContainer}>
          {userData?.imageUrl ? (
            <Image
              source={{ uri: userData.imageUrl }}
              style={[
                styles.profileImage,
                { borderColor: colorScheme === 'dark' ? '#fff' : '#000' }
              ]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.profileImagePlaceholder,
                { borderColor: colorScheme === 'dark' ? '#fff' : '#000' }
              ]}
            >
              <Text style={styles.placeholderText}>No Photo</Text>
            </View>
          )}
        </View>

        {/* Profile Information */}
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
