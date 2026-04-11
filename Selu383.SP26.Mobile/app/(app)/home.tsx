import { Image } from 'expo-image';
import { HeartOff, Square, SquareCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { BrandColors } from '@/constants/theme';
import { menuItemsApi, ordersApi, usersApi, type OrderHistoryDto, type OrderItemDto } from '@/lib/api';

const favoriteImageByName: Record<string, number> = {
  'Iced Latte': require('@/assets/images/iced late.png'),
  'Black & White Cold Brew': require('@/assets/images/black white cold brew.png'),
  Downtowner: require('@/assets/images/downtowner.png'),
  'Strawberry Fields': require('@/assets/images/strawberry fields.png'),
  'Travis Special': require('@/assets/images/travis special.png'),
};

const emptyFavoriteSlots = [0, 1, 2];
const levels = [1, 2, 3, 4, 5];

function getCompletedLevels(pridePoints: number) {
  if (pridePoints < 0) {
    return 0;
  }
  if (pridePoints <= 1000) {
    return 1;
  }
  if (pridePoints <= 2000) {
    return 2;
  }
  if (pridePoints <= 3000) {
    return 3;
  }
  if (pridePoints <= 4000) {
    return 4;
  }
  return 5;
}

type FeaturedItem = {
  name: string;
  price: string;
  unitPrice: number;
  image: number;
};

const fallbackFeaturedItems: FeaturedItem[] = [
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
];

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
  const [pridePoints, setPridePoints] = useState(user?.pridePoints ?? 0);
  const completedLevels = getCompletedLevels(pridePoints);

  const [recentOrders, setRecentOrders] = useState<OrderHistoryDto[]>([]);
  const [isLoadingOrderHistory, setIsLoadingOrderHistory] = useState(false);
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>(fallbackFeaturedItems);

  useEffect(() => {
    setPridePoints(user?.pridePoints ?? 0);
  }, [user?.pridePoints]);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUserPridePoints = async () => {
      if (!user || user.id <= 0) {
        return;
      }

      try {
        const userProfile = await usersApi.getById(user.id);
        if (!isMounted) {
          return;
        }

        setPridePoints(userProfile.pridePoints ?? 0);
      } catch {
        // Keep existing value from auth/session response when users API fails.
      }
    };

    void loadCurrentUserPridePoints();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    let isMounted = true;

    const loadOrderHistory = async () => {
      setIsLoadingOrderHistory(true);
      try {
        const orderHistory = await ordersApi.history();
        if (!isMounted) {
          return;
        }

        setRecentOrders(orderHistory.slice(0, 3));
      } catch {
        if (!isMounted) {
          return;
        }

        setRecentOrders([]);
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

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedItems = async () => {
      try {
        const menuItems = await menuItemsApi.list();
        if (!isMounted) {
          return;
        }

        const mappedFeaturedItems = menuItems
          .filter((item) => item.featured)
          .map((item) => ({
            name: item.itemName,
            unitPrice: item.price,
            price: `$${item.price.toFixed(2)}`,
            image: favoriteImageByName[item.itemName] ?? require('@/assets/images/logo-round.png'),
          }));

        if (mappedFeaturedItems.length > 0) {
          setFeaturedItems(mappedFeaturedItems);
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setFeaturedItems(fallbackFeaturedItems);
      }
    };

    void loadFeaturedItems();

    return () => {
      isMounted = false;
    };
  }, []);

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
          ) : recentOrders.length === 0 ? (
            <View style={styles.emptyFavoritesRow}>
              {emptyFavoriteSlots.map((slot) => (
                <View key={slot} style={styles.emptyFavoriteSquare}>
                  <HeartOff color={BrandColors.accent} size={22} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.recentOrdersList}>
              {recentOrders.map((order) => {
                const orderCards = order.items.slice(0, 3);
                const useCardOffset = orderCards.length > 1;
                return (
                  <View key={order.id} style={styles.orderAgainContent}>
                    <View style={styles.orderHand}>
                      {orderCards.map((item, index) => (
                        <View
                          key={`${order.id}-${item.name}-${index}`}
                          style={[
                            styles.handCard,
                            {
                              left: useCardOffset ? index * 20 : 20,
                              zIndex: index + 1,
                              transform: [{ rotate: useCardOffset ? `${(index - 1) * 8}deg` : '0deg' }],
                            },
                          ]}>
                          <Image source={resolveFavoriteImage(item)} style={styles.handImage} contentFit="cover" />
                        </View>
                      ))}
                    </View>
                    <ThemedText style={styles.orderDateText}>{formatOrderDate(order.orderedAt)}</ThemedText>
                  </View>
                );
              })}
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
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingTop: 2,
  },
  recentOrdersList: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  orderHand: {
    position: 'relative',
    width: '100%',
    maxWidth: 98,
    height: 86,
    marginBottom: 6,
  },
  handCard: {
    position: 'absolute',
    top: 0,
    width: 56,
    height: 82,
    borderRadius: 10,
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
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
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
