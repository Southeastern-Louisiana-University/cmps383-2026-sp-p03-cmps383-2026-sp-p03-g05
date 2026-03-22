import { Redirect } from 'expo-router';

import { BrandedLoadingScreen } from '@/components/branded-loading-screen';
import { useAuth } from '@/context/auth-context';

export default function RootIndex() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <BrandedLoadingScreen />;
  }

  return <Redirect href={isAuthenticated ? '/(app)' : '/(auth)/login'} />;
}
