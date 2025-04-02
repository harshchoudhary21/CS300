// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
// import * as BarCodeScanner from 'expo-barcode-scanner'; // Changed import style
// import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
// import { db, auth } from '../../../services/firebaseConfig';

// interface QRScannerProps {
//   visible: boolean;
//   onClose: () => void;
//   onScanSuccess?: (studentData: any) => void;
// }

// const QRScanner = ({ visible, onClose, onScanSuccess }: QRScannerProps) => {
//   const [hasPermission, setHasPermission] = useState<boolean | null>(null);
//   const [scanned, setScanned] = useState(false);
//   const [userData, setUserData] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [processingData, setProcessingData] = useState(false);

//   useEffect(() => {
//     const getBarCodeScannerPermissions = async () => {
//       const { status } = await BarCodeScanner.requestPermissionsAsync();
//       setHasPermission(status === 'granted');
//     };

//     getBarCodeScannerPermissions();
//   }, []);

//   useEffect(() => {
//     if (visible) {
//       setScanned(false);
//       setUserData(null);
//       setError(null);
//     }
//   }, [visible]);

//   const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
//     try {
//       setScanned(true);
//       setProcessingData(true);
//       console.log(`Bar code with type ${type} and data ${data} has been scanned!`);

//       let studentInfo;
//       try {
//         studentInfo = JSON.parse(data);
//         console.log("Parsed student info from QR:", studentInfo);
//       } catch (parseError) {
//         console.log("Not JSON, treating as roll number:", data);
//         if (typeof data === 'string' && data.trim()) {
//           studentInfo = { rollNumber: data.trim() };
//         } else {
//           throw new Error("Invalid QR code format");
//         }
//       }

//       if (!studentInfo || !studentInfo.rollNumber) {
//         throw new Error("No student roll number found in QR data");
//       }

//       console.log("Searching for student with roll number:", studentInfo.rollNumber);
//       const studentsRef = collection(db, 'users');
//       const q = query(
//         studentsRef,
//         where('rollNumber', '==', studentInfo.rollNumber),
//         where('role', '==', 'student')
//       );

//       const querySnapshot = await getDocs(q);

//       if (querySnapshot.empty) {
//         throw new Error(`No student found with roll number: ${studentInfo.rollNumber}`);
//       }

//       const studentDoc = querySnapshot.docs[0];
//       const studentData = {
//         id: studentDoc.id,
//         ...studentDoc.data()
//       };

//       console.log("Found student in database:", studentData);
//       setUserData(studentData);

//       if (onScanSuccess) {
//         onScanSuccess(studentData);
//       }
//     } catch (error) {
//       console.error("Error processing QR scan:", error);
//       if (error instanceof Error) {
//         setError(error.message || "Failed to process QR code");
//       } else {
//         setError("Failed to process QR code");
//       }
//       setTimeout(() => {
//         setScanned(false);
//         setError(null);
//       }, 3000);
//     } finally {
//       setProcessingData(false);
//     }
//   };

//   const handleConfirmEntry = async () => {
//     if (!userData) return;

//     try {
//       setLoading(true);
//       const entryId = `${userData.id}_${Date.now()}`;

//       await setDoc(doc(db, 'lateEntries', entryId), {
//         studentId: userData.id,
//         studentName: userData.name,
//         rollNumber: userData.rollNumber,
//         timestamp: serverTimestamp(),
//         entryType: 'QR',
//         status: 'recorded',
//         securityId: auth.currentUser?.uid,
//         securityName: auth.currentUser?.displayName || 'Security Officer',
//       });

//       console.log("Late entry recorded successfully with ID:", entryId);
//       setUserData(null);
//       setScanned(false);
//       onClose();
//     } catch (err) {
//       console.error("Error recording late entry:", err);
//       setError('Failed to register late entry');
//       setTimeout(() => setError(null), 3000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (hasPermission === null) {
//     return (
//       <Modal visible={visible} animationType="slide">
//         <View style={styles.container}>
//           <View style={styles.permissionContainer}>
//             <ActivityIndicator size="large" color="#66A5FF" />
//             <Text style={styles.permissionText}>Requesting camera permission...</Text>
//             <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//               <Text style={styles.closeButtonText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     );
//   }

//   if (hasPermission === false) {
//     return (
//       <Modal visible={visible} animationType="slide">
//         <View style={styles.container}>
//           <View style={styles.permissionContainer}>
//             <Text style={styles.permissionErrorText}>Camera access required</Text>
//             <Text style={styles.permissionSubText}>
//               Please grant camera permission in your device settings to scan QR codes.
//             </Text>
//             <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//               <Text style={styles.closeButtonText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     );
//   }

//   return (
//     <Modal visible={visible} animationType="slide">
//       <View style={styles.container}>
//         {!userData ? (
//           <>
//             <View style={StyleSheet.absoluteFillObject}>
//               <BarCodeScanner.BarCodeScanner // Changed to use the component directly
//                 onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
//                 style={StyleSheet.absoluteFillObject}
//               />
//             </View>

//             <View style={styles.overlay}>
//               <View style={styles.scanFrame} />
//               <Text style={styles.scanText}>Scan Student QR Code</Text>
//               <Text style={styles.scanSubtext}>Align QR code within frame</Text>

//               {scanned && processingData && (
//                 <View style={styles.processingContainer}>
//                   <ActivityIndicator size="small" color="#FFFFFF" />
//                   <Text style={styles.processingText}>Processing...</Text>
//                 </View>
//               )}

//               {error && (
//                 <View style={styles.errorBox}>
//                   <Text style={styles.errorText}>⚠️ {error}</Text>
//                 </View>
//               )}

//               <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//                 <Text style={styles.closeButtonText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </>
//         ) : (
//           <View style={styles.resultContainer}>
//             <Text style={styles.title}>Student Verification</Text>

//             <View style={styles.detailCard}>
//               <Text style={styles.detailLabel}>Name:</Text>
//               <Text style={styles.detailValue}>{userData.name}</Text>

//               <Text style={styles.detailLabel}>Roll Number:</Text>
//               <Text style={styles.detailValue}>{userData.rollNumber}</Text>

//               {userData.roomNumber && (
//                 <>
//                   <Text style={styles.detailLabel}>Room Number:</Text>
//                   <Text style={styles.detailValue}>{userData.roomNumber}</Text>
//                 </>
//               )}

//               <Text style={styles.detailLabel}>Entry Time:</Text>
//               <Text style={styles.detailValue}>
//                 {new Date().toLocaleTimeString()} ({new Date().toLocaleDateString()})
//               </Text>
//             </View>

//             <View style={styles.buttonContainer}>
//               <TouchableOpacity
//                 style={[styles.button, styles.cancelButton]}
//                 onPress={() => {
//                   setScanned(false);
//                   setUserData(null);
//                 }}
//                 disabled={loading}
//               >
//                 <Text style={styles.buttonText}>Rescan</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.button, styles.confirmButton]}
//                 onPress={handleConfirmEntry}
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <ActivityIndicator color="#FFFFFF" />
//                 ) : (
//                   <Text style={styles.buttonText}>Confirm Entry</Text>
//                 )}
//               </TouchableOpacity>
//             </View>

//             {error && (
//               <View style={styles.errorBox}>
//                 <Text style={styles.errorText}>⚠️ {error}</Text>
//               </View>
//             )}
//           </View>
//         )}
//       </View>
//     </Modal>
//   );
// };

// // Styles remain the same
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0A1128',
//   },
//   permissionContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   permissionText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     marginTop: 20,
//     marginBottom: 30,
//     textAlign: 'center',
//   },
//   permissionErrorText: {
//     color: '#FF9A9A',
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   permissionSubText: {
//     color: '#B8C2FF',
//     fontSize: 16,
//     marginBottom: 30,
//     textAlign: 'center',
//     lineHeight: 22,
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   scanFrame: {
//     width: 250,
//     height: 250,
//     borderWidth: 2,
//     borderColor: '#66A5FF',
//     borderRadius: 12,
//     marginBottom: 40,
//   },
//   scanText: {
//     color: '#FFFFFF',
//     fontSize: 22,
//     fontWeight: '600',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   scanSubtext: {
//     color: 'rgba(255,255,255,0.8)',
//     fontSize: 16,
//     marginBottom: 40,
//     textAlign: 'center',
//   },
//   processingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//     marginBottom: 30,
//   },
//   processingText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     marginLeft: 10,
//   },
//   resultContainer: {
//     flex: 1,
//     padding: 25,
//   },
//   title: {
//     color: '#FFFFFF',
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 30,
//     textAlign: 'center',
//   },
//   detailCard: {
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 30,
//   },
//   detailLabel: {
//     color: '#B8C2FF',
//     fontSize: 14,
//     marginBottom: 4,
//   },
//   detailValue: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     marginBottom: 15,
//     fontWeight: '500',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 'auto',
//   },
//   button: {
//     padding: 16,
//     borderRadius: 10,
//     width: '48%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   confirmButton: {
//     backgroundColor: 'rgba(102, 165, 255, 0.3)',
//   },
//   cancelButton: {
//     backgroundColor: 'rgba(255, 83, 83, 0.3)',
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   closeButton: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//     borderRadius: 25,
//     marginTop: 20,
//   },
//   closeButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   errorBox: {
//     backgroundColor: 'rgba(255, 83, 83, 0.8)',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   errorText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     textAlign: 'center',
//   },
// });

// export default QRScanner;