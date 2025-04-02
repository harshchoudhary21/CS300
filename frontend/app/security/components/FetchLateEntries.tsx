import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';

const FetchLateEntries: React.FC = () => {
  const [latestEntries, setLatestEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);

        const entriesRef = collection(db, 'lateEntries');
        const q = query(entriesRef, orderBy('timestamp', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);

        const entries = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date(),
        }));

        setLatestEntries(entries);
      } catch (error) {
        console.error('Error fetching late entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#66A5FF" />
        <Text style={styles.loadingText}>Loading latest entries...</Text>
      </View>
    );
  }

  if (latestEntries.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noEntriesText}>No late entries found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Latest Late Entries</Text>
      {latestEntries.map((entry) => (
        <View key={entry.id} style={styles.entryCard}>
          <Text style={styles.entryText}>
            <Text style={styles.label}>Name:</Text> {entry.studentName}
          </Text>
          <Text style={styles.entryText}>
            <Text style={styles.label}>Roll Number:</Text> {entry.rollNumber}
          </Text>
          <Text style={styles.entryText}>
            <Text style={styles.label}>Time:</Text> {new Date(entry.timestamp).toLocaleTimeString()}
          </Text>
          <Text style={styles.entryText}>
            <Text style={styles.label}>Entered By:</Text> {entry.securityName || 'Unknown'}
          </Text>
          <Text style={styles.entryText}>
            <Text style={styles.label}>Type:</Text> {entry.entryType}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  entryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  entryText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 5,
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

export default FetchLateEntries;