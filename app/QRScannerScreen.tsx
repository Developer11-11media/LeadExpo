import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { GetTicketFromExcel, validateProspect } from "../services/functionsDB";

interface QRScannerScreenProps {
  onQRScanned?: (data: string) => void;
  onManualEntry?: () => void;
  onBack?: () => void;
  exhibitorName?: string;
}

const { width, height } = Dimensions.get('window');
const scannerSize = width * 0.75;
const router = useRouter();
const QRScannerScreen: React.FC<QRScannerScreenProps> = ({
  onQRScanned,
  onManualEntry,
  onBack,
  exhibitorName = "11/Media LLC"
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showmodalmanual, setShowshowmodalmanual] = useState(false);
  const [ticketInput, setTicketInput] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [loading, setLoading] = useState(false);
  // Definir la función fuera para poder reutilizarla
  const getCameraPermissions = async () => {
    try {
      //console.log('📷 Requesting camera permissions...');
      const { status } = await Camera.requestCameraPermissionsAsync();
      //console.log('📷 Camera permission status:', status);
      setHasPermission(status === 'granted');

      if (status !== 'granted') {
        console.warn('📷 Camera permission denied');
      }
    } catch (error) {
      console.error('📷 Error requesting camera permissions:', error);
      setHasPermission(false);
    }
  };

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const handlesearch = async () => {
    if (!ticketInput.trim()) {
      setErrors({ ticket: "Ingresa un ticket" });
      return;
    }
    try {
    const searchticket = await GetTicketFromExcel(ticketInput);

    const hasValidName = (searchticket.firstname || searchticket.lastname) &&
      ((searchticket.firstname?.trim().length || 0) > 0 || (searchticket.lastname?.trim().length || 0) > 0);
    const hasValidEmail = searchticket.email && searchticket.email.includes('@');

    if (!hasValidName && !hasValidEmail) {

      if (Platform.OS === 'web') {
        window.alert('El código QR no contiene información suficiente (nombre o email). Intenta con un QR que contenga datos de contacto.');
      } else {
        Alert.alert('QR Insuficiente', 'El código QR no contiene información suficiente (nombre o email). Intenta con un QR que contenga datos de contacto.');
      }
      return;
    }
    // Verificar si el prospecto ya existe (solo si tenemos email o teléfono)
    if (searchticket.email || searchticket.phone) {
      const existingProspects = await validateProspect(searchticket.email, searchticket.phone);

      if (existingProspects.exists) {
        const p = existingProspects.prospect;
        const existingName = `${p.firstname || ""} ${p.lastname || ""}`.trim();

        if (Platform.OS === 'web') {
          if (window.confirm(`Este prospecto ya está registrado: ${existingName}\n\n¿Quieres ver los detalles?`)) {
            router.push({
              pathname: '/prospect-detail',
              params: { prospectId: existingProspects.id }
            });
          }
        } else {
          Alert.alert(
            'Prospecto Existente',
            `Este prospecto ya está registrado: ${existingName}`,
            [
              {
                text: 'Ver Detalles', onPress: () => {
                  router.push({
                    pathname: '/prospect-detail',
                    params: { prospectId: existingProspects.id }
                  });
                }
              },
              { text: 'Cancelar', style: 'cancel' }
            ]
          );
        }

        return;
      }
    }

    //Hacemos QR
    router.push({
      pathname: "/PreviewBadge.modal",
      params: {
        idticket: 0,
        ticket_number_GlupUp: ticketInput,
        firstname: searchticket.firstname,
        lastname: searchticket.lastname,
        email: searchticket.email,
        company: searchticket.company,
        position_title: searchticket.employee,
        phone_number: searchticket.phone,
        type_ticket: searchticket.type_ticket,
      },
    });
    setShowshowmodalmanual(false);
    } catch (err) {
    console.error(err);
    alert("Error al buscar el ticket");
  } finally {
    setLoading(false);
  }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    //console.log('Detecta el QR');
    if (!scanned) {
      setScanned(true);
      onQRScanned?.(data);

      // Reset scanner after a delay
      setTimeout(() => {
        setScanned(false);
      }, 2000);
    }
  };

  const handleFlip = () => {
    // Toggle between front and back camera if needed
    // This would require additional state management for camera type
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={() => getCameraPermissions()}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="scan-outline" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{exhibitorName}</Text>
            <Text style={styles.headerSubtitle}>Scan QR</Text>
          </View>

          <TouchableOpacity style={styles.flashButton}>
            <Ionicons name="flash" size={20} color="#7c3aed" />
          </TouchableOpacity>
        </View>

        {/* Camera View */}
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onCameraReady={() => {
              console.log('📷 Camera ready');
              setIsCameraReady(true);
            }}
            onMountError={(error) => {
              console.error('📷 Camera mount error:', error);
            }}
          />

          {/* Loading indicator while camera initializes */}
          {!isCameraReady && (
            <View style={styles.cameraLoading}>
              <Text style={styles.loadingText}>Iniciando cámara...</Text>
            </View>
          )}

          {/* Scanner Overlay */}
          <View style={styles.overlay}>
            {/* Top Overlay */}
            <View style={styles.overlayTop} />

            {/* Middle Section with Scanner Frame */}
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />

              {/* Scanner Frame */}
              <View style={styles.scannerFrame}>
                <View style={styles.scannerInner}>
                  {/* Corner Indicators */}
                  <View style={[styles.corner, styles.cornerTopLeft]} />
                  <View style={[styles.corner, styles.cornerTopRight]} />
                  <View style={[styles.corner, styles.cornerBottomLeft]} />
                  <View style={[styles.corner, styles.cornerBottomRight]} />

                  {/* Centro completamente transparente para no tapar la cámara */}
                </View>
              </View>

              <View style={styles.overlaySide} />
            </View>

            {/* Bottom Overlay */}
            <View style={styles.overlayBottom} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Align the QR code within the frame to scan automatically.
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={handleFlip} style={styles.controlButton}>
            <Ionicons name="camera-reverse-outline" size={24} color="white" />
            <Text style={styles.controlButtonText}>Flip</Text>
          </TouchableOpacity>
        </View>

        {/* Manual Entry Button */}
        <TouchableOpacity onPress={() => setShowshowmodalmanual(true)} style={styles.manualButton}>
          <LinearGradient
            colors={['#7c3aed', '#a855f7']}
            style={styles.manualButtonGradient}
          >
            <Text style={styles.manualButtonText}>Enter ID manually</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
      <Modal visible={showmodalmanual} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ingresar Ticket o Correo</Text>

            {/* Campo único para ticket o correo */}
            <View style={{ marginBottom: 12 }}>
              <View
                style={[
                  styles.inputWrapper,
                  errors["ticket"] ? { borderColor: "#ef4444" } : null,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#8b9dc3"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ticket"
                  placeholderTextColor="#666"
                  value={ticketInput}
                  onChangeText={(text) => setTicketInput(text)}
                  autoCapitalize="none"
                />
              </View>
              {errors["ticket"] && (
                <Text style={styles.errorText}>{errors["ticket"]}</Text>
              )}
            </View>

            <View style={styles.modalButtons}>
              {/* Cancelar */}
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowshowmodalmanual(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              {/* Confirmar / Buscar */}
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handlesearch}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#7c3aed", "#a855f7"]}
                  style={styles.saveButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.modalButtonText}>Confirmar</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8b9dc3',
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 35, 0.8)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: scannerSize,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 35, 0.8)',
  },
  scannerFrame: {
    width: scannerSize,
    height: scannerSize,
  },
  scannerInner: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 17,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#ffffff',
    borderWidth: 4,
    backgroundColor: 'transparent',
  },
  cornerTopLeft: {
    top: 10,
    left: 10,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 10,
  },
  cornerTopRight: {
    top: 10,
    right: 10,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 10,
  },
  cornerBottomLeft: {
    bottom: 10,
    left: 10,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
  },
  cornerBottomRight: {
    bottom: 10,
    right: 10,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 10,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 35, 0.8)',
  },
  instructions: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#8b9dc3',
    textAlign: 'center',
    lineHeight: 24,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  controlButton: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  manualButton: {
    marginHorizontal: 32,
    marginBottom: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  manualButtonGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e2139",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2d3561",
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: "white",
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  cancelButton: {
    backgroundColor: "#2d3561",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: "#7c3aed",
  },
});

export default QRScannerScreen;