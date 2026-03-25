import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { BrandColors } from '@/constants/theme';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title" style={styles.title}>
        Welcome Back
      </ThemedText>
      <ThemedText style={styles.subtitle}>{user?.userName ?? 'Guest'} - your coffee flow starts here.</ThemedText>

      <View style={styles.card}>
        <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
          Today's Focus
        </ThemedText>
        <ThemedText style={styles.cardText}>Order faster, reserve your table, and keep favorites one tap away.</ThemedText>
      </View>
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
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#ffffff',
    gap: 6,
  },
  cardTitle: {
    color: BrandColors.darkAccent,
  },
  cardText: {
    color: BrandColors.text,
    lineHeight: 20,
  },
});
