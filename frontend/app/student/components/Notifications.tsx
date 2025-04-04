import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch the userId from AsyncStorage
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          console.error('User ID not found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching userId from AsyncStorage:', error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const fetchedNotifications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));

      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => router.push('/student/dashboard')} style={styles.goBackButton}>
            <Text style={styles.goBackText}>← Back</Text>
          </TouchableOpacity>
          
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#66A5FF" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => router.push('/student/dashboard')} style={styles.goBackButton}>
            <Text style={styles.goBackText}>← Back</Text>
          </TouchableOpacity>
          
        </View>
        <View style={styles.noNotificationsContainer}>
          <Text style={styles.noNotificationsText}>No notifications found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.push('/student/dashboard')} style={styles.goBackButton}>
          <Text style={styles.goBackText}>← Back</Text>
        </TouchableOpacity>
        
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.notificationCard}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the background covers the entire screen
    backgroundColor: '#0A1128', // Match dashboard background
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#1A2980', // Navbar background color
  },
  goBackButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  goBackText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  navbarTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#B8C2FF',
    fontSize: 16,
    marginTop: 10,
  },
  noNotificationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noNotificationsText: {
    color: '#B8C2FF',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Match card style in dashboard
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  timestamp: {
    color: '#B8C2FF',
    fontSize: 12,
  },
});

export default Notifications;