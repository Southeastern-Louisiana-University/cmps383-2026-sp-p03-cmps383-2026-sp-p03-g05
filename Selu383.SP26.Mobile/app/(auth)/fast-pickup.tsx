import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ArrowLeft, Check, CheckCircle2, ChevronDown, Minus, NotebookPen, Plus, ShoppingCart, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddToCartButton } from '@/components/ui/add-to-cart-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { BrandColors } from '@/constants/theme';
import { locationsApi, menuItemsApi, ordersApi, type LocationDto, type MenuItemDto } from '@/lib/api';

const pickupOptions = ['In Store', 'Drive Through'] as const;
const orderProcessingMinimumMs = 700;
const successRedirectDelayMs = 2600;

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

type DisplayMenuItem = {
  name: string;
  description: string;
  price: string;
  image: number;
};

type MenuSection = {
  title: string;
  items: DisplayMenuItem[];
};

type ApiDisplayMenuItem = DisplayMenuItem & {
  type: string;
};

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

const drinks: DisplayMenuItem[] = [
  {
    name: 'Iced Latte',
    description: 'Espresso and milk served over ice for a refreshing coffee drink.',
    price: '$5.50',
    image: require('@/assets/images/iced late.png'),
  },
  {
    name: 'Supernova',
    description:
      'A unique coffee blend with a complex, balanced profile and subtle sweetness. Delicious as espresso or paired with milk.',
    price: '$7.95',
    image: require('@/assets/images/supernova.png'),
  },
  {
    name: 'Roaring Frappe',
    description:
      'Cold brew, milk, and ice blended together with a signature syrup or flavor, topped with whipped cream.',
    price: '$6.20',
    image: require('@/assets/images/roaring frappe.png'),
  },
  {
    name: 'Black & White Cold Brew',
    description: 'Cold brew made with both dark and light roast beans, finished with a drizzle of condensed milk.',
    price: '$5.15',
    image: require('@/assets/images/black white cold brew.png'),
  },
  {
    name: 'Strawberry Limeade',
    description: 'Fresh lime juice blended with strawberry puree for a refreshing, tangy drink.',
    price: '$5.00',
    image: require('@/assets/images/strawberry limeade.png'),
  },
  {
    name: 'Shaken Lemonade',
    description: 'Fresh lemon juice and simple syrup vigorously shaken for a bright, refreshing lemonade.',
    price: '$5.00',
    image: require('@/assets/images/shaken lemonade.png'),
  },
];

const sweetCrepes: DisplayMenuItem[] = [
  {
    name: 'Mannino Honey Crepe',
    description: 'A sweet crepe drizzled with Mannino honey and topped with mixed berries.',
    price: '$10.00',
    image: require('@/assets/images/mannino honey crepe.png'),
  },
  {
    name: 'Downtowner',
    description: "Strawberries and bananas wrapped in a crepe, finished with Nutella and Hershey's chocolate sauce.",
    price: '$10.75',
    image: require('@/assets/images/downtowner.png'),
  },
  {
    name: 'Funky Monkey',
    description: 'Nutella and bananas wrapped in a crepe, served with whipped cream.',
    price: '$10.00',
    image: require('@/assets/images/funky monkey.png'),
  },
  {
    name: "Le S'mores",
    description: 'Marshmallow cream and chocolate sauce inside a crepe, topped with graham cracker crumbs.',
    price: '$9.50',
    image: require('@/assets/images/le smores.png'),
  },
  {
    name: 'Strawberry Fields',
    description: "Fresh strawberries with Hershey's chocolate drizzle and a dusting of powdered sugar.",
    price: '$10.00',
    image: require('@/assets/images/strawberry fields.png'),
  },
  {
    name: 'Bonjour',
    description: 'A sweet crepe filled with syrup and cinnamon, finished with powdered sugar.',
    price: '$8.50',
    image: require('@/assets/images/bonjour.png'),
  },
  {
    name: 'Banana Foster',
    description: 'Bananas with cinnamon in a crepe, topped with a generous drizzle of caramel sauce.',
    price: '$8.95',
    image: require('@/assets/images/banana foster.png'),
  },
];

const savoryCrepes: DisplayMenuItem[] = [
  {
    name: "Matt's Scrambled Eggs",
    description: 'Scrambled eggs and melted mozzarella cheese wrapped in a crepe.',
    price: '$5.00',
    image: require('@/assets/images/matts scrambled eggs.png'),
  },
  {
    name: 'Meanie Mushroom',
    description: 'Sauteed mushrooms, mozzarella, tomato, and bacon inside a delicate crepe.',
    price: '$10.50',
    image: require('@/assets/images/meanie mushroom.png'),
  },
  {
    name: 'Turkey Club',
    description: 'Sliced turkey, bacon, spinach, and tomato wrapped in a savory crepe.',
    price: '$10.50',
    image: require('@/assets/images/turkey club.png'),
  },
  {
    name: 'Green Machine',
    description: 'Spinach, artichokes, and mozzarella cheese inside a fresh crepe.',
    price: '$10.00',
    image: require('@/assets/images/green machine.png'),
  },
  {
    name: 'Perfect Pair',
    description: 'A unique combination of bacon and Nutella wrapped in a crepe.',
    price: '$10.00',
    image: require('@/assets/images/perfect pair.png'),
  },
  {
    name: 'Crepe Fromage',
    description: 'A savory crepe filled with a blend of cheeses.',
    price: '$8.00',
    image: require('@/assets/images/crepe fromage.png'),
  },
  {
    name: 'Farmers Market Crepe',
    description: 'Turkey, spinach, and mozzarella wrapped in a savory crepe.',
    price: '$10.50',
    image: require('@/assets/images/farmers market.png'),
  },
];

const bagels: DisplayMenuItem[] = [
  {
    name: 'Travis Special',
    description: 'Cream cheese, salmon, spinach, and a fried egg served on a freshly toasted bagel.',
    price: '$14.00',
    image: require('@/assets/images/travis special.png'),
  },
  {
    name: 'Creme Brulagel',
    description: 'A toasted bagel with a caramelized sugar crust inspired by creme brulee, served with cream cheese.',
    price: '$8.00',
    image: require('@/assets/images/creme brulagle.png'),
  },
  {
    name: 'The Fancy One',
    description: 'Smoked salmon, cream cheese, and fresh dill on a toasted bagel.',
    price: '$13.00',
    image: require('@/assets/images/fancy one.png'),
  },
  {
    name: 'Breakfast Bagel',
    description: 'A toasted bagel with your choice of ham, bacon, or sausage, a fried egg, and cheddar cheese.',
    price: '$9.50',
    image: require('@/assets/images/breakfast bagel.png'),
  },
  {
    name: 'The Classic',
    description: 'A toasted bagel with cream cheese.',
    price: '$5.25',
    image: require('@/assets/images/classic.png'),
  },
];

const fallbackMenuSections = [
  { title: 'Drinks', items: drinks },
  { title: 'Sweet Crepes', items: sweetCrepes },
  { title: 'Savory Crepes', items: savoryCrepes },
  { title: 'Bagels', items: bagels },
] as const;

const fallbackAllMenuItems = [...drinks, ...sweetCrepes, ...savoryCrepes, ...bagels];
const fallbackImageByName = Object.fromEntries(fallbackAllMenuItems.map((item) => [item.name, item.image])) as Record<
  string,
  number
>;

const sweetCrepeItemNames = new Set(sweetCrepes.map((item) => item.name));
const savoryCrepeItemNames = new Set(savoryCrepes.map((item) => item.name));
const bagelItemNames = new Set(bagels.map((item) => item.name));

const normalizeMenuItemName = (value: string) => {
  if (value.toLowerCase().includes('brulagel')) {
    return 'Creme Brulagel';
  }

  return value;
};

const parsePrice = (value: string) => Number.parseFloat(value.replace(/[^0-9.]/g, '')) || 0;

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function calculateRewardPoints(orderTotal: number) {
  return Math.max(0, Math.round(orderTotal * 10));
}

function formatPhoneNumber(value: string) {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 10);

  if (digitsOnly.length <= 3) {
    return digitsOnly;
  }

  if (digitsOnly.length <= 6) {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
  }

  return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
}

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
          {options.length === 0 ? (
            <ThemedText style={styles.dropdownEmptyText}>No options available</ThemedText>
          ) : (
            options.map((option) => (
              <Pressable
                key={option.value}
                style={({ pressed }) => [styles.dropdownOption, pressed && styles.dropdownOptionPressed]}
                onPress={() => onSelect(option.value)}>
                <ThemedText style={styles.dropdownOptionText}>{option.label}</ThemedText>
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

export default function FastPickupScreen() {
  const insets = useSafeAreaInsets();
  const { queuePendingGuestCheckout } = useAuth();
  const { cartCount, cartItems, subtotal, clearCart, getItemQuantity, toggleCartItem, incrementItem, decrementItem, removeItem, setItemSpecialInstructions } =
    useCart();

  const [menuSections, setMenuSections] = useState<MenuSection[]>(
    fallbackMenuSections.map((section) => ({ title: section.title, items: [...section.items] }))
  );
  const [isLoadingMenuItems, setIsLoadingMenuItems] = useState(false);
  const [menuItemsError, setMenuItemsError] = useState<string | null>(null);

  const [isCartModalVisible, setCartModalVisible] = useState(false);
  const [isCheckoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [openInstructionEditorsByKey, setOpenInstructionEditorsByKey] = useState<Record<string, boolean>>({});

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [isLoadingLocations, setLoadingLocations] = useState(false);
  const [locationsErrorMessage, setLocationsErrorMessage] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [pickupType, setPickupType] = useState<(typeof pickupOptions)[number]>('In Store');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'location' | 'pickup' | null>(null);

  const [isSubmittingOrder, setSubmittingOrder] = useState(false);
  const [orderErrorMessage, setOrderErrorMessage] = useState<string | null>(null);
  const [orderModalStage, setOrderModalStage] = useState<'hidden' | 'loading' | 'success'>('hidden');
  const [rewardPointsEarned, setRewardPointsEarned] = useState(0);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const badgeScale = useRef(new Animated.Value(1)).current;
  const previousCartCountRef = useRef<number | null>(null);

  const selectedItemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const visibleMenuSections = useMemo(() => menuSections.filter((section) => section.items.length > 0), [menuSections]);

  const locationOptions = useMemo<DropdownOption[]>(
    () =>
      locations.map((location) => ({
        value: String(location.id),
        label: location.address?.trim() || location.name?.trim() || `Location ${location.id}`,
      })),
    [locations]
  );

  const selectedLocationLabel = useMemo(
    () => locationOptions.find((option) => option.value === selectedLocationId)?.label ?? '',
    [locationOptions, selectedLocationId]
  );

  const phoneDigits = phoneNumber.replace(/\D/g, '');

  useEffect(() => {
    const previous = previousCartCountRef.current;
    previousCartCountRef.current = cartCount;

    if (previous === null || previous === cartCount) {
      return;
    }

    badgeScale.stopAnimation();
    badgeScale.setValue(1);
    Animated.sequence([
      Animated.timing(badgeScale, {
        toValue: 1.22,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(badgeScale, {
        toValue: 0.94,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(badgeScale, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [badgeScale, cartCount]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const validKeys = new Set(cartItems.map((item) => item.key));

    setOpenInstructionEditorsByKey((previous) => {
      let hasChanges = false;
      const next: Record<string, boolean> = {};

      Object.entries(previous).forEach(([itemKey, isOpen]) => {
        if (validKeys.has(itemKey)) {
          next[itemKey] = isOpen;
        } else {
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }, [cartItems]);

  useEffect(() => {
    let isMounted = true;

    const loadMenuItems = async () => {
      setIsLoadingMenuItems(true);
      setMenuItemsError(null);

      try {
        const apiItems = await menuItemsApi.list();
        if (!isMounted || apiItems.length === 0) {
          return;
        }

        const mappedItems: ApiDisplayMenuItem[] = apiItems.map((item: MenuItemDto) => {
          const normalizedName = normalizeMenuItemName(item.itemName);
          const fallbackImage = fallbackImageByName[normalizedName];

          return {
            name: normalizedName,
            description: item.description,
            price: `$${item.price.toFixed(2)}`,
            image: fallbackImage ?? require('@/assets/images/logo-round.png'),
            type: item.type,
          };
        });

        const drinksFromApi = mappedItems.filter((item) => item.type.toLowerCase() === 'drink');
        const foodsFromApi = mappedItems.filter((item) => item.type.toLowerCase() !== 'drink');
        const sweetFromApi = foodsFromApi.filter((item) => sweetCrepeItemNames.has(item.name));
        const savoryFromApi = foodsFromApi.filter((item) => savoryCrepeItemNames.has(item.name));
        const bagelsFromApi = foodsFromApi.filter((item) => bagelItemNames.has(item.name));
        const otherFoodsFromApi = foodsFromApi.filter(
          (item) =>
            !sweetCrepeItemNames.has(item.name) &&
            !savoryCrepeItemNames.has(item.name) &&
            !bagelItemNames.has(item.name)
        );

        setMenuSections([
          { title: 'Drinks', items: drinksFromApi },
          { title: 'Sweet Crepes', items: sweetFromApi },
          { title: 'Savory Crepes', items: [...savoryFromApi, ...otherFoodsFromApi] },
          { title: 'Bagels', items: bagelsFromApi },
        ]);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Unable to load menu items.';
        setMenuItemsError(message);
      } finally {
        if (isMounted) {
          setIsLoadingMenuItems(false);
        }
      }
    };

    void loadMenuItems();

    return () => {
      isMounted = false;
    };
  }, []);

  const clearOrderTimers = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const hideOrderModal = () => {
    clearOrderTimers();
    setOrderModalStage('hidden');
    setRewardPointsEarned(0);
  };

  const toggleInstructionEditor = (itemKey: string) => {
    setOpenInstructionEditorsByKey((previous) => ({
      ...previous,
      [itemKey]: !previous[itemKey],
    }));
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
      const message = error instanceof Error ? error.message : 'Unable to load locations.';
      setLocationsErrorMessage(message);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleOpenCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }

    setCartModalVisible(false);
    setCheckoutModalVisible(true);
    setOrderErrorMessage(null);
    setActiveDropdown(null);
    void fetchLocations();
  };

  const handlePlaceOrder = async () => {
    const requestStartedAt = Date.now();
    const showOrderError = (message: string) => {
      setOrderErrorMessage(message);
      Alert.alert('Unable to place order', message);
    };

    setActiveDropdown(null);

    if (isSubmittingOrder || cartItems.length === 0) {
      if (cartItems.length === 0) {
        showOrderError('Your cart is empty. Add items from the menu before ordering.');
      }
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      showOrderError('First name and last name are required.');
      return;
    }

    if (phoneDigits.length !== 10) {
      showOrderError('Enter a valid 10-digit phone number.');
      return;
    }

    if (!selectedLocationId) {
      showOrderError('Please select your location.');
      return;
    }

    if (!paymentMethod) {
      showOrderError('Please select a payment method.');
      return;
    }

    setSubmittingOrder(true);
    setOrderErrorMessage(null);
    clearOrderTimers();
    setCartModalVisible(false);
    setOrderModalStage('loading');
    setRewardPointsEarned(0);

    try {
      const selectedPaymentOption = paymentMethodOptions.find((option) => option.value === paymentMethod);
      const orderPayload = {
        locationId: Number(selectedLocationId),
        pickupType,
        paymentMethod: selectedPaymentOption?.label ?? paymentMethod,
        total: Number(subtotal.toFixed(2)),
        items: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice.toFixed(2)),
          specialInstructions:
            item.specialInstructions && item.specialInstructions.trim().length > 0
              ? item.specialInstructions.trim()
              : undefined,
        })),
      };
      let requiresAuthReplay = false;

      try {
        await ordersApi.create(orderPayload);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to place order.';
        const isUnauthorized = /unauthorized/i.test(message) || message.includes('401');
        if (!isUnauthorized) {
          throw error;
        }
        requiresAuthReplay = true;
      }

      const pointsToAdd = calculateRewardPoints(subtotal);
      queuePendingGuestCheckout({
        rewardPoints: pointsToAdd,
        orderDraft: requiresAuthReplay ? orderPayload : null,
      });

      const elapsedMs = Date.now() - requestStartedAt;
      if (elapsedMs < orderProcessingMinimumMs) {
        await new Promise((resolve) => setTimeout(resolve, orderProcessingMinimumMs - elapsedMs));
      }

      setOpenInstructionEditorsByKey({});
      clearCart();
      setRewardPointsEarned(pointsToAdd);
      setOrderModalStage('success');

      closeTimerRef.current = setTimeout(() => {
        setCheckoutModalVisible(false);
        hideOrderModal();
        router.replace('/(auth)/login');
        closeTimerRef.current = null;
      }, successRedirectDelayMs);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to place order.';
      showOrderError(message);
      setOrderModalStage('hidden');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top + 4) }]}>
        <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]} onPress={() => router.back()}>
          <ArrowLeft color={BrandColors.darkAccent} size={18} />
        </Pressable>

        <Image source={require('@/assets/images/logo-round.png')} style={styles.bannerLogo} contentFit="contain" />

        <Pressable
          style={({ pressed }) => [styles.cartBadge, pressed && styles.cartBadgePressed]}
          onPress={() => setCartModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Shopping cart">
          <ShoppingCart color={BrandColors.primary} size={20} />
          <Animated.View style={[styles.cartCountBadge, { transform: [{ scale: badgeScale }] }]}>
            <ThemedText style={styles.cartCountText}>{cartCount}</ThemedText>
          </Animated.View>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.title}>
          Fast Order
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Browse the full menu, add items with +, then continue to the same checkout flow.
        </ThemedText>

        <View style={styles.summaryCard}>
          <View style={styles.summaryCopy}>
            <ThemedText style={styles.summaryTitle}>
              {selectedItemCount} item{selectedItemCount === 1 ? '' : 's'} in cart
            </ThemedText>
            <ThemedText style={styles.summaryValue}>{formatCurrency(subtotal)}</ThemedText>
          </View>
          <Pressable
            style={({ pressed }) => [styles.viewCartButton, pressed && styles.viewCartButtonPressed]}
            onPress={() => setCartModalVisible(true)}>
            <ShoppingCart color="#ffffff" size={16} />
            <ThemedText style={styles.viewCartButtonText}>View Cart</ThemedText>
          </Pressable>
        </View>

        {isLoadingMenuItems ? <ThemedText style={styles.helperText}>Loading menu items...</ThemedText> : null}
        {menuItemsError ? <ThemedText style={styles.errorText}>{menuItemsError}</ThemedText> : null}

        <View style={styles.sectionList}>
          {visibleMenuSections.map((section) => (
            <View key={section.title} style={styles.sectionBlock}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                {section.title}
              </ThemedText>

              <View style={styles.list}>
                {section.items.map((item) => {
                  const quantity = getItemQuantity(item.name);
                  const isSelected = quantity > 0;
                  return (
                    <View key={item.name} style={styles.itemCard}>
                      <View style={styles.itemRow}>
                        <View style={styles.itemImageWrap}>
                          <Image source={item.image} style={styles.itemImage} contentFit="cover" transition={120} />
                          {quantity > 0 ? (
                            <View style={styles.itemQuantityBadge}>
                              <ThemedText style={styles.itemQuantityBadgeText}>x{quantity}</ThemedText>
                            </View>
                          ) : null}
                        </View>
                        <View style={styles.itemDetails}>
                          <View style={styles.itemTopRow}>
                            <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                            <ThemedText style={styles.itemPrice}>{item.price}</ThemedText>
                          </View>
                          <ThemedText style={styles.itemDescription}>{item.description}</ThemedText>
                          <AddToCartButton
                            style={styles.itemToggleButton}
                            pressedStyle={styles.itemToggleButtonPressed}
                            isSelected={isSelected}
                            onPress={() =>
                              toggleCartItem({
                                key: item.name,
                                name: item.name,
                                unitPrice: parsePrice(item.price),
                                image: item.image,
                              })
                            }
                            accessibilityLabel={`${isSelected ? 'Add another' : 'Add'} ${item.name} to cart`}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

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
                        <View style={styles.cartItemActionGroup}>
                          <Pressable
                            style={({ pressed }) => [
                              styles.cartItemInstructionButton,
                              item.specialInstructions && item.specialInstructions.trim().length > 0
                                ? styles.cartItemInstructionButtonActive
                                : null,
                              pressed && styles.modalActionPressed,
                            ]}
                            onPress={() => toggleInstructionEditor(item.key)}
                            accessibilityRole="button"
                            accessibilityLabel={`Add special instructions for ${item.name}`}>
                            <NotebookPen color={BrandColors.primary} size={16} />
                          </Pressable>
                          <Pressable style={styles.removeItemButton} onPress={() => removeItem(item.key)}>
                            <X color="#9b2d2d" size={16} />
                          </Pressable>
                        </View>
                      </View>

                      {openInstructionEditorsByKey[item.key] ? (
                        <TextInput
                          value={item.specialInstructions ?? ''}
                          onChangeText={(value) => setItemSpecialInstructions(item.key, value)}
                          placeholder="Add special instructions"
                          placeholderTextColor="#8a827a"
                          style={styles.specialInstructionsInput}
                          editable={!isSubmittingOrder}
                          maxLength={300}
                        />
                      ) : item.specialInstructions && item.specialInstructions.trim().length > 0 ? (
                        <ThemedText style={styles.specialInstructionsPreview}>{item.specialInstructions.trim()}</ThemedText>
                      ) : null}

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
                                specialInstructions: item.specialInstructions,
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
              <ThemedText style={styles.subtotalLabel}>Total</ThemedText>
              <ThemedText style={styles.subtotalValue}>{formatCurrency(subtotal)}</ThemedText>
            </View>

            <View style={styles.modalActionRow}>
              <Pressable
                style={({ pressed }) => [styles.keepShoppingButton, pressed && styles.modalActionPressed]}
                onPress={() => setCartModalVisible(false)}>
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

      <Modal
        visible={isCheckoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (orderModalStage !== 'hidden') {
            return;
          }
          setCheckoutModalVisible(false);
          setActiveDropdown(null);
        }}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              if (orderModalStage !== 'hidden') {
                return;
              }
              setCheckoutModalVisible(false);
              setActiveDropdown(null);
            }}
          />
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={[styles.modalCard, styles.checkoutModalCard]}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Checkout</ThemedText>
                <Pressable
                  style={styles.modalCloseButton}
                  disabled={orderModalStage !== 'hidden'}
                  onPress={() => {
                    if (orderModalStage !== 'hidden') {
                      return;
                    }
                    setCheckoutModalVisible(false);
                    setActiveDropdown(null);
                  }}>
                  <X color={BrandColors.darkAccent} size={18} />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.checkoutBody}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag">
                <View style={styles.checkoutItemsBlock}>
                  <ThemedText style={styles.checkoutFieldLabel}>Ready for Checkout</ThemedText>
                  {cartItems.length === 0 ? (
                    <ThemedText style={styles.checkoutItemsEmpty}>No items ready for checkout.</ThemedText>
                  ) : (
                    <View style={styles.checkoutItemsList}>
                      {cartItems.map((item) => (
                        <View key={item.key} style={styles.checkoutItemRow}>
                          <View style={styles.checkoutItemNameWrap}>
                            <ThemedText numberOfLines={1} style={styles.checkoutItemName}>
                              {item.name}
                            </ThemedText>
                            {item.specialInstructions && item.specialInstructions.trim().length > 0 ? (
                              <ThemedText numberOfLines={2} style={styles.checkoutItemInstructions}>
                                {item.specialInstructions.trim()}
                              </ThemedText>
                            ) : null}
                          </View>
                          <ThemedText style={styles.checkoutItemQuantity}>x{item.quantity}</ThemedText>
                          <ThemedText style={styles.checkoutItemPrice}>
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

              <View style={styles.checkoutTotalRow}>
                <ThemedText style={styles.checkoutTotalLabel}>Your order total:</ThemedText>
                <ThemedText style={styles.checkoutTotalValue}>{formatCurrency(subtotal)}</ThemedText>
              </View>

              <View style={styles.twoColumnRow}>
                <View style={[styles.fieldGroup, styles.twoColumnField]}>
                  <ThemedText style={styles.checkoutFieldLabel}>First Name</ThemedText>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    editable={!isSubmittingOrder}
                    placeholder="First name"
                    placeholderTextColor={BrandColors.darkAccent}
                    style={styles.input}
                  />
                </View>

                <View style={[styles.fieldGroup, styles.twoColumnField]}>
                  <ThemedText style={styles.checkoutFieldLabel}>Last Name</ThemedText>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    editable={!isSubmittingOrder}
                    placeholder="Last name"
                    placeholderTextColor={BrandColors.darkAccent}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <ThemedText style={styles.checkoutFieldLabel}>Phone Number</ThemedText>
                <TextInput
                  value={phoneNumber}
                  onChangeText={(value) => setPhoneNumber(formatPhoneNumber(value))}
                  keyboardType="phone-pad"
                  maxLength={12}
                  editable={!isSubmittingOrder}
                  placeholder="555-123-4567"
                  placeholderTextColor={BrandColors.darkAccent}
                  style={styles.input}
                />
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
                  (isSubmittingOrder || cartItems.length === 0) && styles.disabledButton,
                ]}
                disabled={isSubmittingOrder || cartItems.length === 0}
                onPress={() => {
                  setActiveDropdown(null);
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

              {orderModalStage !== 'hidden' ? (
                <View style={styles.checkoutStatusOverlay}>
                  {orderModalStage === 'loading' ? (
                    <View style={styles.orderModalStateWrap}>
                      <ActivityIndicator color={BrandColors.primary} size="large" />
                      <ThemedText style={styles.loadingText}>Processing order...</ThemedText>
                    </View>
                  ) : null}

                  {orderModalStage === 'success' ? (
                    <View style={styles.orderModalStateWrap}>
                      <CheckCircle2 color={BrandColors.primary} size={88} strokeWidth={2.35} />
                      <ThemedText style={styles.successText}>Order processed successfully</ThemedText>
                      <ThemedText style={styles.successDetailText}>
                        A copy of your receipt has been texted to you.
                      </ThemedText>
                      <ThemedText style={styles.successDetailText}>
                        Redirecting to sign in to claim {rewardPointsEarned} points...
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BrandColors.secondary,
  },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.accent,
  },
  backButton: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    opacity: 0.84,
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
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 12,
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
    marginBottom: 14,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  summaryCopy: {
    flex: 1,
    gap: 2,
  },
  summaryTitle: {
    color: BrandColors.darkAccent,
    fontWeight: '700',
    fontSize: 14,
  },
  summaryValue: {
    color: BrandColors.primary,
    fontWeight: '700',
    fontSize: 18,
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BrandColors.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  viewCartButtonPressed: {
    opacity: 0.86,
  },
  viewCartButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  helperText: {
    color: BrandColors.text,
    marginBottom: 12,
  },
  errorText: {
    color: '#9b2d2d',
    marginBottom: 8,
    fontSize: 12,
    lineHeight: 16,
  },
  sectionList: {
    gap: 16,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionTitle: {
    color: BrandColors.darkAccent,
  },
  list: {
    gap: 10,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  itemImageWrap: {
    position: 'relative',
    width: 108,
    height: 108,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },
  itemQuantityBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    minWidth: 26,
    height: 18,
    borderRadius: 999,
    paddingHorizontal: 6,
    backgroundColor: '#0d8a66',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemQuantityBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  itemDetails: {
    flex: 1,
    gap: 4,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  itemName: {
    color: BrandColors.darkAccent,
    fontWeight: '700',
    flex: 1,
  },
  itemPrice: {
    color: BrandColors.primary,
    fontWeight: '700',
  },
  itemDescription: {
    color: BrandColors.text,
    fontSize: 12,
    lineHeight: 17,
  },
  itemToggleButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
    width: 28,
    height: 28,
  },
  itemToggleButtonPressed: {
    opacity: 0.82,
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
  cartItemActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cartItemName: {
    flex: 1,
    color: BrandColors.darkAccent,
    fontWeight: '700',
    lineHeight: 20,
  },
  cartItemInstructionButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  cartItemInstructionButtonActive: {
    backgroundColor: '#dcf5ea',
  },
  removeItemButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialInstructionsInput: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: BrandColors.darkAccent,
    backgroundColor: '#fffdf9',
  },
  specialInstructionsPreview: {
    color: BrandColors.text,
    fontSize: 12,
    lineHeight: 16,
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
  checkoutItemsBlock: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 7,
  },
  checkoutItemsEmpty: {
    color: BrandColors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  checkoutItemsList: {
    gap: 6,
    maxHeight: 150,
  },
  checkoutItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkoutItemNameWrap: {
    flex: 1,
    gap: 2,
  },
  checkoutItemName: {
    color: BrandColors.darkAccent,
    fontSize: 13,
    lineHeight: 18,
  },
  checkoutItemInstructions: {
    color: BrandColors.text,
    fontSize: 11,
    lineHeight: 15,
  },
  checkoutItemQuantity: {
    color: BrandColors.text,
    fontSize: 12,
    lineHeight: 16,
  },
  checkoutItemPrice: {
    color: BrandColors.primary,
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 18,
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
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldGroup: {
    gap: 6,
  },
  twoColumnField: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    color: BrandColors.darkAccent,
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
  dropdownEmptyText: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: '#8a827a',
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
  checkoutStatusOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  orderModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  orderModalCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  orderModalStateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  successText: {
    color: BrandColors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  successDetailText: {
    color: BrandColors.text,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
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
  claimGate: {
    width: '100%',
    gap: 6,
    alignItems: 'center',
  },
  signupCtaText: {
    color: BrandColors.text,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 19,
  },
  claimGateCopy: {
    color: BrandColors.text,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  claimActionRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: 2,
  },
  signupButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  secondaryClaimButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BrandColors.primary,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  signupButtonPressed: {
    opacity: 0.88,
  },
  signupButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryClaimButtonText: {
    color: BrandColors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  rewardsCloseButton: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  rewardsCloseButtonPressed: {
    opacity: 0.75,
  },
  rewardsCloseButtonText: {
    color: BrandColors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
