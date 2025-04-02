import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';

interface NotificationsProps {
  userId: string;
}

const Notifications: React.FC<NotificationsProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

 const fetchNotifications = async () => {
  try {
    setLoading(true);

    console.log('Fetching notifications for User ID:', userId);

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);

    console.log('Query Results:', querySnapshot.docs.map(doc => doc.data()));

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

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { readStatus: true });

      // Update the local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, readStatus: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#66A5FF" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.noNotificationsContainer}>
        <Text style={styles.noNotificationsText}>No notifications found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={[styles.notificationCard, item.readStatus && styles.readNotification]}>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
          {!item.readStatus && (
            <TouchableOpacity
              style={styles.markAsReadButton}
              onPress={() => markAsRead(item.id)}
            >
              <Text style={styles.markAsReadText}>Mark as Read</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
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
    padding: 20,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  readNotification: {
    opacity: 0.6,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 5,
  },
  timestamp: {
    color: '#B8C2FF',
    fontSize: 12,
    marginBottom: 10,
  },
  markAsReadButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#66A5FF',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  markAsReadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Notifications;