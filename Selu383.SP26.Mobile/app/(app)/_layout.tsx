import { Redirect, Stack } from 'expo-router';

import { BrandedLoadingScreen } from '@/components/branded-loading-screen';
import { useAuth } from '@/context/auth-context';
import { BrandColors } from '@/constants/theme';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <BrandedLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: BrandColors.darkAccent,
        },
        headerTintColor: BrandColors.secondary,
        contentStyle: {
          backgroundColor: BrandColors.secondary,
        },
      }}>
      <Stack.Screen name="index" options={{ title: 'Caffeinated Lions' }} />
    </Stack>
  );
}
