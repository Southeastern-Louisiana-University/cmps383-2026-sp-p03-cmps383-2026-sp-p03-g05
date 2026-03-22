import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';

export function BrandedLoadingScreen() {
  return (
    <ThemedView style={styles.screen}>
      <View style={styles.logoWrap}>
        <Image source={require('@/assets/images/logo-round.png')} style={styles.logo} contentFit="cover" />
      </View>

      <ThemedText type="subtitle" style={styles.title}>
        Caffeinated Lions
      </ThemedText>

      <ActivityIndicator color={BrandColors.primary} size="small" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: BrandColors.secondary,
    gap: 12,
  },
  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BrandColors.accent,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: BrandColors.darkAccent,
  },
});
