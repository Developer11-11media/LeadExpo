
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import '../language/i18n';
import { UserProvider } from '../services/UserContext';
import './estilesite.css';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <UserProvider>
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: '#1e1e1e',
              paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
            }}
          >
            <Stack>
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
               <Stack.Screen name="SimpleQRScanner" options={{ headerShown: false }} />
              {/* Rutas normales */}
               {/* Modales flotantes */}
              <Stack.Screen
                name="modal"
                options={{ presentation: 'modal', headerShown: false }}
              />
              <Stack.Screen
                name="PreviewBadge.modal"
                options={{ presentation: 'modal', headerShown: false }}
              />
              <Slot />
            </Stack>
          </SafeAreaView>
        </UserProvider>
      </SafeAreaProvider>
      <StatusBar backgroundColor="transparent" style="auto" />
    </ThemeProvider>
  );
}

