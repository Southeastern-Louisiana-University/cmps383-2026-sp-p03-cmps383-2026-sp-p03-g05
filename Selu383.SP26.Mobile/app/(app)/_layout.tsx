import { Image } from 'expo-image';
import { Redirect, Tabs, useRouter } from 'expo-router';
import { CalendarCheck2, Check, ChevronDown, House, Minus, Plus, ShoppingCart, User, Utensils, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BrandedLoadingScreen } from '@/components/branded-loading-screen';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { BrandColors } from '@/constants/theme';
import { locationsApi, ordersApi, usersApi, type LocationDto } from '@/lib/api';

const pickupOptions = ['In Store', 'Drive Through'] as const;

const paymentMethodOptions = [
  {
    value: 'masterpay',
    label: 'MasterPay',
    image: require('@/assets/images/masterpay.png'),
  },
  {
    value: 'visapay',
    label: 'VisaPay',
    image: require('@/assets/images/visapay.png'),
  },
  {
    value: 'applepay',
    label: 'ApplePay',
    image: require('@/assets/images/applepay.png'),
  },
  {
    value: 'gpay',
    label: 'GPay',
    image: require('@/assets/images/gpay.png'),
  },
] as const;

type DropdownOption = {
  value: string;
  label: string;
};

type DropdownFieldProps = {
  label: string;
  valueLabel: string;
  placeholder: string;
  options: DropdownOption[];
  isOpen: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
};

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function calculateRewardPoints(orderTotal: number) {
  return Math.max(0, Math.round(orderTotal * 10));
}
const rewardsCounterDurationMs = 1200;
const rewardsPopupHoldMs = 3000;

function DropdownField({
  label,
  valueLabel,
  placeholder,
  options,
  isOpen,
  disabled,
  onToggle,
  onSelect,
}: DropdownFieldProps) {
  return (
    <View style={styles.checkoutFieldBlock}>
      <ThemedText style={styles.checkoutFieldLabel}>{label}</ThemedText>
      <Pressable
        style={({ pressed }) => [
          styles.dropdownTrigger,
          disabled && styles.dropdownTriggerDisabled,
          pressed && !disabled && styles.dropdownTriggerPressed,
        ]}
        accessibilityRole="button"
        onPress={onToggle}
        disabled={disabled}>
        <ThemedText style={[styles.dropdownValue, !valueLabel && styles.dropdownPlaceholder]}>
          {valueLabel || placeholder}
        </ThemedText>
        <ChevronDown color={BrandColors.darkAccent} size={18} />
      </Pressable>
      {isOpen ? (
        <View style={styles.dropdownMenu}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              style={({ pressed }) => [styles.dropdownOption, pressed && styles.dropdownOptionPressed]}
              onPress={() => onSelect(option.value)}>
              <ThemedText style={styles.dropdownOptionText}>{option.label}</ThemedText>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function AppBanner({ cartCount, onCartPress }: { cartCount: number; onCartPress: () => void }) {
  return (
    <View style={styles.banner}>
      <Image source={require('@/assets/images/logo-round.png')} style={styles.bannerLogo} contentFit="contain" />
      <Pressable
        style={({ pressed }) => [styles.cartBadge, pressed && styles.cartBadgePressed]}
        onPress={onCartPress}
        accessibilityRole="button"
        accessibilityLabel="Shopping cart">
        <ShoppingCart color={BrandColors.primary} size={20} />
        <View style={styles.cartCountBadge}>
          <ThemedText style={styles.cartCountText}>{cartCount}</ThemedText>
        </View>
      </Pressable>
    </View>
  );
}

export default function AppLayout() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshSession } = useAuth();
  const { cartCount, cartItems, subtotal, clearCart, incrementItem, decrementItem, removeItem } = useCart();

  const [isCartModalVisible, setCartModalVisible] = useState(false);
  const [isCheckoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [isLoadingLocations, setLoadingLocations] = useState(false);
  const [locationsErrorMessage, setLocationsErrorMessage] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [pickupType, setPickupType] = useState<(typeof pickupOptions)[number]>('In Store');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'location' | 'pickup' | null>(null);
  const [isSubmittingOrder, setSubmittingOrder] = useState(false);
  const [orderErrorMessage, setOrderErrorMessage] = useState<string | null>(null);
  const [orderSuccessVisible, setOrderSuccessVisible] = useState(false);
  const [rewardPointsEarned, setRewardPointsEarned] = useState(0);
  const [rewardCounter, setRewardCounter] = useState(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rewardCounterTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const locationOptions = useMemo<DropdownOption[]>(
    () =>
      locations.map((location) => ({
        value: String(location.id),
        label: location.address,
      })),
    [locations]
  );

  const selectedLocationLabel = useMemo(
    () => locationOptions.find((option) => option.value === selectedLocationId)?.label ?? '',
    [locationOptions, selectedLocationId]
  );

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      if (rewardCounterTimerRef.current) {
        clearInterval(rewardCounterTimerRef.current);
      }
    };
  }, []);

  const closeAllModals = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (rewardCounterTimerRef.current) {
      clearInterval(rewardCounterTimerRef.current);
      rewardCounterTimerRef.current = null;
    }
    setCartModalVisible(false);
    setCheckoutModalVisible(false);
    setActiveDropdown(null);
    setOrderErrorMessage(null);
    setOrderSuccessVisible(false);
    setRewardPointsEarned(0);
    setRewardCounter(0);
  };

  const handleKeepShopping = () => {
    setCartModalVisible(false);
    router.push('/(app)/menu');
  };

  const fetchLocations = async () => {
    setLoadingLocations(true);
    setLocationsErrorMessage(null);

    try {
      const locationResults = await locationsApi.list();
      setLocations(locationResults);
      setSelectedLocationId((current) => {
        if (current && locationResults.some((location) => String(location.id) === current)) {
          return current;
        }

        return String(locationResults[0]?.id ?? '');
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load locations';
      setLocationsErrorMessage(message);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleOpenCheckout = () => {
    setCartModalVisible(false);
    setCheckoutModalVisible(true);
    setOrderErrorMessage(null);
    setOrderSuccessVisible(false);
    setRewardPointsEarned(0);
    setRewardCounter(0);
    setActiveDropdown(null);
    void fetchLocations();
  };

  const startRewardCounterAnimation = (pointsToAdd: number) => {
    setRewardPointsEarned(pointsToAdd);
    setRewardCounter(0);

    if (rewardCounterTimerRef.current) {
      clearInterval(rewardCounterTimerRef.current);
      rewardCounterTimerRef.current = null;
    }

    if (pointsToAdd <= 0) {
      return;
    }

    const startedAt = Date.now();

    rewardCounterTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / rewardsCounterDurationMs);
      const nextValue = Math.floor(pointsToAdd * progress);

      setRewardCounter(nextValue);

      if (progress >= 1) {
        setRewardCounter(pointsToAdd);
        if (rewardCounterTimerRef.current) {
          clearInterval(rewardCounterTimerRef.current);
          rewardCounterTimerRef.current = null;
        }
      }
    }, 30);
  };

  const applyRewardsFromOrder = async (pointsToAdd: number) => {
    if (pointsToAdd <= 0 || !user || user.id <= 0) {
      return;
    }

    try {
      // Fetch current points first, then increment via API update.
      await usersApi.getById(user.id);
      await usersApi.awardRewards(user.id, { pointsToAdd });
      await refreshSession();
    } catch {
      // Do not fail order completion if rewards update fails.
    }
  };

  const handlePlaceOrder = async () => {
    if (isSubmittingOrder || cartItems.length === 0) {
      return;
    }

    if (!selectedLocationId) {
      setOrderErrorMessage('Please select your location.');
      return;
    }

    if (!paymentMethod) {
      setOrderErrorMessage('Please select a payment option.');
      return;
    }

    setSubmittingOrder(true);
    setOrderErrorMessage(null);

    try {
      const selectedPaymentOption = paymentMethodOptions.find((option) => option.value === paymentMethod);
      await ordersApi.create({
        locationId: Number(selectedLocationId),
        pickupType,
        paymentMethod: selectedPaymentOption?.label ?? paymentMethod,
        total: Number(subtotal.toFixed(2)),
        items: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice.toFixed(2)),
        })),
      });

      const pointsToAdd = calculateRewardPoints(subtotal);
      await applyRewardsFromOrder(pointsToAdd);
      startRewardCounterAnimation(pointsToAdd);
      setOrderSuccessVisible(true);

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }

      closeTimerRef.current = setTimeout(() => {
        clearCart();
        closeAllModals();
        closeTimerRef.current = null;
      }, rewardsCounterDurationMs + rewardsPopupHoldMs);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Order failed';
      setOrderErrorMessage(message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (isLoading) {
    return <BrandedLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          header: () => <AppBanner cartCount={cartCount} onCartPress={() => setCartModalVisible(true)} />,
          tabBarActiveTintColor: BrandColors.primary,
          tabBarInactiveTintColor: BrandColors.primary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarButton: ({ style, children, onPress, onLongPress, accessibilityState, accessibilityLabel, testID }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={accessibilityState}
              accessibilityLabel={accessibilityLabel}
              testID={testID}
              onPress={onPress}
              onLongPress={onLongPress}
              android_ripple={{ color: '#d9f7e8' }}
              style={({ pressed }) => [style, styles.tabButton, pressed && styles.tabButtonPressed]}>
              {children}
            </Pressable>
          ),
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
            tabBarIcon: ({ size }) => <Utensils color={BrandColors.primary} size={size} />,
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

      <Modal visible={isCartModalVisible} transparent animationType="fade" onRequestClose={() => setCartModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setCartModalVisible(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Cart</ThemedText>
              <Pressable style={styles.modalCloseButton} onPress={() => setCartModalVisible(false)}>
                <X color={BrandColors.darkAccent} size={18} />
              </Pressable>
            </View>

            {cartItems.length === 0 ? (
              <View style={styles.cartEmptyState}>
                <ThemedText style={styles.cartEmptyText}>Your cart is empty. Add items from the menu.</ThemedText>
              </View>
            ) : (
              <ScrollView
                style={styles.cartItemsList}
                contentContainerStyle={styles.cartItemsContent}
                showsVerticalScrollIndicator
                nestedScrollEnabled
                scrollEnabled
                keyboardShouldPersistTaps="handled">
                {cartItems.map((item) => (
                  <View key={item.key} style={styles.cartItemRow}>
                    <Image source={item.image} style={styles.cartItemImage} contentFit="cover" />
                    <View style={styles.cartItemBody}>
                      <View style={styles.cartItemHead}>
                        <ThemedText style={styles.cartItemName}>{item.name}</ThemedText>
                        <Pressable style={styles.removeItemButton} onPress={() => removeItem(item.key)}>
                          <X color={BrandColors.text} size={15} />
                        </Pressable>
                      </View>
                      <View style={styles.cartItemMeta}>
                        <ThemedText style={styles.cartItemPrice}>{formatCurrency(item.unitPrice * item.quantity)}</ThemedText>
                        <View style={styles.quantityGroup}>
                          <Pressable style={styles.quantityButton} onPress={() => decrementItem(item.key)}>
                            <Minus color={BrandColors.primary} size={14} />
                          </Pressable>
                          <ThemedText style={styles.quantityText}>{item.quantity}</ThemedText>
                          <Pressable
                            style={styles.quantityButton}
                            onPress={() =>
                              incrementItem({
                                key: item.key,
                                name: item.name,
                                unitPrice: item.unitPrice,
                                image: item.image,
                              })
                            }>
                            <Plus color={BrandColors.primary} size={14} />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.subtotalRow}>
              <ThemedText style={styles.subtotalLabel}>Subtotal:</ThemedText>
              <ThemedText style={styles.subtotalValue}>{formatCurrency(subtotal)}</ThemedText>
            </View>

            <View style={styles.modalActionRow}>
              <Pressable style={({ pressed }) => [styles.keepShoppingButton, pressed && styles.modalActionPressed]} onPress={handleKeepShopping}>
                <ThemedText style={styles.keepShoppingText}>Keep Shopping</ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.checkoutButton,
                  pressed && styles.modalActionPressed,
                  cartItems.length === 0 && styles.disabledButton,
                ]}
                disabled={cartItems.length === 0}
                onPress={handleOpenCheckout}>
                <ThemedText style={styles.checkoutButtonText}>Checkout</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isCheckoutModalVisible} transparent animationType="fade" onRequestClose={closeAllModals}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeAllModals} />
          <View style={[styles.modalCard, styles.checkoutModalCard]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Checkout</ThemedText>
              <Pressable style={styles.modalCloseButton} onPress={closeAllModals}>
                <X color={BrandColors.darkAccent} size={18} />
              </Pressable>
            </View>

            {orderSuccessVisible ? (
              <View style={styles.successWrap}>
                <ThemedText style={styles.rewardsHeaderText}>Contrats! you earned rewards points!</ThemedText>
                <View style={styles.rewardsWheel}>
                  <View style={styles.rewardsWheelInner}>
                    <ThemedText style={styles.rewardsWheelValue}>{rewardCounter}</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.rewardsEarnedText}>+{rewardPointsEarned} points</ThemedText>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.checkoutBody}>
                <View style={styles.checkoutTotalRow}>
                  <ThemedText style={styles.checkoutTotalLabel}>Your order total:</ThemedText>
                  <ThemedText style={styles.checkoutTotalValue}>{formatCurrency(subtotal)}</ThemedText>
                </View>

                {isLoadingLocations ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color={BrandColors.primary} />
                    <ThemedText style={styles.loadingText}>Loading locations...</ThemedText>
                  </View>
                ) : (
                  <DropdownField
                    label="Select your location"
                    valueLabel={selectedLocationLabel}
                    placeholder="Choose location"
                    options={locationOptions}
                    isOpen={activeDropdown === 'location'}
                    disabled={locationOptions.length === 0 || isSubmittingOrder}
                    onToggle={() => setActiveDropdown((current) => (current === 'location' ? null : 'location'))}
                    onSelect={(value) => {
                      setSelectedLocationId(value);
                      setActiveDropdown(null);
                    }}
                  />
                )}

                <DropdownField
                  label="Pickup"
                  valueLabel={pickupType}
                  placeholder="Choose pickup"
                  options={pickupOptions.map((option) => ({ value: option, label: option }))}
                  isOpen={activeDropdown === 'pickup'}
                  disabled={isSubmittingOrder}
                  onToggle={() => setActiveDropdown((current) => (current === 'pickup' ? null : 'pickup'))}
                  onSelect={(value) => {
                    setPickupType(value as (typeof pickupOptions)[number]);
                    setActiveDropdown(null);
                  }}
                />

                <View style={styles.checkoutFieldBlock}>
                  <ThemedText style={styles.checkoutFieldLabel}>Payment</ThemedText>
                  <View style={styles.paymentOptionsRow}>
                    {paymentMethodOptions.map((option) => {
                      const isSelected = paymentMethod === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          style={({ pressed }) => [
                            styles.paymentOptionButton,
                            isSelected && styles.paymentOptionButtonSelected,
                            pressed && !isSubmittingOrder && styles.paymentOptionButtonPressed,
                          ]}
                          disabled={isSubmittingOrder}
                          onPress={() => {
                            setPaymentMethod(option.value);
                            setOrderErrorMessage(null);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Select ${option.label} payment`}>
                          <Image source={option.image} style={styles.paymentOptionImage} contentFit="contain" />
                          {isSelected ? (
                            <View style={styles.paymentSelectedBadge}>
                              <Check size={12} color="#ffffff" />
                            </View>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.orderButton,
                    pressed && styles.modalActionPressed,
                    (isSubmittingOrder || !selectedLocationId || !paymentMethod || cartItems.length === 0) && styles.disabledButton,
                  ]}
                  disabled={isSubmittingOrder || !selectedLocationId || !paymentMethod || cartItems.length === 0}
                  onPress={() => {
                    void handlePlaceOrder();
                  }}>
                  {isSubmittingOrder ? (
                    <>
                      <ActivityIndicator color={BrandColors.secondary} size="small" />
                      <ThemedText style={styles.orderButtonText}>Placing Order...</ThemedText>
                    </>
                  ) : (
                    <ThemedText style={styles.orderButtonText}>Order</ThemedText>
                  )}
                </Pressable>

                {locationsErrorMessage ? <ThemedText style={styles.errorText}>{locationsErrorMessage}</ThemedText> : null}
                {orderErrorMessage ? <ThemedText style={styles.errorText}>{orderErrorMessage}</ThemedText> : null}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: BrandColors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.accent,
    paddingHorizontal: 18,
    paddingTop: 40,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLogo: {
    width: 130,
    height: 40,
  },
  cartBadge: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 999,
    width: 38,
    height: 38,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgePressed: {
    opacity: 0.84,
  },
  cartCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountText: {
    color: BrandColors.secondary,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.34)',
    justifyContent: 'center',
    padding: 16,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    padding: 16,
    maxHeight: '88%',
    width: '100%',
    marginTop: 16,
  },
  checkoutModalCard: {
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 25,
    color: BrandColors.darkAccent,
    fontWeight: '700',
    
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6efe3',
    borderWidth: 1,
    borderColor: BrandColors.accent,
  },
  cartEmptyState: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fcf8f2',
  },
  cartEmptyText: {
    color: BrandColors.text,
    lineHeight: 20,
  },
  cartItemsList: {
    maxHeight: 320,
    flexGrow: 0,
  },
  cartItemsContent: {
    gap: 10,
    paddingBottom: 6,
  },
  cartItemRow: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
  },
  cartItemImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },
  cartItemBody: {
    flex: 1,
    gap: 6,
  },
  cartItemHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
  },
  cartItemName: {
    flex: 1,
    color: BrandColors.darkAccent,
    fontWeight: '700',
    lineHeight: 20,
  },
  removeItemButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  cartItemPrice: {
    color: BrandColors.primary,
    fontWeight: '700',
  },
  quantityGroup: {
    borderWidth: 2,
    borderColor: '#8ec3a6',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  quantityButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: BrandColors.darkAccent,
    fontWeight: '700',
    minWidth: 12,
    textAlign: 'center',
  },
  subtotalRow: {
    marginTop: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtotalLabel: {
    color: BrandColors.darkAccent,
    fontSize: 18,
  },
  subtotalValue: {
    color: BrandColors.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  keepShoppingButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: BrandColors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  keepShoppingText: {
    color: BrandColors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  checkoutButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.primary,
  },
  checkoutButtonText: {
    color: BrandColors.secondary,
    fontSize: 18,
    fontWeight: '700',
  },
  modalActionPressed: {
    opacity: 0.8,
  },
  disabledButton: {
    opacity: 0.55,
  },
  checkoutBody: {
    gap: 10,
    paddingBottom: 6,
  },
  checkoutTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  checkoutTotalLabel: {
    color: BrandColors.darkAccent,
    fontSize: 17,
  },
  checkoutTotalValue: {
    color: BrandColors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  loadingText: {
    color: BrandColors.text,
  },
  checkoutFieldBlock: {
    gap: 6,
  },
  checkoutFieldLabel: {
    color: BrandColors.darkAccent,
    fontWeight: '700',
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  dropdownTriggerDisabled: {
    opacity: 0.6,
  },
  dropdownTriggerPressed: {
    opacity: 0.8,
  },
  dropdownValue: {
    color: BrandColors.darkAccent,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#8a827a',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dropdownOptionPressed: {
    backgroundColor: '#ecfff6',
  },
  dropdownOptionText: {
    color: BrandColors.darkAccent,
  },
  paymentOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  paymentOptionButton: {
    width: '23%',
    position: 'relative',
    height: 92,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  paymentOptionButtonSelected: {
    borderColor: '#16a34a',
  },
  paymentOptionButtonPressed: {
    opacity: 0.84,
  },
  paymentOptionImage: {
    width: '72%',
    height: '58%',
  },
  paymentSelectedBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderButton: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: BrandColors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  orderButtonText: {
    color: BrandColors.secondary,
    fontWeight: '700',
    fontSize: 17,
  },
  errorText: {
    color: '#9e1a1a',
    fontSize: 12,
    lineHeight: 16,
  },
  successWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  rewardsHeaderText: {
    color: BrandColors.primary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  rewardsWheel: {
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 8,
    borderColor: BrandColors.primary,
    backgroundColor: '#ecfff6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardsWheelInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardsWheelValue: {
    color: BrandColors.primary,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 36,
  },
  rewardsEarnedText: {
    color: BrandColors.darkAccent,
    fontSize: 16,
    fontWeight: '700',
  },
  successText: {
    color: BrandColors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  tabBar: {
    borderTopColor: BrandColors.accent,
    borderTopWidth: 1,
    backgroundColor: '#ffffff',
    height: 74,
    paddingTop: 8,
    paddingBottom: 10,
  },
  tabButton: {
    borderRadius: 12,
    marginHorizontal: 4,
    marginTop: 2,
  },
  tabButtonPressed: {
    backgroundColor: '#ecfff6',
    opacity: 0.86,
  },
  tabLabel: {
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 2,
  },
});
