import { Image } from 'expo-image';
import { HeartOff, Square, SquareCheck } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { BrandColors } from '@/constants/theme';
import { ordersApi, type OrderHistoryDto, type OrderItemDto } from '@/lib/api';

const favoriteImageByName: Record<string, number> = {
  'Iced Latte': require('@/assets/images/iced late.png'),
  'Strawberry Fields': require('@/assets/images/strawberry fields.png'),
  'Travis Special': require('@/assets/images/travis special.png'),
};

const emptyFavoriteSlots = [0, 1, 2];
const levels = [1, 2, 3, 4, 5];
const completedLevels = 2;
const featuredItems = [
  {
    name: 'Iced Latte',
    price: '$5.50',
    unitPrice: 5.5,
    image: require('@/assets/images/iced late.png'),
  },
  {
    name: 'Strawberry Fields',
    price: '$10.00',
    unitPrice: 10,
    image: require('@/assets/images/strawberry fields.png'),
  },
  {
    name: 'Travis Special',
    price: '$14.00',
    unitPrice: 14,
    image: require('@/assets/images/travis special.png'),
  },
] as const;

function resolveFavoriteImage(item: OrderItemDto) {
  const localImage = favoriteImageByName[item.name];
  if (localImage) {
    return localImage;
  }

  if (item.imageUrl && /^https?:\/\//i.test(item.imageUrl)) {
    return { uri: item.imageUrl };
  }

  return require('@/assets/images/logo-round.png');
}

function formatOrderDate(dateText: string) {
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) {
    return dateText;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { isInCart, toggleCartItem } = useCart();
  const pridePoints = user?.pridePoints ?? 0;

  const [latestOrder, setLatestOrder] = useState<OrderHistoryDto | null>(null);
  const [isLoadingOrderHistory, setIsLoadingOrderHistory] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadOrderHistory = async () => {
      setIsLoadingOrderHistory(true);
      try {
        const orderHistory = await ordersApi.history();
        if (!isMounted) {
          return;
        }

        setLatestOrder(orderHistory[0] ?? null);
      } catch {
        if (!isMounted) {
          return;
        }

        setLatestOrder(null);
      } finally {
        if (isMounted) {
          setIsLoadingOrderHistory(false);
        }
      }
    };

    void loadOrderHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const orderCards = useMemo(() => {
    if (!latestOrder) {
      return [] as OrderItemDto[];
    }

    return latestOrder.items.slice(0, 3);
  }, [latestOrder]);

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.title}>
          Welcome Back
        </ThemedText>
        <ThemedText style={styles.subtitle}>{user?.userName ?? 'Guest'} - your coffee flow starts here.</ThemedText>

        <View style={styles.card}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            PRIDE POINTS: {pridePoints}
          </ThemedText>
          <View style={styles.progressTrack}>
            {levels.map((level) => (
              <View
                key={level}
                style={[
                  styles.progressSegment,
                  level <= completedLevels ? styles.progressSegmentActive : styles.progressSegmentInactive,
                ]}
              />
            ))}
          </View>
          <View style={styles.levelLabelsRow}>
            {levels.map((level) => (
              <ThemedText key={level} style={styles.levelLabel}>
                Level {level}
              </ThemedText>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            ORDER AGAIN!
          </ThemedText>

          {isLoadingOrderHistory ? (
            <ThemedText style={styles.helperText}>Loading your recent orders...</ThemedText>
          ) : orderCards.length === 0 ? (
            <View style={styles.emptyFavoritesRow}>
              {emptyFavoriteSlots.map((slot) => (
                <View key={slot} style={styles.emptyFavoriteSquare}>
                  <HeartOff color={BrandColors.accent} size={22} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.orderAgainContent}>
              <View style={styles.orderHand}>
                {orderCards.map((item, index) => (
                  <View
                    key={`${item.name}-${index}`}
                    style={[
                      styles.handCard,
                      {
                        left: index * 40,
                        zIndex: index + 1,
                        transform: [{ rotate: `${(index - 1) * 8}deg` }],
                      },
                    ]}>
                    <Image source={resolveFavoriteImage(item)} style={styles.handImage} contentFit="cover" />
                  </View>
                ))}
              </View>
              <ThemedText style={styles.orderDateText}>Order Date: {formatOrderDate(latestOrder!.orderedAt)}</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            FEATURED ITEMS
          </ThemedText>
          <View style={styles.featuredItemsRow}>
            {featuredItems.map((item) => {
              const isSelected = isInCart(item.name);
              return (
                <View key={item.name} style={styles.featuredItemCard}>
                  <View style={styles.featuredImageWrap}>
                    <Image source={item.image} style={styles.featuredImage} contentFit="cover" />
                    <Pressable
                      style={({ pressed }) => [styles.featuredToggleButton, pressed && styles.featuredToggleButtonPressed]}
                      onPress={() =>
                        toggleCartItem({
                          key: item.name,
                          name: item.name,
                          unitPrice: item.unitPrice,
                          image: item.image,
                        })
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`${isSelected ? 'Remove' : 'Add'} ${item.name} ${isSelected ? 'from' : 'to'} cart`}>
                      {isSelected ? (
                        <SquareCheck color={BrandColors.primary} size={20} />
                      ) : (
                        <Square color={BrandColors.primary} size={20} />
                      )}
                    </Pressable>
                  </View>
                  <View style={styles.featuredItemMeta}>
                    <ThemedText style={styles.featuredItemName}>{item.name}</ThemedText>
                    <ThemedText style={styles.featuredItemPrice}>{item.price}</ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
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
    paddingBottom: 28,
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
    marginBottom: 12,
  },
  cardTitle: {
    color: BrandColors.darkAccent,
    marginBottom: 10,
  },
  progressTrack: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  progressSegment: {
    flex: 1,
    height: 10,
    borderRadius: 999,
  },
  progressSegmentActive: {
    backgroundColor: BrandColors.primary,
  },
  progressSegmentInactive: {
    backgroundColor: '#d9d2c9',
  },
  levelLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  levelLabel: {
    color: BrandColors.text,
    fontSize: 11,
  },
  helperText: {
    color: BrandColors.text,
    lineHeight: 20,
  },
  emptyFavoritesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  emptyFavoriteSquare: {
    flex: 1,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: BrandColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffdf9',
  },
  orderAgainContent: {
    alignItems: 'center',
    paddingTop: 2,
  },
  orderHand: {
    position: 'relative',
    width: 176,
    height: 126,
    marginBottom: 8,
  },
  handCard: {
    position: 'absolute',
    top: 0,
    width: 96,
    height: 122,
    borderRadius: 12,
    backgroundColor: '#f7f4ef',
    borderWidth: 1,
    borderColor: BrandColors.accent,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  handImage: {
    width: '100%',
    height: '100%',
  },
  orderDateText: {
    color: BrandColors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  featuredItemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  featuredItemCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  featuredItemMeta: {
    width: '100%',
    alignItems: 'center',
    gap: 1,
  },
  featuredImageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    overflow: 'hidden',
    backgroundColor: '#f7f4ef',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredToggleButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#ffffffee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredToggleButtonPressed: {
    opacity: 0.75,
  },
  featuredItemName: {
    color: BrandColors.darkAccent,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    fontWeight: '700',
    minHeight: 20,
  },
  featuredItemPrice: {
    color: BrandColors.primary,
    fontWeight: '700',
    fontSize: 12,
    marginTop: -2,
  },
});
