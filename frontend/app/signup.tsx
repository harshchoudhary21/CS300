import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Dimensions, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Link, router } from 'expo-router';
import Animated, { FadeInDown, FadeIn, SlideInRight } from 'react-native-reanimated';
import { Mail, Lock, User, Phone, IdCard, ArrowRight, ChevronLeft, Camera } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles/signup.style';

// Firebase
import { auth, db } from '../services/firebaseConfig';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { setDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

// Cloudinary presets
const CLOUDINARY_CLOUD_NAME = 'dmzk8rqfh';
const CLOUDINARY_UPLOAD_PRESET_PHOTO = 'unsigned_student_signup';
const CLOUDINARY_UPLOAD_PRESET_IDCARD = 'unsigned_student_idcard';

async function uploadToCloudinary(uri: string, preset: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const data = new FormData();
  data.append('file', blob, 'upload.jpg');
  data.append('upload_preset', preset);
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const res = await fetch(url, { method: 'POST', body: data });
  const result = await res.json();
  if (!result.secure_url) throw new Error('Upload failed');
  return result.secure_url;
}

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [idCardUri, setIdCardUri] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function clearSession() {
      const allKeys = await AsyncStorage.getAllKeys();
      const toRemove = allKeys.filter(k => k.startsWith('firebase:authUser:') ||
        ['refreshToken','userId','userName','userToken','userData','securityData'].includes(k)
      );
      if (toRemove.length) await AsyncStorage.multiRemove(toRemove);
      if (auth.currentUser) await signOut(auth);
    }
    clearSession();
  }, []);

  const pickImage = async (setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1,1],
      quality: 0.8,
    });
    if (!result.canceled) setter(result.assets[0].uri);
  };

  const handleSignUp = async () => {
    setError(null);
    // Basic validation
    if (!name) return setError('Please enter your full name');
    if (!email) return setError('Please enter your email');
    if (!email.endsWith('@iiitg.ac.in')) return setError('Use IIITG email');
    if (!rollNumber) return setError('Please enter your roll number');
    if (!phoneNumber) return setError('Please enter your phone number');
    if (!password) return setError('Please enter a password');
    if (password.length < 6) return setError('Password too short');
    if (!photoUri) return setError('Profile photo required');
    if (!idCardUri) return setError('Student ID card required');

    setLoading(true);
    try {
      // Uniqueness checks
      const usersRef = collection(db, 'users');
      let snap = await getDocs(query(usersRef, where('rollNumber','==',rollNumber.trim())));
      if (!snap.empty) throw new Error('Roll number already registered');
      snap = await getDocs(query(usersRef, where('phoneNumber','==',phoneNumber.trim())));
      if (!snap.empty) throw new Error('Phone number already registered');

      // Create auth user
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      await AsyncStorage.setItem('userId', uid);
      await AsyncStorage.setItem('userName','Student');

      // Upload images
      const [photoURL, idCardURL] = await Promise.all([
        uploadToCloudinary(photoUri, CLOUDINARY_UPLOAD_PRESET_PHOTO),
        uploadToCloudinary(idCardUri, CLOUDINARY_UPLOAD_PRESET_IDCARD)
      ]);

      // Save Firestore doc
      const userData = {
        name, email, rollNumber, phoneNumber,
        imageUrl: photoURL,
        idCardURL,
        role:'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db,'users',uid), userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      router.replace('/student/dashboard');
    } catch(err: any) {
      console.error(err);
      setError(err.message || 'Signup error');
      if (auth.currentUser) await signOut(auth);
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A1128', '#1A2980', '#26305C']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Animated.View entering={SlideInRight.delay(200).springify()} style={[styles.decorCircle, styles.decorCircle1]} />
      <Animated.View entering={SlideInRight.delay(300).springify()} style={[styles.decorCircle, styles.decorCircle2]} />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Animated.View entering={FadeIn.delay(100).springify()} style={styles.typeIndicator}>
            <Text style={styles.typeIndicatorText}>Student Registration</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join CampusFlow as a student</Text>
          </Animated.View>
          <Animated.View style={styles.form} entering={FadeInDown.delay(400).springify()}>
            {/* Profile Photo Picker */}
            <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(setPhotoUri)}>
              {photoUri ? <Image source={{ uri: photoUri }} style={styles.image} /> : (
                <View style={styles.imagePlaceholder}>
                  <Camera size={30} color="#B8C2FF" />
                  <Text style={styles.imageText}>Upload Photo *</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* ID Card Picker */}
            <TouchableOpacity   style={[styles.imagePicker, styles.idCardPicker]}  onPress={() => pickImage(setIdCardUri)}>
              {idCardUri ? <Image source={{ uri: idCardUri }} style={styles.image} /> : (
                <View style={styles.imagePlaceholder}>
                  <IdCard size={30} color="#B8C2FF" />
                  <Text style={styles.imageText}>Upload Student ID Card *</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Text Inputs */}
            <View style={styles.inputContainer}>
              <User size={20} color="#B8C2FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#8891B9"
                value={name}
                onChangeText={setName}
              />
            </View>
            {/* ... other inputs unchanged ... */}
            <View style={styles.inputContainer}>
              <Mail size={20} color="#B8C2FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email (@iiitg.ac.in)"
                placeholderTextColor="#8891B9"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View style={styles.inputContainer}>
              <IdCard size={20} color="#B8C2FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Roll Number"
                placeholderTextColor="#8891B9"
                value={rollNumber}
                onChangeText={setRollNumber}
              />
            </View>
            <View style={styles.inputContainer}>
              <Phone size={20} color="#B8C2FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#8891B9"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
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
              <TouchableOpacity onPress={() => setPasswordVisible(v => !v)} style={styles.visibilityToggle}>
                <Text style={styles.visibilityToggleText}>{passwordVisible ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.buttonWrapper, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
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
                    <Text style={styles.buttonText}>Sign Up</Text>
                    <ArrowRight size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </Link>
            </View>
            <Animated.View entering={FadeInDown.delay(900).springify()} style={styles.homeLink}>
              <Link href="/" asChild>
                <TouchableOpacity style={styles.homeLinkButton}>
                  <ChevronLeft size={16} color="#B8C2FF" />
                  <Text style={styles.homeLinkText}>Back to Home</Text>
                </TouchableOpacity>
              </Link>
            </Animated.View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}
