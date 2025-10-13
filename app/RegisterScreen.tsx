import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CreateAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
}

export default function CreateAccountModal({ visible, onClose }: CreateAccountModalProps) {
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      //await register(formData.name, formData.email, formData.password, formData.role, "1");
      onClose();
    } catch (err) {
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={["#0f0f23", "#1a1a2e", "#16213e"]}
            style={styles.gradientBackground}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Create Account</Text>

              {/* Full Name */}
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#8b9dc3" style={styles.icon} />
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#666"
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

              {/* Email */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#8b9dc3" style={styles.icon} />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#666"
                  style={styles.input}
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              {/* Role */}
              <View style={styles.inputContainer}>
                <Ionicons name="shield-outline" size={20} color="#8b9dc3" style={styles.icon} />
                <Picker
                  selectedValue={formData.role}
                  style={styles.picker}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as "ADMIN" | "USER" })
                  }
                >
                  <Picker.Item label="User" value="USER" />
                  <Picker.Item label="Admin" value="ADMIN" />
                </Picker>
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#8b9dc3" style={styles.icon} />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#666"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#8b9dc3"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#8b9dc3" style={styles.icon} />
                <TextInput
                  placeholder="Confirm Password"
                  placeholderTextColor="#666"
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#8b9dc3"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.saveButtonregister]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={["#7c3aed", "#a855f7"]}
                    style={styles.saveButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.buttonText}>Create</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    borderRadius: 16,
    overflow: "hidden",
    maxHeight: "90%",
  },
  gradientBackground: {
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e2139",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2d3561",
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: "white",
    height: 48,
  },
  picker: {
    flex: 1,
    color: "white",
  },
  icon: {
    marginRight: 10,
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
  cancel: {
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },
  saveButtonGradient: {
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  saveButtonregister: {
  backgroundColor: "#7c3aed",
},
});
