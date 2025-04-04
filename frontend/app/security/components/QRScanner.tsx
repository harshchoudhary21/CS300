// CameraScanner.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

interface BarcodeScanningResult {
  type: string;
  data: string;
}

interface CameraScannerProps {
  visible: boolean;
  onClose: () => void;
  onBarcodeScanned: (result: BarcodeScanningResult) => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ visible, onClose, onBarcodeScanned }) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleBarcodeScanned = (scanningResult: BarcodeScanningResult) => {
    // Pass the scanned result to the parent component
    onBarcodeScanned(scanningResult);
    // Close the camera after successful scan
    onClose();
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={requestPermission}
        >
          <Text style={styles.actionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      >
        <View style={styles.cameraButtonContainer}>
          <TouchableOpacity 
            style={styles.cameraButton}
            onPress={toggleCameraFacing}
          >
            <Text style={styles.cameraButtonText}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cameraButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cameraButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#FFFFFF',
  },
  actionButton: {
    backgroundColor: '#66A5FF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cameraButton: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  cameraButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 83, 83, 0.8)',
  },
});

export default CameraScanner;