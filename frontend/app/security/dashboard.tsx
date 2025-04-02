import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../services/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc,addDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { QrCode, Edit, Clock, User } from 'lucide-react-native';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProfileModal from './components/ProfileModal';
import ManualEntry from './components/ManualEntry';
import FetchLateEntries from './components/FetchLateEntries';

const SecurityDashboard = () => {
  const [name, setName] = useState('Security User');
  const [securityId, setSecurityId] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [securityData, setSecurityData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manualEntryVisible, setManualEntryVisible] = useState(false);
  const [rollNumber, setRollNumber] = useState('');
  const [studentData, setStudentData] = useState<any>(null);
  const [fetchingStudent, setFetchingStudent] = useState(false);
  const [confirmingEntry, setConfirmingEntry] = useState(false);
  

  useEffect(() => {
    const getSecurityData = async () => {
      try {
        const securityDataStr = await AsyncStorage.getItem('securityData');
        if (securityDataStr) {
          const data = JSON.parse(securityDataStr);
          setSecurityData(data);
          if (data.name) setName(data.name);
          if (data.securityId) setSecurityId(data.securityId);
        }
      } catch (error) {
        console.log('Error getting security data:', error);
      }
    };

    getSecurityData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      router.replace('/login');
    }
  };

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


  
  const confirmLateEntry = async () => {
    if (!studentData) return;
  
    try {
      setConfirmingEntry(true);
  
      const entryId = `${studentData.id}_${Date.now()}`;
      // Register the late entry in the 'lateEntries' collection
      await setDoc(doc(db, 'lateEntries', entryId), {
        studentId: studentData.id,
        studentName: studentData.name,
        rollNumber: studentData.rollNumber,
        timestamp: serverTimestamp(),
        entryType: 'Manual',
        status: 'recorded',
        verificationStatus: 'pending', // New field
        proofUrl: null, // New field
        securityId: auth.currentUser?.uid,
        securityName: auth.currentUser?.displayName || 'Security Officer',
      });
  
      // Add a notification for the user in the 'notifications' collection
      await addDoc(collection(db, 'notifications'), {
        userId: studentData.id, // The ID of the student
        message: `Your late entry has been registered by ${auth.currentUser?.displayName || 'Security Officer'}.`,
        timestamp: serverTimestamp(),
        readStatus: false, // Mark as unread initially
      });
  
      Alert.alert('Success', `Late entry recorded for ${studentData.name}`);
      setManualEntryVisible(false);
      setRollNumber('');
      setStudentData(null);
    } catch (error) {
      console.error('Error recording late entry:', error);
      Alert.alert('Error', 'Failed to record late entry. Please try again.');
    } finally {
      setConfirmingEntry(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A1128', '#1A2980', '#26305C']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

    <ManualEntry
        visible={manualEntryVisible}
        onClose={() => setManualEntryVisible(false)} onEntryRegistered={function (): void {
          throw new Error('Function not implemented.');
        } }      />

      <Sidebar
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        securityData={securityData}
        onProfilePress={() => setProfileModalVisible(true)}
        activeMenuItem="Dashboard"
      />

      <ProfileModal
        isVisible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        securityData={securityData}
        loading={loading}
      />

      <Modal
        visible={manualEntryVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setManualEntryVisible(false)}
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
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{studentData.name}</Text>

                <Text style={styles.detailLabel}>Roll Number:</Text>
                <Text style={styles.detailValue}>{studentData.rollNumber}</Text>

                {studentData.roomNumber && (
                  <>
                    <Text style={styles.detailLabel}>Room Number:</Text>
                    <Text style={styles.detailValue}>{studentData.roomNumber}</Text>
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
                  setManualEntryVisible(false);
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

      <Header
        name={name}
        securityId={securityId}
        onMenuPress={() => setSidebarVisible(true)}
        onNotificationPress={() => alert('Notifications coming soon')}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>Security Control Panel</Text>

          <View style={styles.cardsContainer}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => setManualEntryVisible(true)}
            >
              <View style={styles.cardIconContainer}>
                <Edit size={30} color="#66A5FF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Manual Entry</Text>
                <Text style={styles.cardText}>
                  Enter roll number to manually record late entry
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <FetchLateEntries />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 22,
    color: '#B8C2FF',
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: '600',
  },
  cardsContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(102, 165, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardText: {
    color: '#B8C2FF',
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
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

export default SecurityDashboard;