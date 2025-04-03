// app/signup.tsx
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

// Import Firebase config
import { auth, db } from '../services/firebaseConfig';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

// ----- Cloudinary Config & Upload Function -----
const CLOUDINARY_CLOUD_NAME = 'dmzk8rqfh';
const CLOUDINARY_UPLOAD_PRESET = 'unsigned_student_signup'; // Replace with your unsigned preset name

const uploadImageToCloudinary = async (imageUri: string) => {
  try {
    // Fetch the image and convert it to a blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Prepare FormData
    const data = new FormData();
    // Append the blob with a filename
    data.append('file', blob, 'upload.jpg');
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    // Cloudinary endpoint for uploads
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const uploadResponse = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: data,
    });
    const result = await uploadResponse.json();
    if (result.secure_url) {
      return result.secure_url;
    } else {
      throw new Error('Cloudinary upload failed: ' + JSON.stringify(result));
    }
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

// ----- SignUpScreen Component -----
export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear storage when component mounts
  useEffect(() => {
    const clearStorageData = async () => {
      try {
        console.log('Clearing previous session data from storage...');
        const allKeys = await AsyncStorage.getAllKeys();
        const keysToRemove = allKeys.filter(key =>
          key.startsWith('firebase:authUser:') ||
          ['refreshToken', 'userId', 'userName', 'userToken', 'userData', 'securityData'].includes(key)
        );
        if (keysToRemove.length > 0) {
          await AsyncStorage.multiRemove(keysToRemove);
          console.log(`Cleared ${keysToRemove.length} items from storage`);
        } else {
          console.log('No session data found to clear');
        }
        if (auth.currentUser) {
          await signOut(auth);
          console.log('Signed out previous user session');
        }
      } catch (error) {
        console.error('Error clearing storage:', error);
      }
    };
    clearStorageData();
  }, []);

  // Pick an image using Expo's ImagePicker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Handle Sign Up process
  const handleSignUp = async () => {
    try {
      setError(null);
      // Clear any existing storage before signup attempt
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const keysToRemove = allKeys.filter(key =>
          key.startsWith('firebase:authUser:') ||
          ['refreshToken', 'userId', 'userName', 'userToken', 'userData', 'securityData'].includes(key)
        );
        if (keysToRemove.length > 0) {
          await AsyncStorage.multiRemove(keysToRemove);
          console.log(`Cleared ${keysToRemove.length} items before signup attempt`);
        }
        if (auth.currentUser) {
          await signOut(auth);
          console.log('Signed out previous user session');
        }
      } catch (storageError) {
        console.error('Error clearing storage before signup:', storageError);
      }

      // Validate form inputs
      if (!name) {
        setError("Please enter your full name");
        return;
      }
      if (!email) {
        setError("Please enter your email address");
        return;
      }
      if (!email.endsWith('@iiitg.ac.in')) {
        setError("Please use your IIITG email address (@iiitg.ac.in)");
        return;
      }
      if (!rollNumber) {
        setError("Please enter your roll number");
        return;
      }
      if (!phoneNumber) {
        setError("Please enter your phone number");
        return;
      }
      if (!password) {
        setError("Please enter a password");
        return;
      }
      if (password.length < 6) {
        setError("Password should be at least 6 characters");
        return;
      }

      setLoading(true);
      console.log("Starting user creation...");

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User created in Auth:", user.uid);
      await AsyncStorage.setItem('userId', user.uid);
      await AsyncStorage.setItem('userName', 'Student');

      // Upload image to Cloudinary if selected
      let imageUrl = null;
      if (image) {
        try {
          imageUrl = await uploadImageToCloudinary(image);
          console.log("Image uploaded to Cloudinary:", imageUrl);
        } catch (uploadError) {
          console.error("Image upload failed, proceeding without image:", uploadError);
        }
      }

      // Create user document in Firestore
      try {
        const userData = {
          name,
          email,
          rollNumber,
          phoneNumber,
          imageUrl: imageUrl || null,
          role: "student",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, "users", user.uid), userData);
        console.log("User document created in Firestore");
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        router.replace('/student/dashboard');
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError);
        Alert.alert(
          "Account Created", 
          "Your account was created, but we couldn't save all your profile information. You can update it later.",
          [{ text: "Continue", onPress: () => router.replace('/student/dashboard') }]
        );
      }
    } catch (authError: any) {
      console.error("Auth error:", authError);
      if (authError.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use a different email or login instead.');
      } else if (authError.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (authError.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else if (authError.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError('Authentication error: ' + authError.message);
      }
      try {
        if (auth.currentUser) {
          await signOut(auth);
        }
      } catch (signOutError) {
        console.error('Error signing out after failed signup:', signOutError);
      }
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
      <Animated.View 
        entering={SlideInRight.delay(200).springify()} 
        style={[styles.decorCircle, styles.decorCircle1]} 
      />
      <Animated.View 
        entering={SlideInRight.delay(300).springify()} 
        style={[styles.decorCircle, styles.decorCircle2]} 
      />
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
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Camera size={30} color="#B8C2FF" />
                  <Text style={styles.imageText}>Upload Photo</Text>
                </View>
              )}
            </TouchableOpacity>
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
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.visibilityToggle}>
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
