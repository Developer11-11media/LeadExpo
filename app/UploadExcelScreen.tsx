import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Button, FlatList, Platform, Text, View } from "react-native";
import * as XLSX from "xlsx";
import { registerExcelData } from "../services/functionsDB";
interface ExcelRow {
    [key: string]: any;
}

function excelDateToJSDate(serial: number): string | null {
    if (!serial) return null;
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    const fractional_day = serial - Math.floor(serial) + 0.0000001;
    let total_seconds = Math.floor(86400 * fractional_day);

    const seconds = total_seconds % 60;
    total_seconds -= seconds;
    const hours = Math.floor(total_seconds / 3600);
    const minutes = Math.floor(total_seconds / 60) % 60;

    date_info.setHours(hours);
    date_info.setMinutes(minutes);
    date_info.setSeconds(seconds);

    return date_info.toISOString().slice(0, 19).replace("T", " ");
}


export default function UploadExcelScreen() {
    const [data, setData] = useState<ExcelRow[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Seleccionar archivo Excel
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/vnd.ms-excel",
                ],
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                if (Platform.OS === 'web') {
                    window.alert(
                        'No seleccionaste ningún archivo '
                    );
                } else {
                    Alert.alert(
                        'Cancelado',
                        'No seleccionaste ningún archivo.'
                    );
                }
                return;
            }

            const file = result.assets[0];
            const response = await fetch(file.uri);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();

            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
            setData(jsonData);
            if (Platform.OS === 'web') {
                window.alert(
                    'Archivo leído correctamente'
                );
            } else {
                Alert.alert(
                    'Éxito',
                    'Archivo leído correctamente'
                );
            }
        } catch (error) {
            console.error("Error leyendo Excel:", error);
        }
    };

    // Subir los datos al servidor (MySQL)
    const uploadToServer = async () => {
        if (data.length === 0) {
            if (Platform.OS === 'web') {
                window.alert(
                    'Primero selecciona un archivo Excel'
                );
            } else {
                Alert.alert(
                    'Sin datos',
                    'Primero selecciona un archivo Excel'
                );
            }
            return;
        }

        try {
            setLoading(true);
            const mappedData = data.map((row) => ({
                ticket_id: row["Ticket ID #"] || null,
                contact_id: row["Contact ID #"] || null,
                first_name: row["First Name"] || null,
                last_name: row["Last Name"] || null,
                company: row["Company"] || null,
                title: row["Title/Position"] || null,
                email: row["Email"] || null,
                phone: row["Phone"] || null,
                category: row["Category"] || null,
                internal_note: "", // no viene en tu JSON, puedes poner null
                internal_group: row["Ticket Name"] || null,
                ticket_name: row["Price Option"] || null,
                price_option: row["Price Option"] || null,
                registration_id: row["Registration ID #"] || null,
                registration_date: excelDateToJSDate(row["Registration Date (GMT-5 Central)"]),
                reg_contact_first_name: row["Registration Contact First Name"] || null,
                reg_contact_last_name: row["Registration Contact Last Name"] || null,
                reg_contact_email: row["Registration Contact Email"] || null,
                reg_contact_phone: row["Registration Contact Phone"] || null,
            }));


            const responseExcel = await registerExcelData(mappedData);

            
            if (responseExcel.inserted > 0) {
                if (Platform.OS === 'web') {
                    window.alert(
                        responseExcel.message || "Datos insertados correctamente"
                    );
                } else {
                    Alert.alert(
                        'Éxito',
                        responseExcel.message || "Datos insertados correctamente"
                    );
                }
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error("Error al enviar al servidor:", error);
        }
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Button title="Seleccionar Excel" onPress={pickDocument} />
            <View style={{ marginVertical: 10 }}>
                <Button title="Procesar y subir a MySQL" onPress={uploadToServer} />
            </View>

            {loading && <ActivityIndicator size="large" />}

            {data.length > 0 && (
                <FlatList
                    data={data}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View
                            style={{
                                padding: 10,
                                borderBottomWidth: 1,
                                borderColor: "#000000ff",
                            }}
                        >
                            <Text style={{ color: 'white' }}>{JSON.stringify(item)}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}