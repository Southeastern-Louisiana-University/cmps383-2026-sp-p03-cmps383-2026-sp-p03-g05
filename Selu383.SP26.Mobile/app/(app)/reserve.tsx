import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';

export default function ReserveScreen() {
  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title" style={styles.title}>
        Reserve
      </ThemedText>
      <ThemedText style={styles.subtitle}>Book a table and skip the wait.</ThemedText>

      <View style={styles.card}>
        <ThemedText style={styles.cardText}>Reservation options can be connected here next.</ThemedText>
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
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 14,
  },
  cardText: {
    color: BrandColors.text,
    lineHeight: 20,
  },
});
