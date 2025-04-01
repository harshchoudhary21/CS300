// app/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import Animated, { FadeInDown, FadeIn, SlideInRight } from 'react-native-reanimated';
import { Mail, Lock, ArrowRight, ChevronLeft, UserCircle, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './styles/login.style';

// Import Firebase config
import { auth, db } from '../services/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';

type UserType = 'student' | 'security' | null;
const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function LoginScreen() {
  const [userType, setUserType] = useState<UserType>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string, type: UserType): boolean => {
    if (!email) return false;
    
    if (type === 'student') {
      return email.endsWith('@iiitg.ac.in');
    } else if (type === 'security') {
      return email.endsWith('@security.iiitg.ac.in');
    }
    
    return false;
  };

  const handleLogin = async () => {
    try {
      // Reset error
      setError(null);
      
      // Basic validation
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }
      
      if (!validateEmail(email, userType)) {
        setError(`Please enter a valid ${userType === 'student' ? 'student' : 'security'} email address`);
        return;
      }
      
      // Start loading
      setLoading(true);
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch user data from Firestore to check role
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        throw new Error("User profile not found");
      }
      
      const userData = userDoc.data();
      
      // Verify that the user is trying to login with the correct user type
      if (userData.role !== userType) {
        throw new Error(`This account is not registered as a ${userType}. Please use the correct login option.`);
      }
      
      // Navigate to the appropriate dashboard
      if (userType === 'student') {
        router.replace('/student/dashboard');
      } else {
        router.replace('/security/dashboard');
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle Firebase auth errors
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later or reset your password.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!userType) {
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
              <Text style={styles.subtitle}>Select your account type to continue</Text>
            </Animated.View>

            <Animated.View style={styles.userTypeContainer} entering={FadeInDown.delay(600).springify()}>
              <TouchableOpacity style={styles.userTypeButton} onPress={() => setUserType('student')} activeOpacity={0.7}>
                <LinearGradient colors={['rgba(76, 99, 210, 0.2)', 'rgba(102, 165, 255, 0.2)']} style={styles.userTypeGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <View style={styles.userTypeIconContainer}><UserCircle size={30} color="#66A5FF" /></View>
                  <Text style={styles.userTypeTitle}>Student</Text>
                  <Text style={styles.userTypeDescription}>Access your student account</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.userTypeButton} onPress={() => setUserType('security')} activeOpacity={0.7}>
                <LinearGradient colors={['rgba(76, 99, 210, 0.2)', 'rgba(102, 165, 255, 0.2)']} style={styles.userTypeGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <View style={styles.userTypeIconContainer}><ShieldCheck size={30} color="#66A5FF" /></View>
                  <Text style={styles.userTypeTitle}>Security</Text>
                  <Text style={styles.userTypeDescription}>Access your security account</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(800).springify()} style={styles.bottomContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <Link href="/signup" asChild><TouchableOpacity><Text style={styles.signupLink}>Sign Up</Text></TouchableOpacity></Link>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(900).springify()} style={styles.homeLink}>
              <Link href="/" asChild><TouchableOpacity style={styles.homeLinkButton}><ChevronLeft size={16} color="#B8C2FF" /><Text style={styles.homeLinkText}>Back to Home</Text></TouchableOpacity></Link>
            </Animated.View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A1128', '#1A2980', '#26305C']} style={styles.gradientBackground} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <Animated.View entering={SlideInRight.delay(200).springify()} style={[styles.decorCircle, styles.decorCircle1]} />
      <Animated.View entering={SlideInRight.delay(300).springify()} style={[styles.decorCircle, styles.decorCircle2]} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Animated.View entering={FadeIn.delay(100).springify()} style={styles.typeIndicator}>
            <Text style={styles.typeIndicatorText}>{userType === 'student' ? 'Student Login' : 'Security Login'}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to your {userType === 'student' ? 'student' : 'security'} account</Text>
          </Animated.View>

          <Animated.View style={styles.form} entering={FadeInDown.delay(400).springify()}>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#B8C2FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={`Email (${userType === 'student' ? '@iiitg.ac.in' : '@security.iiitg.ac.in'})`}
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

            <TouchableOpacity style={styles.backButton} onPress={() => setUserType(null)}>
              <ChevronLeft size={18} color="#B8C2FF" />
              <Text style={styles.backButtonText}>Change Account Type</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}