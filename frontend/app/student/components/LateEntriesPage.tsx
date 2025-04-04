import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../../services/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

const CLOUDINARY_CLOUD_NAME = 'dmzk8rqfh'; // Replace with your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET = 'proof-upload-preset'; // Replace with your Cloudinary unsigned preset

export default function LateEntriesPage() {
  const [lateEntries, setLateEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadingEntryId, setUploadingEntryId] = useState<string | null>(null); // Track which entry is uploading
  const [selectedImages, setSelectedImages] = useState<{ [key: string]: string }>({}); // Track selected images for each entry
  const router = useRouter();

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

  const renderLateEntry = ({ item }: { item: any }) => (
    <View style={styles.entryCard}>
      <Text style={styles.entryText}>
        <Text style={styles.label}>Date:</Text> {new Date(item.timestamp).toLocaleDateString()}
      </Text>
      <Text style={styles.entryText}>
        <Text style={styles.label}>Type:</Text> {item.entryType}
      </Text>
      <Text style={styles.entryText}>
        <Text style={styles.label}>Entered By:</Text> {item.securityName || 'Unknown'}
      </Text>
      <Text style={styles.entryText}>
        <Text style={styles.label}>Status:</Text> {item.status}
      </Text>
      <Text style={styles.entryText}>
        <Text style={styles.label}>Verification:</Text> {item.verificationStatus || 'Pending'}
      </Text>
      <Text style={styles.entryText}>
        <Text style={styles.label}>Proof:</Text> {item.proofUrl ? 'Uploaded' : 'Not Uploaded'}
      </Text>

      {/* Show Add File, Remove File, and Upload Proof buttons only if proof is not uploaded */}
      {!item.proofUrl && (
        <>
          <TouchableOpacity
            style={localStyles.addFileButton}
            onPress={() => pickImage(item.id)}
          >
            <Text style={localStyles.addFileButtonText}>
              {selectedImages[item.id] ? 'File Added' : 'Add File'}
            </Text>
          </TouchableOpacity>

          {selectedImages[item.id] && (
            <>
              <TouchableOpacity
                style={localStyles.removeFileButton}
                onPress={() => removeImage(item.id)}
              >
                <Text style={localStyles.removeFileButtonText}>Remove File</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  localStyles.uploadButton,
                  uploadingEntryId === item.id && localStyles.disabledButton,
                ]}
                onPress={() => handleUploadProof(item.id)}
                disabled={uploadingEntryId === item.id}
              >
                <Text style={localStyles.uploadButtonText}>
                  {uploadingEntryId === item.id ? 'Uploading...' : 'Upload Proof'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#66A5FF" />
        <Text style={styles.loadingText}>Loading late entries...</Text>
      </View>
    );
  }

  if (lateEntries.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noEntriesText}>No late entries found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.goBackButton} onPress={() => router.push('/student/dashboard')}>
        <Text style={styles.goBackText}>← Back to Dashboard</Text>
      </TouchableOpacity>
      <FlatList
        data={lateEntries}
        keyExtractor={(item) => item.id}
        renderItem={renderLateEntry}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1128',
    padding: 16,
  },
  goBackButton: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1A2980',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  goBackText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 16,
  },
  entryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  entryText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: '#B8C2FF',
  },
  loadingText: {
    color: '#B8C2FF',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  noEntriesText: {
    color: '#B8C2FF',
    fontSize: 16,
    textAlign: 'center',
  },
});

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