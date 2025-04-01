import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import styles from '../../styles/dashboard.style';

interface QRCodeCardProps {
  userData?: any;
}

export default function QRCodeCard({ userData }: QRCodeCardProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [qrValue, setQrValue] = useState('');

  // Generate QR code data whenever userData changes or when refreshed
  useEffect(() => {
    generateQrData();
  }, [userData]);

  // Function to generate QR code data with current timestamp
  const generateQrData = () => {
    if (!userData) return;

    // Create a data object to encode in the QR code
    const qrData = {
      id: userData.id || '',
      name: userData.name || '',
      rollNumber: userData.rollNumber || '',
      email: userData.email || '',
      timestamp: new Date().toISOString(),
    };

    // Convert to JSON string
    setQrValue(JSON.stringify(qrData));
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      generateQrData();
      setRefreshing(false);
    }, 800);
  };

  // If no user data, show a message
  if (!userData) {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your ID</Text>
        <Text style={[styles.placeholderText, { padding: 20 }]}>
          User data not available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Your ID</Text>
      <View style={styles.qrContainer}>
        {refreshing ? (
          <View style={styles.qrLoadingContainer}>
            <ActivityIndicator size="large" color="#4C63D2" />
            <Text style={styles.qrLoadingText}>Generating new QR code...</Text>
          </View>
        ) : (
          <View style={styles.qrWrapper}>
            {qrValue ? (
              <QRCode
                value={qrValue}
                size={200}
                color="#1A2980"
                backgroundColor="white"
                logoBackgroundColor="white"
              />
            ) : (
              <ActivityIndicator size="small" color="#4C63D2" />
            )}
          </View>
        )}
        
        <View style={styles.qrInfo}>
          <Text style={styles.qrInfoText}>
            Name: {userData.name}
          </Text>
          <Text style={styles.qrInfoText}>
            Roll Number: {userData.rollNumber}
          </Text>
          <Text style={styles.qrInfoText}>
            Last Updated: {new Date().toLocaleTimeString()}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Refresh QR Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}