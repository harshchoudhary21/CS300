import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../../services/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import styles from '../../styles/dashboard.style';

const CLOUDINARY_CLOUD_NAME = 'dmzk8rqfh'; // Replace with your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET = 'proof-upload-preset'; // Replace with your Cloudinary unsigned preset

export default function LateEntriesCard() {
  const [lateEntries, setLateEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    fetchLateEntries();
  }, []);

  const fetchLateEntries = async () => {
    try {
      setLoading(true);

      const user = auth.currentUser;
      if (!user) {
        console.error('User not logged in');
        return;
      }

      console.log('Current User ID:', user.uid);

      const lateEntriesRef = collection(db, 'lateEntries');
      const q = query(
        lateEntriesRef,
        where('studentId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);

      console.log('Query Results:', querySnapshot.docs.map(doc => doc.data()));

      const entries = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));

      setLateEntries(entries);
    } catch (error) {
      console.error('Error fetching late entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToCloudinary = async (imageUri: string) => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
      const uploadResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await uploadResponse.json();
      if (result.secure_url) {
        return result.secure_url;
      } else {
        throw new Error('Cloudinary upload failed');
      }
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  };

  const handleUploadProof = async (entryId: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploading(true);
        const imageUri = result.assets[0].uri;

        // Upload image to Cloudinary
        const proofUrl = await uploadImageToCloudinary(imageUri);

        // Update Firestore with the proof URL
        const entryRef = doc(db, 'lateEntries', entryId);
        await updateDoc(entryRef, { proofUrl });

        Alert.alert('Success', 'Proof uploaded successfully!');
        fetchLateEntries(); // Refresh the entries
      }
    } catch (error) {
      console.error('Error uploading proof:', error);
      Alert.alert('Error', 'Failed to upload proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Late Entries</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#66A5FF" />
      ) : lateEntries.length === 0 ? (
        <Text style={styles.noEntriesText}>No late entries found.</Text>
      ) : (
        lateEntries.slice(0, 3).map((entry) => (
          <View key={entry.id} style={styles.listItem}>
            <Text style={styles.listText}>
              <Text style={styles.label}>Date:</Text> {new Date(entry.timestamp).toLocaleDateString()}
            </Text>
            <Text style={styles.listText}>
              <Text style={styles.label}>Type:</Text> {entry.entryType}
            </Text>
            <Text style={styles.listText}>
              <Text style={styles.label}>Entered By:</Text> {entry.securityName || 'Unknown'}
            </Text>
            <Text style={styles.listText}>
              <Text style={styles.label}>Status:</Text> {entry.status}
            </Text>
            <Text style={styles.listText}>
              <Text style={styles.label}>Proof:</Text> {entry.proofUrl ? 'Uploaded' : 'Not Uploaded'}
            </Text>
            {/* Upload Proof Button */}
            <TouchableOpacity
              style={[localStyles.uploadButton, uploading && localStyles.disabledButton]}
              onPress={() => handleUploadProof(entry.id)}
              disabled={uploading}
            >
              <Text style={localStyles.uploadButtonText}>
                {uploading ? 'Uploading...' : 'Upload Proof'}
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  uploadButton: {
    marginTop: 10,
    backgroundColor: '#4C63D2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
});