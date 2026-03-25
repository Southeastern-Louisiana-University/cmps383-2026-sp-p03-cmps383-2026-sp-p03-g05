import { Image } from 'expo-image';
import { Redirect, Tabs, router } from 'expo-router';
import { CalendarCheck2, House, Menu, User } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { BrandedLoadingScreen } from '@/components/branded-loading-screen';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';
import { BrandColors } from '@/constants/theme';

function AppBanner() {
  return (
    <View style={styles.banner}>
      <Image source={require('@/assets/images/logo.png')} style={styles.bannerLogo} contentFit="contain" />
      <Pressable style={({ pressed }) => [styles.orderBadge, pressed && styles.orderBadgePressed]} onPress={() => router.push('/(auth)/fast-pickup')}>
        <Image source={require('@/assets/images/Coffee Cup.png')} style={styles.orderBadgeIcon} contentFit="contain" />
        <ThemedText style={styles.orderBadgeText}>Order</ThemedText>
      </Pressable>
    </View>
  );
}

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <BrandedLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        header: () => <AppBanner />,
        tabBarActiveTintColor: BrandColors.primary,
        tabBarInactiveTintColor: BrandColors.primary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        sceneStyle: {
          backgroundColor: BrandColors.secondary,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ size }) => <House color={BrandColors.primary} size={size} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ size }) => <Menu color={BrandColors.primary} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reserve"
        options={{
          title: 'Reserve',
          tabBarIcon: ({ size }) => <CalendarCheck2 color={BrandColors.primary} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ size }) => <User color={BrandColors.primary} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: BrandColors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.accent,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLogo: {
    width: 130,
    height: 40,
  },
  orderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  orderBadgePressed: {
    opacity: 0.84,
  },
  orderBadgeIcon: {
    width: 18,
    height: 18,
  },
  orderBadgeText: {
    color: BrandColors.darkAccent,
    fontWeight: '700',
    fontSize: 12,
  },
  tabBar: {
    borderTopColor: BrandColors.accent,
    borderTopWidth: 1,
    backgroundColor: '#ffffff',
    height: 74,
    paddingTop: 8,
    paddingBottom: 10,
  },
  tabLabel: {
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 2,
  },
});
