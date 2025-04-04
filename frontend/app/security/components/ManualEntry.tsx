import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Alert, ActivityIndicator, Image, Appearance } from 'react-native';
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db, auth } from '../../../services/firebaseConfig';

interface ManualEntryProps {
  visible: boolean;
  onClose: () => void;
  onEntryRegistered: () => void; // Callback to notify parent when an entry is registered
}

const ManualEntry: React.FC<ManualEntryProps> = ({ visible, onClose, onEntryRegistered }) => {
  const [rollNumber, setRollNumber] = useState('');
  const [studentData, setStudentData] = useState<any>(null);
  const [fetchingStudent, setFetchingStudent] = useState(false);
  const [confirmingEntry, setConfirmingEntry] = useState(false);

  // Fetch student details by roll number
  const fetchStudentDetails = async () => {
    if (!rollNumber.trim()) {
      Alert.alert('Error', 'Please enter a valid roll number.');
      return;
    }

    try {
      setFetchingStudent(true);
      setStudentData(null);

      const studentsRef = collection(db, 'users');
      const q = query(studentsRef, where('rollNumber', '==', rollNumber.trim()), where('role', '==', 'student'));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Error', `No student found with roll number: ${rollNumber}`);
        return;
      }

      const studentDoc = querySnapshot.docs[0];
      const student = {
        id: studentDoc.id,
        ...studentDoc.data(),
      };

      setStudentData(student);
    } catch (error) {
      console.error('Error fetching student details:', error);
      Alert.alert('Error', 'Failed to fetch student details. Please try again.');
    } finally {
      setFetchingStudent(false);
    }
  };

  // Confirm and register late entry
  const confirmLateEntry = async () => {
    if (!studentData) return;

    try {
      setConfirmingEntry(true);

      const entryId = `${studentData.id}_${Date.now()}`;
      await setDoc(doc(db, 'lateEntries', entryId), {
        studentId: studentData.id,
        studentName: studentData.name,
        rollNumber: studentData.rollNumber,
        timestamp: serverTimestamp(),
        entryType: 'Manual',
        status: 'recorded',
        verificationStatus: 'pending',
        proofUrl: null,
        securityId: auth.currentUser?.uid,
        securityName: auth.currentUser?.displayName || 'Security Officer',
      });

      await addDoc(collection(db, 'notifications'), {
        userId: studentData.id,
        message: `Your late entry has been registered by ${auth.currentUser?.displayName || 'Security Officer'}.`,
        timestamp: serverTimestamp(),
        readStatus: false,
      });

      Alert.alert('Success', `Late entry recorded for ${studentData.name}`);
      onClose();
      setRollNumber('');
      setStudentData(null);

      // Notify the parent component to refresh the latest entries
      onEntryRegistered();
    } catch (error) {
      console.error('Error recording late entry:', error);
      Alert.alert('Error', 'Failed to record late entry. Please try again.');
    } finally {
      setConfirmingEntry(false);
    }
  };

  // Get the current theme ('dark' or 'light')
  const colorScheme = Appearance.getColorScheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Manual Entry</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter Roll Number"
            placeholderTextColor="#B8C2FF"
            value={rollNumber}
            onChangeText={setRollNumber}
            editable={!fetchingStudent && !confirmingEntry}
          />

          {fetchingStudent ? (
            <ActivityIndicator size="large" color="#66A5FF" />
          ) : studentData ? (
            <View style={styles.studentDetails}>
              {/* Profile Photo */}
              <View style={styles.profilePhotoContainer}>
                {studentData.imageUrl ? (
                  <Image
                    source={{ uri: studentData.imageUrl }}
                    style={[
                      styles.profileImage,
                      { borderColor: colorScheme === 'dark' ? '#fff' : '#000' },
                    ]}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.profileImagePlaceholder,
                      { borderColor: colorScheme === 'dark' ? '#fff' : '#000' },
                    ]}
                  >
                    <Text style={styles.placeholderText}>No Photo</Text>
                  </View>
                )}
              </View>

              {/* Student Details */}
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{studentData.name}</Text>

              <Text style={styles.detailLabel}>Roll Number:</Text>
              <Text style={styles.detailValue}>{studentData.rollNumber}</Text>

              {studentData.phoneNumber && (
                <>
                  <Text style={styles.detailLabel}>Phone Number:</Text>
                  <Text style={styles.detailValue}>{studentData.phoneNumber}</Text>
                </>
              )}

            </View>
          ) : null}

          <View style={styles.modalActions}>
            {!studentData ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={fetchStudentDetails}
                disabled={fetchingStudent || confirmingEntry}
              >
                <Text style={styles.actionButtonText}>Fetch Details</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={confirmLateEntry}
                disabled={confirmingEntry}
              >
                {confirmingEntry ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Confirm Entry</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                onClose();
                setRollNumber('');
                setStudentData(null);
              }}
              disabled={fetchingStudent || confirmingEntry}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1A2980',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
  },
  studentDetails: {
    marginBottom: 20,
  },
  profilePhotoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  detailLabel: {
    color: '#B8C2FF',
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#66A5FF',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 83, 83, 0.8)',
  },
});

export default ManualEntry;