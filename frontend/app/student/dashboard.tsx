import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import WelcomeBanner from './components/WelcomeBanner';
import QRCodeCard from './components/QRCodeCard';
import LateEntriesCard from './components/LateEntriesCard';
import RecentActivityCard from './components/RecentActivityCard';
import ProfileModal from './components/ProfileModal';
import styles from '../styles/dashboard.style';

// Firebase
import { auth, db } from '../../services/firebaseConfig';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';

export default function StudentDashboard() {
  // UI state
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  
  // Data state
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const user = auth.currentUser;
        if (!user) {
          console.log('No user logged in, redirecting to login');
          router.replace('/login');
          return;
        }

        console.log('Fetching user data for:', user.uid);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          console.log('User document not found');
          setError('User profile not found');
          return;
        }

        const data = userDoc.data();
        console.log('User data retrieved:', data);
        
        // Store user data in state
        setUserData({
          ...data,
          email: user.email || data.email || 'Not available',
          id: user.uid
        });
        
        // Fetch recent notifications
        fetchRecentNotifications(user.uid);
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchRecentNotifications = async (userId: string) => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        // Limit to the latest 3 notifications
      );
      const querySnapshot = await getDocs(q);

      const fetchedNotifications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));

      // Set only the latest 3 notifications
      setRecentNotifications(fetchedNotifications.slice(0, 3));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Profile modal handlers
  const handleProfilePress = () => {
    setActiveMenuItem('Profile');
    setProfileModalVisible(true);
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient
          colors={['#0A1128', '#1A2980', '#26305C']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient
          colors={['#0A1128', '#1A2980', '#26305C']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => router.replace('/login')}>
            <Text style={styles.errorButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A1128', '#1A2980', '#26305C']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      <Header 
        onMenuPress={() => setSidebarVisible(true)}
        userName={userData?.name?.split(' ')[0]}
        notificationCount={notificationCount}
      />
      
      <Sidebar
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        userData={userData}
        onProfilePress={handleProfilePress}
        activeMenuItem={activeMenuItem}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <WelcomeBanner 
          name={userData?.name || 'Student'} 
          rollNumber={userData?.rollNumber || 'Not available'} 
        />
        
        <QRCodeCard userData={userData} />
        
        <LateEntriesCard />
        
        {/* Pass recent notifications to RecentActivityCard */}
        <RecentActivityCard notifications={recentNotifications} />
      </ScrollView>
      
      <ProfileModal
        isVisible={profileModalVisible}
        onClose={() => {
          setProfileModalVisible(false);
          setActiveMenuItem('Dashboard');
        }}
        userData={userData}
        loading={loading}
      />
    </SafeAreaView>
  );
}