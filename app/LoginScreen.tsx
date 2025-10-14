import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image } from 'react-native';
import { User, UserContext } from "../services/UserContext";

import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View, useWindowDimensions
} from 'react-native';
import { login } from "../services/authService";

interface LoginScreenProps {
  onLogin?: (email: string, password: string) => void;
  onForgotPassword?: () => void;
  onNavigateToRegister?: () => void;
  isLoading?: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onForgotPassword,
  onNavigateToRegister,
  isLoading = false,
}) => {
  const { t, i18n } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { saveUser } = useContext(UserContext);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = t('errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('errors.emailInvalid');

    if (!password) newErrors.password = t('errors.passwordRequired');
    else if (password.length < 6) newErrors.password = t('errors.passwordShort');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm() && onLogin) {
      try {
        const logindata = await login(email.trim(), password);

        const user: User = logindata.user;

        if (user) {
          await AsyncStorage.setItem("user", JSON.stringify(user));
          await saveUser(user);

        }

        onLogin(email.trim(), password);

      } catch (error: any) {
        setErrors({ password: error.message || "Usuario o contraseña incorrectos" });
      }
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const { width } = useWindowDimensions();
  const mostrarImagen = width > 768;

  useEffect(() => {
    Font.loadAsync({
      ...Ionicons.font,
      "Ionicons": "/fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf",
    });
  }, []);

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>


        <View style={[styles.content, !mostrarImagen && styles.centered]}>
          {width > 768 && (
            <View style={{ flex: 2 }}>

              <Image
                className="imagen-responsive"
                source={require("../assets/images/connect.jpg")}
                style={styles.Image}
                resizeMode="cover"
              />

            </View>
          )}
          <View style={[styles.rightPane, !mostrarImagen && styles.centeredPane]}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('login.welcome')}</Text>
              <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
            </View>



            {/* FORMULARIO */}
            <View style={styles.form}>
              {/* EMAIL */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('login.email')}</Text>
                <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                  <Ionicons name="mail-outline" size={20} color="#8b9dc3" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* PASSWORD */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('login.password')}</Text>
                <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#8b9dc3" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#8b9dc3" />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* LOGIN BUTTON */}
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
                <LinearGradient colors={['#7c3aed', '#a855f7']} style={styles.loginButtonGradient}>
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.loginButtonText}>{t('login.button')}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* <TouchableOpacity onPress={onForgotPassword} style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>{t('login.forgot')}</Text>
            </TouchableOpacity>
            */}
            </View>

            {/* FOOTER 
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('login.noAccount')} </Text>
            <TouchableOpacity onPress={onNavigateToRegister}>
              <Text style={styles.signUpText}>{t('login.signup')}</Text>
            </TouchableOpacity>
          </View>
         */}
            {/* CAMBIO DE IDIOMA */}
            <TouchableOpacity onPress={toggleLanguage} style={{ marginTop: 20, alignSelf: 'center' }}>
              <Text style={{ color: '#a855f7' }}>
                {i18n.language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

// (Estilos los dejo igual)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row', // lado por lado
    width: '100%',
    height: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8b9dc3',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#8b9dc3',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2139',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d3561',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: 'white',
  },
  eyeIcon: {
    padding: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginButtonGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  forgotPasswordText: {
    color: '#8b9dc3',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#8b9dc3',
    fontSize: 16,
  },
  signUpText: {
    color: '#a855f7',
    fontSize: 16,
    fontWeight: '600',
  },
  Image: {
    flex: 2,
    width: '100%',
    height: '100%',
  },
  rightPane: {
    flex: 1, // ocupa parte del espacio junto con la imagen
    padding: 20,
    justifyContent: 'center',
    // Agrega esto:
    minWidth: 320, // (Opcional: un mínimo para el formulario en móvil/pequeño)
  },
  centeredPane: {
    // Cuando no mostramos la imagen, este panel usa todo el espacio.
    flex: 1,
    width: '100%', // <--- ¡Esta es la clave!
    justifyContent: 'center', // central vertical
    alignItems: 'center', // <--- ¡Esto es para centrar horizontalmente el contenido (header, form)!
    maxWidth: 450, // (Opcional: Limita el ancho del formulario en pantallas gigantes)
    alignSelf: 'center', // <--- ¡Esta es la otra clave! Lo centra en el centro del `content`
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default LoginScreen;