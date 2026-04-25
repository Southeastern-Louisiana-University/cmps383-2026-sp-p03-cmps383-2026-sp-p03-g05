import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { ordersApi, usersApi, type OrderHistoryDto, type UserDto } from '@/lib/api';

function formatOrderDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatDisplayName(profile: UserDto | null, fallbackUserName: string) {
  const firstName = profile?.firstName?.trim() ?? '';
  const lastName = profile?.lastName?.trim() ?? '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName.length > 0 ? fullName : fallbackUserName;
}

function formatAddress(profile: UserDto | null) {
  const addressLine = profile?.address?.trim() ?? '';
  const city = profile?.city?.trim() ?? '';
  const state = profile?.state?.trim() ?? '';
  const zipCode = profile?.zipCode?.trim() ?? '';
  const cityStateZip = [city, state].filter(Boolean).join(', ');
  const cityStateZipWithPostal = [cityStateZip, zipCode].filter(Boolean).join(' ');
  return [addressLine, cityStateZipWithPostal].filter(Boolean).join(', ');
}

export default function AccountScreen() {
  const { user, signOut, isLoading } = useAuth();
  const [profile, setProfile] = useState<UserDto | null>(user);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryDto[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingOrderHistory, setIsLoadingOrderHistory] = useState(false);
  const [accountErrorMessage, setAccountErrorMessage] = useState<string | null>(null);

  const loadAccountData = useCallback(async () => {
    if (!user || user.id <= 0) {
      setProfile(user ?? null);
      setOrderHistory([]);
      setAccountErrorMessage(null);
      return;
    }

    setIsLoadingProfile(true);
    setIsLoadingOrderHistory(true);
    setAccountErrorMessage(null);

    const [profileResult, historyResult] = await Promise.allSettled([
      usersApi.getById(user.id),
      ordersApi.history(),
    ]);

    if (profileResult.status === 'fulfilled') {
      setProfile(profileResult.value);
    } else {
      setProfile(user);
    }

    if (historyResult.status === 'fulfilled') {
      setOrderHistory(historyResult.value);
    } else {
      setOrderHistory([]);
    }

    if (profileResult.status === 'rejected' && historyResult.status === 'rejected') {
      setAccountErrorMessage('Unable to load account details right now.');
    }

    setIsLoadingProfile(false);
    setIsLoadingOrderHistory(false);
  }, [user]);

  useEffect(() => {
    void loadAccountData();
  }, [loadAccountData]);

  const onSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const displayName = useMemo(
    () => formatDisplayName(profile, user?.userName ?? 'guest'),
    [profile, user?.userName]
  );
  const phoneNumber = profile?.phoneNumber?.trim() || 'Not provided';
  const address = formatAddress(profile) || 'Not provided';
  const roleAccess = user?.roles.join(', ') || 'User';

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <ThemedText type="title" style={styles.title}>
              Account
            </ThemedText>
            <ThemedText style={styles.subtitle}>Signed in as {user?.userName ?? 'guest'}</ThemedText>
          </View>
          <Pressable
            style={({ pressed }) => [styles.refreshButton, pressed && styles.refreshButtonPressed]}
            onPress={() => {
              void loadAccountData();
            }}
            disabled={isLoadingProfile || isLoadingOrderHistory}>
            <ThemedText style={styles.refreshButtonText}>
              {isLoadingProfile || isLoadingOrderHistory ? 'Refreshing...' : 'Refresh'}
            </ThemedText>
          </Pressable>
        </View>

        {accountErrorMessage ? <ThemedText style={styles.errorText}>{accountErrorMessage}</ThemedText> : null}

        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>User Info</ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Name</ThemedText>
            <ThemedText style={styles.infoValue}>{isLoadingProfile ? 'Loading...' : displayName}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Phone Number</ThemedText>
            <ThemedText style={styles.infoValue}>{isLoadingProfile ? 'Loading...' : phoneNumber}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Address</ThemedText>
            <ThemedText style={styles.infoValue}>{isLoadingProfile ? 'Loading...' : address}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Role Access</ThemedText>
            <ThemedText style={styles.infoValue}>{roleAccess}</ThemedText>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Order History</ThemedText>
          {isLoadingOrderHistory ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={BrandColors.primary} />
              <ThemedText style={styles.loadingText}>Loading order history...</ThemedText>
            </View>
          ) : orderHistory.length === 0 ? (
            <ThemedText style={styles.emptyHistoryText}>No orders found yet.</ThemedText>
          ) : (
            <View style={styles.historyList}>
              {orderHistory.map((order) => (
                <View key={order.id} style={styles.historyRow}>
                  <ThemedText style={styles.historyDate}>{formatOrderDate(order.orderedAt)}</ThemedText>
                  <ThemedText style={styles.historyTotal}>{formatCurrency(order.total)}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>

        <Pressable style={styles.signOutButton} onPress={onSignOut} disabled={isLoading}>
          <ThemedText style={styles.signOutButtonText}>{isLoading ? 'Signing Out...' : 'Sign Out'}</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BrandColors.secondary,
  },
  content: {
    padding: 20,
    gap: 14,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: BrandColors.darkAccent,
    marginBottom: 6,
  },
  subtitle: {
    color: BrandColors.text,
  },
  refreshButton: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  refreshButtonPressed: {
    opacity: 0.84,
  },
  refreshButtonText: {
    color: BrandColors.darkAccent,
    fontWeight: '700',
    fontSize: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 9,
  },
  cardTitle: {
    color: BrandColors.darkAccent,
    fontWeight: '700',
    fontSize: 16,
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    color: BrandColors.text,
    fontSize: 12,
  },
  infoValue: {
    color: BrandColors.darkAccent,
    fontWeight: '700',
    fontSize: 14,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  loadingText: {
    color: BrandColors.text,
    fontSize: 13,
  },
  emptyHistoryText: {
    color: BrandColors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  historyList: {
    gap: 8,
  },
  historyRow: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    color: BrandColors.darkAccent,
    fontWeight: '600',
    fontSize: 13,
  },
  historyTotal: {
    color: BrandColors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  errorText: {
    color: '#9b2d2d',
    fontSize: 13,
    lineHeight: 18,
  },
  signOutButton: {
    marginTop: 4,
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
