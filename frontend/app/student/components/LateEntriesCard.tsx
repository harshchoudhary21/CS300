import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../services/firebaseConfig';
import styles from '../../styles/dashboard.style';

export default function LateEntriesCard() {
  const [lateEntries, setLateEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
            {/* Upload Proof Button */}
            <TouchableOpacity style={localStyles.uploadButton}>
              <Text style={localStyles.uploadButtonText}>Upload Proof</Text>
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
});