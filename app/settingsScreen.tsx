import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { getexhibitors, registeraccounts, registeraexhibitor } from "../services/functionsDB";

export default function SettingsPage() {
  const [showAddExhibitor, setShowAddExhibitor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});

  const [exhibitor, setExhibitor] = useState({
    company_name: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    industry: "",
  });

  //Function Modal Register Exhibitor
  const validateFields = async () => {
    let tempErrors: { [key: string]: string } = {};
    const listexhibitors = await getexhibitors();
    
    if (!exhibitor.company_name.trim()) {
      tempErrors.company_name = "Company name is required";
    } else {
      // 🔹 Validar si ya existe en la lista de exhibitors
      const exists = listexhibitors.some(
        e => e.name.toLowerCase() === exhibitor.company_name.trim().toLowerCase()
      );

      if (exists) {
        tempErrors.company_name = "This company already exists";
      }
    }

    if (!exhibitor.first_name.trim())
      tempErrors.first_name = "First name is required";
    if (!exhibitor.last_name.trim())
      tempErrors.last_name = "Last name is required";

    if (!exhibitor.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(exhibitor.email)) {
      tempErrors.email = "Invalid email format";
    }

    if (exhibitor.phone && !/^[0-9+\-()\s]+$/.test(exhibitor.phone)) {
      tempErrors.phone = "Invalid phone number";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!(await validateFields())) return;
      try {
        setLoading(true);
        //Insert from db
        await registeraexhibitor(exhibitor.company_name, exhibitor.first_name, exhibitor.last_name, exhibitor.phone, exhibitor.address,
          exhibitor.website, exhibitor.industry
        );
        //Clear Modal 
        setExhibitor({
          company_name: "",
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          address: "",
          website: "",
          industry: "",
        });
        setErrors({});
      } catch (err) {
        console.error("Error saving exhibitor:", err);
      } finally {
        setLoading(false);
      }
    };

    const handleChange = (key: string, value: string) => {
      setExhibitor({ ...exhibitor, [key]: value });
      if (errors[key]) {
        setErrors({ ...errors, [key]: "" });
      }
    };

    interface RegisterData {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
      exhibitor: string;
      role: "ADMIN" | "USER";
    }

    const [accountForm, setAccountForm] = useState({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "",
      exhibitor_id: 0,
      exhibitor_name: "",
    });

    const validateForm = () => {
      const newErrors: Partial<Record<keyof RegisterData, string>> = {};

      if (!accountForm.first_name.trim()) newErrors.first_name = "First Name is required";
      if (!accountForm.last_name.trim()) newErrors.last_name = "Last Name is required";

      if (!accountForm.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(accountForm.email)) {
        newErrors.email = "Invalid email format";
      }
      if (accountForm.role.toLowerCase() === "user") {
        if (!accountForm.exhibitor_name.trim()) {
          newErrors.exhibitor = "Exhibitor company is required for users";
        }
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const [showCreateAccount, setShowCreateAccount] = useState(false);
    const [exhibitorError, setExhibitorError] = useState("");
    const [exhibitorValid, setExhibitorValid] = useState(false);

    const handleAccountChange = (field: string, value: string) => {
      setAccountForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleExhibitorValidation = async (text: string) => {
      setAccountForm((prev) => ({ ...prev, exhibitor_name: text }));

      if (!text.trim()) {
        setExhibitorError("Exhibitor is required");
        setExhibitorValid(false);
        setAccountForm((prev) => ({ ...prev, exhibitor_id: 0 })); // solo limpia el id
        return;
      }

      try {

        const validExhibitors = await getexhibitors();
        // buscar coincidencia exacta o parcial
        const exhibitorinput = validExhibitors.find((e) =>
          e.name.toLowerCase().includes(text.trim().toLowerCase())
        );

        if (exhibitorinput) {

          setExhibitorError("");
          setExhibitorValid(true);

          setAccountForm((prev) => ({
            ...prev,
            exhibitor_id: exhibitorinput.id,
          }));

        } else {
          setExhibitorError("Exhibitor not found"); //muestra error
          setExhibitorValid(false);
          setAccountForm((prev) => ({
            ...prev,
            exhibitor_id: 0, // solo limpia el ID
          }));
        }
      } catch (error) {
        setExhibitorError("Error validating exhibitor");
        setExhibitorValid(false);
        setAccountForm((prev) => ({ ...prev, exhibitor_id: 0 }));
      }
    };





    const handleCreateAccount = async () => {
      if (!validateForm()) return;
      setLoading(true);
      try {
        await registeraccounts(accountForm.first_name, accountForm.last_name, accountForm.email, accountForm.password, accountForm.role, accountForm.exhibitor_id);
      } catch (err) {
        console.error("Register error:", err);
      } finally {
        setLoading(false);
        //Limpio el formulario
        setAccountForm({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          role: "",
          exhibitor_id: 0,
          exhibitor_name: "",
        });
        setShowCreateAccount(false);
      }
    };


    return (
      <LinearGradient colors={["#0f0f23", "#1a1a2e", "#16213e"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Choose an administrative option below:</Text>

            {/* Cards */}
            <View style={styles.cardGrid}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => setShowAddExhibitor(true)}
              >
                <Ionicons
                  name="business-outline"
                  size={28}
                  color="#a855f7"
                  style={{ marginBottom: 10 }}
                />
                <Text style={styles.cardTitle}>Add Exhibitor</Text>
                <Text style={styles.cardText}>Register a new exhibiting company.</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.card} onPress={() => setShowCreateAccount(true)}>
                <Ionicons
                  name="person-add-outline"
                  size={28}
                  color="#a855f7"
                  style={{ marginBottom: 10 }}
                />
                <Text style={styles.cardTitle}>Create Accounts</Text>
                <Text style={styles.cardText}>Manage user and admin accounts.</Text>
              </TouchableOpacity>
            </View>

            {/* Add Exhibitor Modal */}
            <Modal visible={showAddExhibitor} animationType="slide" transparent>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>New Exhibitor</Text>

                  {[
                    { key: "company_name", placeholder: "Company Name", icon: "business-outline" },
                    { key: "address", placeholder: "Address", icon: "location-outline" },
                    { key: "website", placeholder: "Website", icon: "globe-outline" },
                    { key: "industry", placeholder: "Industry", icon: "briefcase-outline" },
                    { key: "first_name", placeholder: "Contact First Name", icon: "person-outline" },
                    { key: "last_name", placeholder: "Contact Last Name", icon: "person-outline" },
                    { key: "email", placeholder: "Contact Email", icon: "mail-outline" },
                    { key: "phone", placeholder: "Phone Number", icon: "call-outline" },

                  ].map((field) => (
                    <View key={field.key} style={{ marginBottom: 12 }}>
                      <View
                        style={[
                          styles.inputWrapper,
                          errors[field.key] ? { borderColor: "#ef4444" } : null,
                        ]}
                      >
                        <Ionicons
                          name={field.icon as any}
                          size={20}
                          color="#8b9dc3"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder={field.placeholder}
                          placeholderTextColor="#666"
                          value={(exhibitor as any)[field.key]}
                          onChangeText={(text) => handleChange(field.key, text)}
                        />
                      </View>
                      {errors[field.key] && (
                        <Text style={styles.errorText}>{errors[field.key]}</Text>
                      )}
                    </View>
                  ))}

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setShowAddExhibitor(false)}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.saveButton]}
                      onPress={handleAdd}
                      disabled={loading}
                    >
                      <LinearGradient
                        colors={["#7c3aed", "#a855f7"]}
                        style={styles.saveButtonGradient}
                      >
                        {loading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text style={styles.modalButtonText}>Save</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Modal Create Account */}
            <Modal visible={showCreateAccount} animationType="slide" transparent>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Create Account</Text>

                  {[
                    { key: "first_name", placeholder: "First Name", icon: "person-outline" },
                    { key: "last_name", placeholder: "Last Name", icon: "person-outline" },
                    { key: "email", placeholder: "Email", icon: "mail-outline" },
                    { key: "password", placeholder: "Password", icon: "lock-closed-outline", secure: true },
                    { key: "confirmPassword", placeholder: "Confirm Password", icon: "lock-closed-outline", secure: true },
                  ].map((field) => (
                    <View key={field.key} style={{ marginBottom: 12 }}>
                      <View
                        style={[
                          styles.inputWrapper,
                          errors[field.key] ? { borderColor: "#ef4444" } : null,
                        ]}
                      >
                        <Ionicons
                          name={field.icon as any}
                          size={20}
                          color="#8b9dc3"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder={field.placeholder}
                          placeholderTextColor="#666"
                          secureTextEntry={field.secure}
                          value={(accountForm as any)[field.key]}
                          onChangeText={(text) => handleAccountChange(field.key, text)}
                        />
                      </View>
                      {errors[field.key] && (
                        <Text style={styles.errorText}>{errors[field.key]}</Text>
                      )}
                    </View>
                  ))}

                  {/* --- Rol Checkbox --- */}
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        setAccountForm((prev) => ({ ...prev, role: "ADMIN" }))
                      }
                    >
                      <Ionicons
                        name={
                          accountForm.role === "ADMIN"
                            ? "checkbox-outline"
                            : "square-outline"
                        }
                        size={22}
                        color="#7c3aed"
                      />
                      <Text style={styles.checkboxLabel}>Admin</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        setAccountForm((prev) => ({ ...prev, role: "USER" }))
                      }
                    >
                      <Ionicons
                        name={
                          accountForm.role === "USER"
                            ? "checkbox-outline"
                            : "square-outline"
                        }
                        size={22}
                        color="#7c3aed"
                      />
                      <Text style={styles.checkboxLabel}>User</Text>
                    </TouchableOpacity>
                  </View>

                  {/* --- Exhibitor Field --- */}
                  {accountForm.role.toLowerCase() === "user" && (
                    <View style={{ marginBottom: 12 }}>
                      <View
                        style={[
                          styles.inputWrapper,
                          exhibitorError ? { borderColor: "#ef4444" } : null,
                        ]}
                      >
                        <Ionicons
                          name="business-outline"
                          size={20}
                          color="#8b9dc3"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Exhibitor Company"
                          placeholderTextColor="#666"
                          value={accountForm.exhibitor_name}
                          onChangeText={(text) => handleExhibitorValidation(text)}
                          autoCapitalize="words"
                        />
                      </View>
                      {exhibitorError ? (
                        <Text style={styles.errorText}>{exhibitorError}</Text>
                      ) : exhibitorValid ? (
                        <Text style={{ color: "#10b981", fontSize: 12, marginLeft: 4 }}>
                          ✅ Exhibitor found
                        </Text>
                      ) : null}
                    </View>
                  )}


                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setShowCreateAccount(false)}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.saveButton]}
                      onPress={handleCreateAccount}
                      disabled={loading}
                    >
                      <LinearGradient
                        colors={["#7c3aed", "#a855f7"]}
                        style={styles.saveButtonGradient}
                      >
                        {loading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text style={styles.modalButtonText}>Save</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>



          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scrollContainer: {
      padding: 24,
      alignItems: "center",
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: "white",
      marginTop: 40,
    },
    subtitle: {
      fontSize: 16,
      color: "#8b9dc3",
      marginBottom: 30,
      textAlign: "center",
    },
    cardGrid: {
      width: "100%",
      maxWidth: 400,
      gap: 20,
    },
    card: {
      backgroundColor: "#1e2139",
      borderRadius: 16,
      padding: 20,
      borderColor: "#2d3561",
      borderWidth: 1,
    },
    cardTitle: {
      fontSize: 18,
      color: "white",
      fontWeight: "600",
      marginBottom: 6,
    },
    cardText: {
      color: "#8b9dc3",
      fontSize: 14,
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

    checkboxGroup: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
      paddingHorizontal: 8,
    },

    checkboxRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    checkboxLabel: {
      marginLeft: 8,
      fontSize: 16,
      color: "#333",
    },
    inputContainer: {
      width: "100%",
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      color: "#8b9dc3",
      marginBottom: 6,
      fontWeight: "500",
    },
    checkboxContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      marginBottom: 16,
      paddingHorizontal: 4,
    },
  });
