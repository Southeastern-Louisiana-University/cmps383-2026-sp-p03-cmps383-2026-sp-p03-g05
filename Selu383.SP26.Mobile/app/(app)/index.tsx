import { router } from 'expo-router';
import { MapPin, Store, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { BrandColors } from '@/constants/theme';

const mvpItems = [
  {
    title: 'Authentication',
    detail: 'Use /api/authentication/login + /me for session state.',
    icon: UserRound,
  },
  {
    title: 'Locations',
    detail: 'Show /api/locations list and location detail.',
    icon: Store,
  },
  {
    title: 'Manager Actions',
    detail: 'Allow admin/manager updates for assigned locations.',
    icon: MapPin,
  },
];

export default function AppHomeScreen() {
  const { user, signOut, isLoading } = useAuth();

  const onSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title" style={styles.title}>
        Mobile MVP Scope
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Signed in as {user?.userName ?? 'unknown'} ({user?.roles.join(', ') ?? 'No Roles'})
      </ThemedText>

      <View style={styles.cardList}>
        {mvpItems.map((item) => (
          <View key={item.title} style={styles.card}>
            <item.icon color={BrandColors.primary} size={18} />
            <View style={styles.cardTextWrap}>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                {item.title}
              </ThemedText>
              <ThemedText style={styles.cardDetail}>{item.detail}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      <Pressable style={styles.secondaryButton} onPress={onSignOut} disabled={isLoading}>
        <ThemedText style={styles.secondaryButtonText}>
          {isLoading ? 'Signing Out...' : 'Sign Out'}
        </ThemedText>
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
    marginBottom: 6,
  },
  subtitle: {
    color: BrandColors.text,
    marginBottom: 20,
  },
  cardList: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  cardTextWrap: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: BrandColors.darkAccent,
  },
  cardDetail: {
    color: BrandColors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  secondaryButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: BrandColors.text,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: BrandColors.text,
    fontWeight: '600',
  },
});
