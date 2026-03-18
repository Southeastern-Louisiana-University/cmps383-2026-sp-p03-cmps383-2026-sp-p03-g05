import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BrandColors } from '@/constants/theme';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: BrandColors.secondary },
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
        <StatusBar
          style={colorScheme === 'dark' ? 'light' : 'dark'}
          backgroundColor={colorScheme === 'dark' ? BrandColors.darkAccent : BrandColors.secondary}
        />
      </ThemeProvider>
    </AuthProvider>
  );
}
