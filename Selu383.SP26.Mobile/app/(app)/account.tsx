import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { BrandColors } from '@/constants/theme';

export default function AccountScreen() {
  const { user, signOut, isLoading } = useAuth();

  const onSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title" style={styles.title}>
        Account
      </ThemedText>
      <ThemedText style={styles.subtitle}>Signed in as {user?.userName ?? 'guest'}</ThemedText>

      <View style={styles.card}>
        <ThemedText style={styles.cardLabel}>Role Access</ThemedText>
        <ThemedText style={styles.cardValue}>{user?.roles.join(', ') ?? 'User'}</ThemedText>
      </View>

      <Pressable style={styles.signOutButton} onPress={onSignOut} disabled={isLoading}>
        <ThemedText style={styles.signOutButtonText}>{isLoading ? 'Signing Out...' : 'Sign Out'}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: BrandColors.secondary,
  },
  title: {
    color: BrandColors.darkAccent,
    marginBottom: 8,
  },
  subtitle: {
    color: BrandColors.text,
    marginBottom: 18,
  },
  card: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 6,
  },
  cardLabel: {
    color: BrandColors.text,
    fontSize: 13,
  },
  cardValue: {
    color: BrandColors.darkAccent,
    fontWeight: '700',
  },
  signOutButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: BrandColors.text,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  signOutButtonText: {
    color: BrandColors.text,
    fontWeight: '700',
  },
});
