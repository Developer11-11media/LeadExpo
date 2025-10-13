import { Stack } from "expo-router";
import { Platform, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { UserProvider } from "../services/UserContext";

export default function App() {
  return (
    <SafeAreaProvider>

      <SafeAreaView
        style={{
          flex: 1,
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        }}
      >
        <UserProvider>
          <Stack initialRouteName="login" />
        </UserProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
