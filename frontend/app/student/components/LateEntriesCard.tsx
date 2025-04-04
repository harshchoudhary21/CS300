import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../../services/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import styles from '../../styles/dashboard.style';
import { router, useRouter } from 'expo-router';

const CLOUDINARY_CLOUD_NAME = 'dmzk8rqfh'; // Replace with your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET = 'proof-upload-preset'; // Replace with your Cloudinary unsigned preset

export default function LateEntriesCard() {
  const [lateEntries, setLateEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadingEntryId, setUploadingEntryId] = useState<string | null>(null); // Track which entry is uploading
  const [selectedImages, setSelectedImages] = useState<{ [key: string]: string }>({}); // Track selected images for each entry

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

      const lateEntriesRef = collection(db, 'lateEntries');
      const q = query(
        lateEntriesRef,
        where('studentId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);

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

  const pickImage = async (entryId: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setSelectedImages((prev) => ({ ...prev, [entryId]: imageUri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  };

  const removeImage = (entryId: string) => {
    setSelectedImages((prev) => {
      const updated = { ...prev };
      delete updated[entryId];
      return updated;
    });
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
    const imageUri = selectedImages[entryId];
    if (!imageUri) {
      Alert.alert('Error', 'Please add a file before uploading.');
      return;
    }

    try {
      setUploadingEntryId(entryId);

      // Upload image to Cloudinary
      const proofUrl = await uploadImageToCloudinary(imageUri);

      // Update Firestore with the proof URL
      const entryRef = doc(db, 'lateEntries', entryId);
      await updateDoc(entryRef, { proofUrl });

      Alert.alert('Success', 'Proof uploaded successfully!');
      fetchLateEntries(); // Refresh the entries
    } catch (error) {
      console.error('Error uploading proof:', error);
      Alert.alert('Error', 'Failed to upload proof. Please try again.');
    } finally {
      setUploadingEntryId(null);
      setSelectedImages((prev) => {
        const updated = { ...prev };
        delete updated[entryId];
        return updated;
      });
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Late Entries</Text>
        <TouchableOpacity onPress={() => router.push('./components/LateEntriesPage')}>
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
              <Text style={styles.label}>Verification:</Text> {entry.verificationStatus || 'Pending'}
            </Text>
            <Text style={styles.listText}>
              <Text style={styles.label}>Proof:</Text> {entry.proofUrl ? 'Uploaded' : 'Not Uploaded'}
            </Text>

            {/* Show Add File, Remove File, and Upload Proof buttons only if proof is not uploaded */}
            {!entry.proofUrl && (
              <>
                <TouchableOpacity
                  style={localStyles.addFileButton}
                  onPress={() => pickImage(entry.id)}
                >
                  <Text style={localStyles.addFileButtonText}>
                    {selectedImages[entry.id] ? 'File Added' : 'Add File'}
                  </Text>
                </TouchableOpacity>

                {selectedImages[entry.id] && (
                  <>
                    <TouchableOpacity
                      style={localStyles.removeFileButton}
                      onPress={() => removeImage(entry.id)}
                    >
                      <Text style={localStyles.removeFileButtonText}>Remove File</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        localStyles.uploadButton,
                        uploadingEntryId === entry.id && localStyles.disabledButton,
                      ]}
                      onPress={() => handleUploadProof(entry.id)}
                      disabled={uploadingEntryId === entry.id}
                    >
                      <Text style={localStyles.uploadButtonText}>
                        {uploadingEntryId === entry.id ? 'Uploading...' : 'Upload Proof'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        ))
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  addFileButton: {
    marginTop: 10,
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addFileButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  removeFileButton: {
    marginTop: 10,
    backgroundColor: '#FF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  removeFileButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
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