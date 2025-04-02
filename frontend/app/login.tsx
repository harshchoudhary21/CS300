// app/login.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import Animated, { FadeInDown, FadeIn, SlideInRight } from 'react-native-reanimated';
import { Mail, Lock, ArrowRight, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './styles/login.style';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Firebase config
import { auth, db } from '../services/firebaseConfig';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear storage when component mounts
  useEffect(() => {
    const clearStorageData = async () => {
      try {
        console.log('Clearing previous session data from storage...');
        
        // Get all keys from AsyncStorage
        const allKeys = await AsyncStorage.getAllKeys();
        
        // Filter keys to remove based on patterns
        const keysToRemove = allKeys.filter(key => 
          // Match Firebase auth user data with any API key
          key.startsWith('firebase:authUser:') || 
          // Match other session related keys
          ['refreshToken', 'userId', 'userName', 'userToken', 'userData', 'securityData'].includes(key)
        );
        
        // Remove the matched keys
        if (keysToRemove.length > 0) {
          await AsyncStorage.multiRemove(keysToRemove);
          console.log(`Cleared ${keysToRemove.length} items from storage`);
        } else {
          console.log('No session data found to clear');
        }
        
        // Sign out current user if any
        if (auth.currentUser) {
          await signOut(auth);
          console.log('Signed out previous user session');
        }
      } catch (error) {
        console.error('Error clearing storage:', error);
        // Continue anyway - this shouldn't block login
      }
    };
    
    clearStorageData();
  }, []);

  const handleLogin = async () => {
    try {
      // Reset error
      setError(null);
      
      // Clear any existing storage again right before login attempt
      try {
        // Get all keys from AsyncStorage
        const allKeys = await AsyncStorage.getAllKeys();
        
        // Filter keys to remove based on patterns
        const keysToRemove = allKeys.filter(key => 
          // Match Firebase auth user data with any API key
          key.startsWith('firebase:authUser:') || 
          // Match other session related keys
          ['refreshToken', 'userId', 'userName', 'userToken', 'userData', 'securityData'].includes(key)
        );
        
        // Remove the matched keys
        if (keysToRemove.length > 0) {
          await AsyncStorage.multiRemove(keysToRemove);
          console.log(`Cleared ${keysToRemove.length} items before login attempt`);
        }
        
        // Also sign out if there's any existing session
        if (auth.currentUser) {
          await signOut(auth);
          console.log('Signed out previous user session');
        }
      } catch (storageError) {
        console.error('Error clearing storage before login:', storageError);
        // Continue with login anyway
      }
      
      // Basic validation
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }
      
      // Start loading
      setLoading(true);
      
      try {
        // Sign in with Firebase auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Query users collection to find the user and determine their role
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('email', '==', email));
        const userSnapshot = await getDocs(userQuery);
        
        if (userSnapshot.empty) {
          throw new Error('User profile not found');
        }
        
        // Get the first matching user document
        const userData = userSnapshot.docs[0].data();
        
        // Store minimal user info for persistence
        await AsyncStorage.setItem('userId', user.uid);
        await AsyncStorage.setItem('userName', userData.role === 'student' ? 'Student' : 'Security');
        
        // Route based on role
        if (userData.role === 'student') {
          console.log('Student user found, navigating to student dashboard');
          router.replace('/student/dashboard');
        }        // Update only the security navigation part in handleLogin function:
        
        else if (userData.role === 'security') {
          console.log('Security user found, preparing security dashboard data');
          
          try {
            // Prepare and store security data before navigation
            const securityData = {
              name: userData.name || 'Security User',
              email: userData.email,
              phone: userData.phone || userData.phoneNumber || '',
              status: userData.status || 'active',
              securityId: userData.securityId || '',
              id: user.uid,
              role: 'security'
            };
            
            // Store security data BEFORE navigation
            await AsyncStorage.setItem('securityData', JSON.stringify(securityData));
            await AsyncStorage.setItem('userRole', 'security');
            console.log('Security data prepared and stored before navigation');
            
            // Ensure user is authenticated in Firebase
            if (!auth.currentUser) {
              throw new Error('User authentication lost during login process');
            }
            
            // Use navigation with replace and NO delay
            router.replace('/security/dashboard');
          } catch (err) {
            console.error('Error preparing security data:', err);
            setError('Error preparing security dashboard. Please try again.');
          }
        }else if (userData.role === 'admin') {
          // Admin login not allowed in mobile app
          throw new Error('Admin login is not available through the mobile app');
        } else {
          throw new Error('Unknown user role');
        }
        
      } catch (authError: any) {
        console.error('Auth error:', authError);
        
        if (authError.code === 'auth/invalid-credential' || 
            authError.code === 'auth/user-not-found' || 
            authError.code === 'auth/wrong-password') {
          throw new Error('Invalid email or password');
        } else if (authError.code === 'auth/too-many-requests') {
          throw new Error('Too many failed login attempts. Please try again later.');
        } else if (authError.code === 'auth/invalid-email') {
          throw new Error('Please enter a valid email address');
        } else if (authError.message) {
          throw new Error(authError.message);
        } else {
          throw new Error('Authentication failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An unexpected error occurred');
      
      // If login fails, clear any partial auth data
      try {
        if (auth.currentUser) {
          await signOut(auth);
        }
      } catch (signOutError) {
        console.error('Error signing out after failed login:', signOutError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Single login screen for all users
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A1128', '#1A2980', '#26305C']} style={styles.gradientBackground} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <Animated.View entering={SlideInRight.delay(200).springify()} style={[styles.decorCircle, styles.decorCircle1]} />
      <Animated.View entering={SlideInRight.delay(300).springify()} style={[styles.decorCircle, styles.decorCircle2]} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.logoContainer}>
            <LinearGradient colors={['#4C63D2', '#66A5FF']} style={styles.logo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.logoText}>CF</Text>
            </LinearGradient>
            <Text style={styles.logoTitle}>CampusFlow</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </Animated.View>

          <Animated.View style={styles.form} entering={FadeInDown.delay(400).springify()}>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#B8C2FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#8891B9"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#B8C2FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#8891B9"
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.visibilityToggle}>
                <Text style={styles.visibilityToggleText}>{passwordVisible ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handleLogin}
              disabled={loading}
              style={loading ? styles.buttonDisabled : undefined}
            >
              <LinearGradient 
                colors={['#4C63D2', '#5A74E2', '#66A5FF']} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }} 
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Log In</Text>
                    <ArrowRight size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <Link href="/signup" asChild><TouchableOpacity><Text style={styles.signupLink}>Sign Up</Text></TouchableOpacity></Link>
            </View>

            <View style={styles.homeLink}>
              <Link href="/" asChild><TouchableOpacity style={styles.homeLinkButton}><ChevronLeft size={16} color="#B8C2FF" /><Text style={styles.homeLinkText}>Back to Home</Text></TouchableOpacity></Link>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}