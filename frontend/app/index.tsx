// app/index.tsx
import React from 'react';
import { View, Text, Dimensions, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, SlideInRight, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { GraduationCap, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './styles/landing.style';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

export default function WelcomeScreen() {
  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95, { damping: 10 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 10 });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#0A1128', '#1A2980', '#26305C']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View entering={SlideInRight.delay(200).springify()} style={[styles.decorCircle, styles.decorCircle1]} />
        <Animated.View entering={SlideInRight.delay(300).springify()} style={[styles.decorCircle, styles.decorCircle2]} />

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.contentContainer}>
            <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.logoContainer}>
              <LinearGradient
                colors={['#4C63D2', '#66A5FF']}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <GraduationCap size={isTablet ? 140 : 100} color="#FFFFFF" strokeWidth={1.5} />
              </LinearGradient>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.textContainer}>
              <Text style={styles.title}>CampusFlow</Text>
              <Text style={styles.subtitle}>Your Campus Life, Simplified</Text>
              <View style={styles.divider} />
              <Text style={styles.description}>
                Streamline your academic journey with our all-in-one campus management solution
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(900).springify()} style={styles.buttonContainer}>
              <Link href="/signup" asChild>
                <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={0.9}>
                  <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
                    <LinearGradient
                      colors={['#4C63D2', '#5A74E2', '#66A5FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>Get Started</Text>
                      <ChevronRight size={22} color="#FFFFFF" />
                    </LinearGradient>
                  </Animated.View>
                </TouchableOpacity>
              </Link>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(1100).springify()} style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </Link>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(1300).springify()} style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <View style={styles.infoDot} />
                <Text style={styles.infoText}>Secure authentication</Text>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.infoDot} />
                <Text style={styles.infoText}>Real-time updates</Text>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.infoDot} />
                <Text style={styles.infoText}>Campus notifications</Text>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}