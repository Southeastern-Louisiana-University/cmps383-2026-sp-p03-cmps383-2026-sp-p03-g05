import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';

const featuredItems = ['20 oz Vanilla Latte', '16 oz Americano', '12 oz Drip Coffee'] as const;

export default function MenuScreen() {
  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title" style={styles.title}>
        Menu
      </ThemedText>
      <ThemedText style={styles.subtitle}>Featured drinks for quick ordering.</ThemedText>

      <View style={styles.list}>
        {featuredItems.map((item) => (
          <View key={item} style={styles.itemCard}>
            <ThemedText style={styles.itemText}>{item}</ThemedText>
          </View>
        ))}
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
  list: {
    gap: 10,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
  },
  itemText: {
    color: BrandColors.darkAccent,
    fontWeight: '600',
  },
});
