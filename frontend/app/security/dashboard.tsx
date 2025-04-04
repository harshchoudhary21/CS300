import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Modal, Alert, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../services/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { QrCode, Edit } from 'lucide-react-native';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProfileModal from './components/ProfileModal';
import ManualEntry from './components/ManualEntry';
import FetchLateEntries from './components/FetchLateEntries';
import CameraScanner from './components/QRScanner';

interface BarcodeScanningResult {
  type: string;
  data: string;
}

const SecurityDashboard = () => {
  const [name, setName] = useState('Security User');
  const [securityId, setSecurityId] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [securityData, setSecurityData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manualEntryVisible, setManualEntryVisible] = useState(false);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [rollNumber, setRollNumber] = useState('');
  const [studentData, setStudentData] = useState<any>(null);
  const [fetchingStudent, setFetchingStudent] = useState(false);
  const [confirmingEntry, setConfirmingEntry] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);

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

  const fetchStudentDetails = async (rollNum: string) => {
    if (!rollNum.trim()) {
      Alert.alert('Error', 'Invalid QR code data');
      return;
    }

    try {
      setFetchingStudent(true);
      setStudentData(null);

      const studentsRef = collection(db, 'users');
      const q = query(studentsRef, where('rollNumber', '==', rollNum.trim()), where('role', '==', 'student'));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Error', `No student found with roll number: ${rollNum}`);
        return;
      }

      const studentDoc = querySnapshot.docs[0];
      const student = {
        id: studentDoc.id,
        ...studentDoc.data(),
      };

      setStudentData(student);
      setConfirmationModalVisible(true); // Show confirmation modal
    } catch (error) {
      console.error('Error fetching student details:', error);
      Alert.alert('Error', 'Failed to fetch student details. Please try again.');
    } finally {
      setFetchingStudent(false);
    }
  };

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    try {
      // Parse the QR code data as JSON
      const qrData = JSON.parse(result.data);

      // Ensure the QR code contains a roll number
      if (!qrData.rollNumber) {
        Alert.alert('Error', 'Invalid QR code: Roll number not found.');
        return;
      }

      // Use the roll number to fetch student details
      const rollNum = qrData.rollNumber;
      setRollNumber(rollNum);
      fetchStudentDetails(rollNum);
    } catch (error) {
      console.error('Error parsing QR code data:', error);
      Alert.alert('Error', 'Failed to parse QR code data. Please try again.');
    }
  };

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
        entryType: 'QR',
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
      setConfirmationModalVisible(false);
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
        onClose={() => setManualEntryVisible(false)}
        onEntryRegistered={() => {}}
      />

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

      {/* Camera Scanner Modal */}
      <Modal
        visible={cameraModalVisible}
        animationType="slide"
        onRequestClose={() => setCameraModalVisible(false)}
      >
        <CameraScanner
          visible={cameraModalVisible}
          onClose={() => setCameraModalVisible(false)}
          onBarcodeScanned={handleBarcodeScanned}
        />
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setConfirmationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Late Entry</Text>
            {studentData && (
              <>
                {/* Display Student Photo */}
                {studentData.imageUrl ? (
                  <Image
                    source={{ uri: studentData.imageUrl }}
                    style={styles.studentPhoto}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>No Photo</Text>
                  </View>
                )}

                <Text style={styles.modalText}>
                  <Text style={styles.label}>Name:</Text> {studentData.name}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.label}>Roll Number:</Text> {studentData.rollNumber}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.label}>Entry Type:</Text> QR
                </Text>
              </>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={confirmLateEntry}
                disabled={confirmingEntry}
              >
                {confirmingEntry ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Confirm</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setConfirmationModalVisible(false)}
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
            {/* Manual Entry Card */}
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

            {/* QR Scan Card */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => setCameraModalVisible(true)}
            >
              <View style={styles.cardIconContainer}>
                <QrCode size={30} color="#66A5FF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Scan QR Code</Text>
                <Text style={styles.cardText}>
                  Use camera to scan student QR code
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
  modalText: {
    color: '#B8C2FF',
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
  label: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  studentPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    alignSelf: 'center',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#B8C2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  photoPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SecurityDashboard;