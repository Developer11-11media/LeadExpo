import * as Print from "expo-print"; // para imprimir en Android/Web
import * as Sharing from "expo-sharing"; // para compartir en Android
import React, { useRef } from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot"; // para capturar imagen del badge

type TicketData = {
    idticket: number, 
    ticket_number_GlupUp :string,
    firstname: string;
    lastname: string;
    email: string;
    company: string | null;
    position_title: string | null;
    phone_number: string;
    type_ticket: string;
};

export default function TicketBadge({ ticketData }: { ticketData: TicketData }) {
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
                    <View style={styles.topRow}>
                        <Image
                            source={require("../assets/images/nahica.jpeg")}
                            style={styles.leftImage}
                            resizeMode="contain"
                        />
                        <View style={styles.qrContainer}>
                            <QRCode
                                value={JSON.stringify(ticketData)}
                                size={120
                                }
                                backgroundColor="white"
                                color="black"
                            />
                        </View>
                    </View>

                    {/* Datos centrados con espacios */}
                    <Text style={styles.name}>{ticketData.firstname + " " + ticketData.lastname}</Text>
                    <View style={{ height: 35 }} />
                    <Text style={styles.company}>{ticketData.company}</Text>
                    <View style={{ height: 25 }} />
                    <Text style={styles.position}>{ticketData.position_title}</Text>
                    <View style={{ height: 25 }} />
                    <Text style={styles.type}>{ticketData.type_ticket}</Text>
                    <View style={{ height: 15 }} />

                    {/* Línea divisoria */}
                    <View style={styles.divider} />

                    {/* Imagen final centrada */}
                    <Image
                       source={require("../assets/images/Sponsors-01-01.png")}
                        style={styles.bottomImageback}
                        resizeMode="contain"
                    />

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
    qrContainer: {
        alignItems: "center",
        justifyContent: "center",
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
});

