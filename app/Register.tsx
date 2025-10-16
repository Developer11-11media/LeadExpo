import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { RegisterTicketdb } from "../services/functionsDB";

// Importa tu función para guardar en la BD

interface RegisterData {
    firstName: string;
    lastname: string;
    company: string;
    employee: string;
    phone: string;
    email: string;
    ticketType: "GENERAL";
    otherTicket: string;

}

const Register: React.FC = () => {
    const router = useRouter();
    const glob = useGlobalSearchParams();

    const showRole = glob.showRole === "true";

    const [formData, setFormData] = useState<RegisterData>({
        firstName: "",
        lastname: "",
        company: "",
        employee: "",
        phone: "",
        email: "",
        ticketType: "GENERAL",
        otherTicket: "",
    });

    const ticketOptions = [
        { label: "General", value: "GENERAL" },
        { label: "VIP", value: "VIP" },
        { label: "Exhibitor", value: "EXHIBITOR" },
        { label: "Other", value: "OTHER" },
    ];

    const [errors, setErrors] = useState<Partial<Record<keyof RegisterData, string>>>({});
    const [loading, setLoading] = useState(false);

    const updateFormData = (field: keyof RegisterData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: Partial<Record<keyof RegisterData, string>> = {};

        if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";
        if (!formData.lastname.trim()) newErrors.lastname = "Last Name is required";
        if (!formData.company.trim()) newErrors.company = "Company is required";
        if (!formData.employee.trim()) newErrors.employee = "Employee is required";

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{8,15}$/.test(formData.phone)) {
            newErrors.phone = "Invalid phone number";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (validateForm()) {
            // Validación extra para ticket OTHER

            try {
                setLoading(true);

                // Llamada al backend
                await RegisterTicketdb(
                    "",
                    formData.firstName,
                    formData.lastname,
                    formData.email,
                    formData.company,
                    formData.employee,
                    formData.phone,
                    formData.ticketType,
                    "",
                    "Attendee"
                );

                // Aquí ya puedes generar el QR con los datos registrados

                router.push({
                    pathname: "/PreviewBadge.modal",
                    params: {
                        full_name: formData.firstName + " " + formData.lastname,
                        email: formData.email,
                        company: formData.company,
                        position_title: formData.employee,
                        phone_number: formData.phone,
                        type_ticket: formData.ticketType,
                    },
                });


            } catch (error) {
                console.error("Error registering ticket:", error);
                // aquí podrías mostrar un toast o setear un error global
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <LinearGradient
            colors={["#0f0f23", "#1a1a2e", "#16213e"]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Register Ticket</Text>
                            <Text style={styles.subtitle}>
                                Fill the information to create your ticket
                            </Text>
                        </View>

                        {/* Full Name */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Name</Text>

                            <View style={{ flexDirection: "row", gap: 10 }}>
                                {/* First Name */}
                                <View style={[{ flex: 1 }, errors.firstName && styles.inputError]}>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="person-outline" size={20} color="#8b9dc3" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="First name"
                                            placeholderTextColor="#666"
                                            value={formData.firstName}
                                            onChangeText={(text) => updateFormData("firstName", text)}
                                        />
                                    </View>
                                    {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                                </View>

                                {/* Last Name */}
                                <View style={[{ flex: 1 }, errors.lastname && styles.inputError]}>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="person-outline" size={20} color="#8b9dc3" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Last name"
                                            placeholderTextColor="#666"
                                            value={formData.lastname}
                                            onChangeText={(text) => updateFormData("lastname", text)}
                                        />
                                    </View>
                                    {errors.lastname && <Text style={styles.errorText}>{errors.lastname}</Text>}
                                </View>
                            </View>
                        </View>

                        {/* Company */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Company</Text>
                            <View style={[styles.inputWrapper, errors.company && styles.inputError]}>
                                <Ionicons name="business-outline" size={20} color="#8b9dc3" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your company"
                                    placeholderTextColor="#666"
                                    value={formData.company}
                                    onChangeText={(text) => updateFormData("company", text)}
                                />
                            </View>
                            {errors.company && <Text style={styles.errorText}>{errors.company}</Text>}
                        </View>

                        {/* Employee */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Employee</Text>
                            <View style={[styles.inputWrapper, errors.employee && styles.inputError]}>
                                <Ionicons name="id-card-outline" size={20} color="#8b9dc3" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your position"
                                    placeholderTextColor="#666"
                                    value={formData.employee}
                                    onChangeText={(text) => updateFormData("employee", text)}
                                />
                            </View>
                            {errors.employee && <Text style={styles.errorText}>{errors.employee}</Text>}
                        </View>

                        {/* Phone Number */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Phone Number</Text>
                            <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
                                <Ionicons name="call-outline" size={20} color="#8b9dc3" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your phone number"
                                    placeholderTextColor="#666"
                                    keyboardType="phone-pad"
                                    value={formData.phone}
                                    onChangeText={(text) => updateFormData("phone", text)}
                                />
                            </View>
                            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                        </View>

                        {/* Email */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                                <Ionicons name="mail-outline" size={20} color="#8b9dc3" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="name@example.com"
                                    placeholderTextColor="#666"
                                    value={formData.email}
                                    onChangeText={(text) => updateFormData("email", text)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View>
                        <View style={styles.inputContainer}>
                            {/* <Text style={styles.label}>Ticket Type</Text>
                            <View style={styles.radioGroup}>
                                {ticketOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={styles.radioOption}
                                        onPress={() => updateFormData("ticketType", option.value as any)}
                                    >
                                        <Ionicons
                                            name={formData.ticketType === option.value ? "radio-button-on" : "radio-button-off"}
                                            size={20}
                                            color="#a855f7"
                                            style={{ marginRight: 8 }}
                                        />
                                        <Text style={{ color: "white" }}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View> */}

                            {/* 👉 El campo de texto aparece solo si elige "Other" */}
                            {/* {formData.ticketType === "OTHER" && (
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Specify Ticket Type</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter ticket type"
                                        placeholderTextColor="#666"
                                        value={formData.otherTicket}
                                        onChangeText={(text) => updateFormData("otherTicket", text)}
                                    />
                                </View>
                            )} */}
                        </View>

                        {/* Botón */}
                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={["#7c3aed", "#a855f7"]}
                                style={styles.registerButtonGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.registerButtonText}>Register</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scrollView: { flex: 1 },
    content: { paddingHorizontal: 32, paddingVertical: 24 },
    header: { alignItems: "center", marginBottom: 32, paddingTop: 32 },
    title: { fontSize: 32, fontWeight: "bold", color: "white", marginBottom: 8 },
    subtitle: { fontSize: 16, color: "#8b9dc3", textAlign: "center", lineHeight: 24 },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 14, color: "#8b9dc3", marginBottom: 8, fontWeight: "500" },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1e2139",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#2d3561",
    },
    inputError: { borderColor: "#ef4444" },
    inputIcon: { marginLeft: 16, marginRight: 12 },
    input: { flex: 1, height: 56, fontSize: 16, color: "white" },
    errorText: { color: "#ef4444", fontSize: 12, marginTop: 4, marginLeft: 4 },
    registerButton: { marginTop: 8, borderRadius: 12, overflow: "hidden" },
    registerButtonGradient: { height: 56, alignItems: "center", justifyContent: "center" },
    registerButtonText: { color: "white", fontSize: 18, fontWeight: "600" },
    radioGroup: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
        marginTop: 8,
    },
    radioOption: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
});

export default Register;