import * as Print from "expo-print"; // para imprimir en Android/Web
import * as Sharing from "expo-sharing"; // para compartir en Android
import React, { useRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot"; // para capturar imagen del badge

type TicketData = {
    idticket: number,
    ticket_number_GlupUp: string,
    firstname: string;
    lastname: string;
    email: string;
    company: string | null;
    position_title: string | null;
    phone_number: string;
    type_ticket: string;
};

export default function TicketRegister({ ticketData }: { ticketData: TicketData }) {
    const viewRef = useRef(null);

    const handlePrint = async () => {
        if (viewRef.current) {
            try {
                // Capturar el badge como imagen
                const uri = await (viewRef.current as any).capture();

                if (Platform.OS === "web") {
                    // En Web mandamos directo a impresión
                    await Print.printAsync({ uri });
                } else {
                    // En Android puedes compartir o imprimir
                    if (await Sharing.isAvailableAsync()) {
                        await Sharing.shareAsync(uri);
                    } else {
                        await Print.printAsync({ uri });
                    }
                }
            } catch (err) {
                console.error("Error imprimiendo badge:", err);
            }
        }
    };

    return (
        <View style={styles.container}>
            <ViewShot ref={viewRef} options={{ format: "png", quality: 1.0 }}>
                <View style={styles.badge}>
                    {/* Encabezado */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome</Text>
                        <Text style={styles.subtitle}>Your registration has been successful</Text>
                    </View>

                    <View style={{ height: 30 }} />

                    {/* Contenedor del QR */}
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={JSON.stringify(ticketData.email)}
                            size={160}
                            backgroundColor="white"
                            color="black"
                        />
                    </View>

                    <View style={{ height: 20 }} />

                    {/* Instrucción final */}
                    <Text style={styles.instructions}>
                       Please present this code at registration
                    </Text>
                </View>
            </ViewShot>
        </View>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        width: 320,       // ancho fijo
        height: "auto",   // alto se ajusta al contenido
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 16,
        alignItems: "center",
    },
    qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 12,
    elevation: 3, // para Android
    shadowColor: "#000", // para iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    badge: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        width: 300,
        borderWidth: 2,          // grosor del marco
        borderColor: "black",
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: 16,
    },
    leftImage: {
        width: 130,
        height: 100,
    },
    name: {
        fontSize: 25,
        fontWeight: "bold",
        textAlign: "center",
    },
    company: {
        fontSize: 16,
        textAlign: "center",
    },
    position: {
        fontSize: 16,
        textAlign: "center",
    },
    type: {
        fontSize: 16,
        textAlign: "center",
    },
    divider: {
        height: 2,
        backgroundColor: "black",
        width: "100%",
        marginVertical: 12,
    },
    bottomImage: {
        width: 120,
        height: 120,
        marginTop: 12,
    },
    bottomImageback: {
        width: 260,
        height: 120,
        marginTop: 5,
    },
    
  header: {
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginTop: 5,
  },
  instructions: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginTop: 10,
  },
  
});

