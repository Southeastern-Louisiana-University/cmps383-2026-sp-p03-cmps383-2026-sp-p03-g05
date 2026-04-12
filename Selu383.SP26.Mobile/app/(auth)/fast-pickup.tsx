import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ArrowLeft, Check, CheckCircle2, ChevronDown, Square, SquareCheck, Utensils, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { BrandColors } from '@/constants/theme';
import {
  locationsApi,
  menuItemsApi,
  ordersApi,
  usersApi,
  type FastOrderUserLookupDto,
  type LocationDto,
  type MenuItemDto,
} from '@/lib/api';

const pickupOptions = ['In Store', 'Drive Through'] as const;
const rewardsCounterDurationMs = 1200;

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
  menuItemId?: number;
  name: string;
  description: string;
  price: string;
  image: number;
  type: string;
};

type MenuSection = {
  title: string;
  items: DisplayMenuItem[];
};

type SelectedMenuItem = {
  menuItemId?: number;
  name: string;
  quantity: number;
  unitPrice: number;
  image: number;
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
    type: 'Drink',
  },
  {
    name: 'Supernova',
    description:
      'A unique coffee blend with a complex, balanced profile and subtle sweetness. Delicious as espresso or paired with milk.',
    price: '$7.95',
    image: require('@/assets/images/supernova.png'),
    type: 'Drink',
  },
  {
    name: 'Roaring Frappe',
    description:
      'Cold brew, milk, and ice blended together with a signature syrup or flavor, topped with whipped cream.',
    price: '$6.20',
    image: require('@/assets/images/roaring frappe.png'),
    type: 'Drink',
  },
  {
    name: 'Black & White Cold Brew',
    description: 'Cold brew made with both dark and light roast beans, finished with a drizzle of condensed milk.',
    price: '$5.15',
    image: require('@/assets/images/black white cold brew.png'),
    type: 'Drink',
  },
  {
    name: 'Strawberry Limeade',
    description: 'Fresh lime juice blended with strawberry puree for a refreshing, tangy drink.',
    price: '$5.00',
    image: require('@/assets/images/strawberry limeade.png'),
    type: 'Drink',
  },
  {
    name: 'Shaken Lemonade',
    description: 'Fresh lemon juice and simple syrup vigorously shaken for a bright, refreshing lemonade.',
    price: '$5.00',
    image: require('@/assets/images/shaken lemonade.png'),
    type: 'Drink',
  },
];

const sweetCrepes: DisplayMenuItem[] = [
  {
    name: 'Mannino Honey Crepe',
    description: 'A sweet crepe drizzled with Mannino honey and topped with mixed berries.',
    price: '$10.00',
    image: require('@/assets/images/mannino honey crepe.png'),
    type: 'Food',
  },
  {
    name: 'Downtowner',
    description: "Strawberries and bananas wrapped in a crepe, finished with Nutella and Hershey's chocolate sauce.",
    price: '$10.75',
    image: require('@/assets/images/downtowner.png'),
    type: 'Food',
  },
  {
    name: 'Funky Monkey',
    description: 'Nutella and bananas wrapped in a crepe, served with whipped cream.',
    price: '$10.00',
    image: require('@/assets/images/funky monkey.png'),
    type: 'Food',
  },
  {
    name: "Le S'mores",
    description: 'Marshmallow cream and chocolate sauce inside a crepe, topped with graham cracker crumbs.',
    price: '$9.50',
    image: require('@/assets/images/le smores.png'),
    type: 'Food',
  },
  {
    name: 'Strawberry Fields',
    description: "Fresh strawberries with Hershey's chocolate drizzle and a dusting of powdered sugar.",
    price: '$10.00',
    image: require('@/assets/images/strawberry fields.png'),
    type: 'Food',
  },
  {
    name: 'Bonjour',
    description: 'A sweet crepe filled with syrup and cinnamon, finished with powdered sugar.',
    price: '$8.50',
    image: require('@/assets/images/bonjour.png'),
    type: 'Food',
  },
  {
    name: 'Banana Foster',
    description: 'Bananas with cinnamon in a crepe, topped with a generous drizzle of caramel sauce.',
    price: '$8.95',
    image: require('@/assets/images/banana foster.png'),
    type: 'Food',
  },
];

const savoryCrepes: DisplayMenuItem[] = [
  {
    name: "Matt's Scrambled Eggs",
    description: 'Scrambled eggs and melted mozzarella cheese wrapped in a crepe.',
    price: '$5.00',
    image: require('@/assets/images/matts scrambled eggs.png'),
    type: 'Food',
  },
  {
    name: 'Meanie Mushroom',
    description: 'Sauteed mushrooms, mozzarella, tomato, and bacon inside a delicate crepe.',
    price: '$10.50',
    image: require('@/assets/images/meanie mushroom.png'),
    type: 'Food',
  },
  {
    name: 'Turkey Club',
    description: 'Sliced turkey, bacon, spinach, and tomato wrapped in a savory crepe.',
    price: '$10.50',
    image: require('@/assets/images/turkey club.png'),
    type: 'Food',
  },
  {
    name: 'Green Machine',
    description: 'Spinach, artichokes, and mozzarella cheese inside a fresh crepe.',
    price: '$10.00',
    image: require('@/assets/images/green machine.png'),
    type: 'Food',
  },
  {
    name: 'Perfect Pair',
    description: 'A unique combination of bacon and Nutella wrapped in a crepe.',
    price: '$10.00',
    image: require('@/assets/images/perfect pair.png'),
    type: 'Food',
  },
  {
    name: 'Crepe Fromage',
    description: 'A savory crepe filled with a blend of cheeses.',
    price: '$8.00',
    image: require('@/assets/images/crepe fromage.png'),
    type: 'Food',
  },
  {
    name: 'Farmers Market Crepe',
    description: 'Turkey, spinach, and mozzarella wrapped in a savory crepe.',
    price: '$10.50',
    image: require('@/assets/images/farmers market.png'),
    type: 'Food',
  },
];

const bagels: DisplayMenuItem[] = [
  {
    name: 'Travis Special',
    description: 'Cream cheese, salmon, spinach, and a fried egg served on a freshly toasted bagel.',
    price: '$14.00',
    image: require('@/assets/images/travis special.png'),
    type: 'Food',
  },
  {
    name: 'Creme Brulagel',
    description: 'A toasted bagel with a caramelized sugar crust inspired by creme brulee, served with cream cheese.',
    price: '$8.00',
    image: require('@/assets/images/creme brulagle.png'),
    type: 'Food',
  },
  {
    name: 'The Fancy One',
    description: 'Smoked salmon, cream cheese, and fresh dill on a toasted bagel.',
    price: '$13.00',
    image: require('@/assets/images/fancy one.png'),
    type: 'Food',
  },
  {
    name: 'Breakfast Bagel',
    description: 'A toasted bagel with your choice of ham, bacon, or sausage, a fried egg, and cheddar cheese.',
    price: '$9.50',
    image: require('@/assets/images/breakfast bagel.png'),
    type: 'Food',
  },
  {
    name: 'The Classic',
    description: 'A toasted bagel with cream cheese.',
    price: '$5.25',
    image: require('@/assets/images/classic.png'),
    type: 'Food',
  },
];

const fallbackMenuSections: MenuSection[] = [
  { title: 'Drinks', items: drinks },
  { title: 'Sweet Crepes', items: sweetCrepes },
  { title: 'Savory Crepes', items: savoryCrepes },
  { title: 'Bagels', items: bagels },
];

const fallbackAllItems = [...drinks, ...sweetCrepes, ...savoryCrepes, ...bagels];
const fallbackImageByName = Object.fromEntries(fallbackAllItems.map((item) => [item.name, item.image])) as Record<
  string,
  number
>;
const sweetCrepeItemNames = new Set(sweetCrepes.map((item) => item.name));
const savoryCrepeItemNames = new Set(savoryCrepes.map((item) => item.name));
const bagelItemNames = new Set(bagels.map((item) => item.name));

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

function normalizeMenuItemName(value: string) {
  if (value.toLowerCase().includes('brulagel')) {
    return 'Creme Brulagel';
  }

  return value;
}

function parsePrice(value: string) {
  return Number.parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function calculateRewardPoints(orderTotal: number) {
  return Math.max(0, Math.round(orderTotal * 10));
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
    <View style={styles.fieldBlock}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <Pressable
        style={({ pressed }) => [
          styles.dropdownTrigger,
          disabled && styles.dropdownTriggerDisabled,
          pressed && !disabled && styles.dropdownTriggerPressed,
        ]}
        onPress={onToggle}
        disabled={disabled}
        accessibilityRole="button">
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
  const { signIn, refreshSession } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [locationsErrorMessage, setLocationsErrorMessage] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState('');

  const [pickupType, setPickupType] = useState<(typeof pickupOptions)[number]>('In Store');
  const [activeDropdown, setActiveDropdown] = useState<'location' | 'pickup' | null>(null);

  const [menuSections, setMenuSections] = useState<MenuSection[]>(
    fallbackMenuSections.map((section) => ({ title: section.title, items: [...section.items] }))
  );
  const [isLoadingMenuItems, setIsLoadingMenuItems] = useState(false);
  const [menuItemsError, setMenuItemsError] = useState<string | null>(null);
  const [isMenuModalVisible, setMenuModalVisible] = useState(false);

  const [selectedMenuItems, setSelectedMenuItems] = useState<Record<string, SelectedMenuItem>>({});
  const [paymentMethod, setPaymentMethod] = useState('');

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderErrorMessage, setOrderErrorMessage] = useState<string | null>(null);
  const [orderModalStage, setOrderModalStage] = useState<'hidden' | 'loading' | 'success' | 'rewards'>('hidden');
  const [rewardPointsEarned, setRewardPointsEarned] = useState(0);
  const [rewardCounter, setRewardCounter] = useState(0);
  const [matchedLookupUser, setMatchedLookupUser] = useState<FastOrderUserLookupDto | null>(null);
  const [claimUserName, setClaimUserName] = useState('');
  const [claimPassword, setClaimPassword] = useState('');
  const [claimErrorMessage, setClaimErrorMessage] = useState<string | null>(null);
  const [isClaimingPoints, setIsClaimingPoints] = useState(false);
  const [pointsClaimedMessage, setPointsClaimedMessage] = useState<string | null>(null);

  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rewardCounterTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const selectedMenuItemsList = useMemo(() => Object.values(selectedMenuItems), [selectedMenuItems]);
  const selectedItemCount = useMemo(
    () => selectedMenuItemsList.reduce((sum, item) => sum + item.quantity, 0),
    [selectedMenuItemsList]
  );
  const orderTotal = useMemo(
    () => selectedMenuItemsList.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [selectedMenuItemsList]
  );
  const visibleMenuSections = useMemo(
    () => menuSections.filter((section) => section.items.length > 0),
    [menuSections]
  );

  const phoneDigits = phoneNumber.replace(/\D/g, '');
  const canSubmitOrder =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    phoneDigits.length === 10 &&
    !!selectedLocationId &&
    selectedItemCount > 0 &&
    !!paymentMethod &&
    !isSubmittingOrder;

  const clearModalTimers = () => {
    if (stageTimerRef.current) {
      clearTimeout(stageTimerRef.current);
      stageTimerRef.current = null;
    }

    if (rewardCounterTimerRef.current) {
      clearInterval(rewardCounterTimerRef.current);
      rewardCounterTimerRef.current = null;
    }
  };

  const hideOrderModal = () => {
    clearModalTimers();
    setOrderModalStage('hidden');
    setRewardPointsEarned(0);
    setRewardCounter(0);
    setMatchedLookupUser(null);
    setClaimUserName('');
    setClaimPassword('');
    setClaimErrorMessage(null);
    setIsClaimingPoints(false);
    setPointsClaimedMessage(null);
  };

  const startRewardCounterAnimation = (pointsToAdd: number) => {
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

  useEffect(() => {
    return () => {
      clearModalTimers();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadLocations = async () => {
      setIsLoadingLocations(true);
      setLocationsErrorMessage(null);

      try {
        const locationResults = await locationsApi.list();
        if (!isMounted) {
          return;
        }

        setLocations(locationResults);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Unable to load locations.';
        setLocationsErrorMessage(message);
      } finally {
        if (isMounted) {
          setIsLoadingLocations(false);
        }
      }
    };

    void loadLocations();

    return () => {
      isMounted = false;
    };
  }, []);

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

        const mappedItems: DisplayMenuItem[] = apiItems.map((item: MenuItemDto) => {
          const normalizedName = normalizeMenuItemName(item.itemName);
          const fallbackImage = fallbackImageByName[normalizedName];

          return {
            menuItemId: item.id,
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
            !sweetCrepeItemNames.has(item.name) && !savoryCrepeItemNames.has(item.name) && !bagelItemNames.has(item.name)
        );

        const nextSections: MenuSection[] = [
          { title: 'Drinks', items: drinksFromApi },
          { title: 'Sweet Crepes', items: sweetFromApi },
          { title: 'Savory Crepes', items: [...savoryFromApi, ...otherFoodsFromApi] },
          { title: 'Bagels', items: bagelsFromApi },
        ];

        if (nextSections.some((section) => section.items.length > 0)) {
          setMenuSections(nextSections);
        }
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

  const toggleMenuItemSelection = (item: DisplayMenuItem) => {
    setSelectedMenuItems((current) => {
      if (current[item.name]) {
        const next = { ...current };
        delete next[item.name];
        return next;
      }

      return {
        ...current,
        [item.name]: {
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: 1,
          unitPrice: parsePrice(item.price),
          image: item.image,
        },
      };
    });
    setOrderErrorMessage(null);
  };

  const handleSignInAndClaimPoints = async () => {
    if (isClaimingPoints || !matchedLookupUser) {
      return;
    }

    if (!claimPassword.trim()) {
      setClaimErrorMessage('Password is required to claim points.');
      return;
    }

    setIsClaimingPoints(true);
    setClaimErrorMessage(null);
    setPointsClaimedMessage(null);

    try {
      const loggedInUser = await signIn(matchedLookupUser.userName, claimPassword);

      if (rewardPointsEarned > 0) {
        await usersApi.awardRewards(loggedInUser.id, { pointsToAdd: rewardPointsEarned });
      }

      await refreshSession();
      setPointsClaimedMessage('Points claimed successfully.');

      if (stageTimerRef.current) {
        clearTimeout(stageTimerRef.current);
      }

      stageTimerRef.current = setTimeout(() => {
        hideOrderModal();
        router.replace('/(app)/home');
      }, 900);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in and claim points.';
      setClaimErrorMessage(message);
    } finally {
      setIsClaimingPoints(false);
    }
  };

  const handleOrder = async () => {
    if (isSubmittingOrder) {
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setOrderErrorMessage('First name and last name are required.');
      return;
    }

    if (phoneDigits.length !== 10) {
      setOrderErrorMessage('Enter a valid 10-digit phone number.');
      return;
    }

    if (!selectedLocationId) {
      setOrderErrorMessage('Please select your location.');
      return;
    }

    if (selectedMenuItemsList.length === 0) {
      setOrderErrorMessage('Please select at least one menu item.');
      return;
    }

    if (!paymentMethod) {
      setOrderErrorMessage('Please select a payment method.');
      return;
    }

    setIsSubmittingOrder(true);
    setOrderErrorMessage(null);
    clearModalTimers();
    setOrderModalStage('loading');
    setRewardPointsEarned(0);
    setRewardCounter(0);
    setMatchedLookupUser(null);
    setClaimUserName('');
    setClaimPassword('');
    setClaimErrorMessage(null);
    setPointsClaimedMessage(null);

    try {
      let lookupMatch: FastOrderUserLookupDto | null = null;
      try {
        lookupMatch = await usersApi.lookupByProfile({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber,
        });
      } catch {
        lookupMatch = null;
      }

      const selectedPaymentOption = paymentMethodOptions.find((option) => option.value === paymentMethod);

      try {
        await ordersApi.create({
          locationId: Number(selectedLocationId),
          pickupType,
          paymentMethod: selectedPaymentOption?.label ?? paymentMethod,
          total: Number(orderTotal.toFixed(2)),
          items: selectedMenuItemsList.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice.toFixed(2)),
          })),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to place order.';
        const isUnauthorized = /unauthorized/i.test(message) || message.includes('401');
        if (!isUnauthorized) {
          throw error;
        }
      }

      const pointsToAdd = calculateRewardPoints(orderTotal);
      setRewardPointsEarned(pointsToAdd);
      setMatchedLookupUser(lookupMatch);
      setClaimUserName(lookupMatch?.userName ?? '');
      setClaimPassword('');
      setClaimErrorMessage(null);
      setPointsClaimedMessage(null);
      setOrderModalStage('success');
      setMenuModalVisible(false);
      setSelectedMenuItems({});
      setPaymentMethod('');
      setActiveDropdown(null);

      stageTimerRef.current = setTimeout(() => {
        setOrderModalStage('rewards');
        startRewardCounterAnimation(pointsToAdd);
        stageTimerRef.current = null;
      }, 900);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to place order.';
      setOrderErrorMessage(message);
      setOrderModalStage('hidden');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]} onPress={() => router.back()}>
          <ArrowLeft color={BrandColors.darkAccent} size={18} />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </Pressable>

        <ThemedText type="title" style={styles.title}>
          Fast Order
        </ThemedText>
        <ThemedText style={styles.subtitle}>Build your order quickly and checkout in one flow.</ThemedText>

        <View style={styles.card}>
          <View style={styles.twoColumnRow}>
            <View style={[styles.fieldGroup, styles.twoColumnField]}>
              <ThemedText style={styles.fieldLabel}>First Name</ThemedText>
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
              <ThemedText style={styles.fieldLabel}>Last Name</ThemedText>
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
            <ThemedText style={styles.fieldLabel}>Phone Number</ThemedText>
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

          <DropdownField
            label="Select your location"
            valueLabel={selectedLocationLabel}
            placeholder={isLoadingLocations ? 'Loading locations...' : 'Choose location'}
            options={locationOptions}
            isOpen={activeDropdown === 'location'}
            disabled={isLoadingLocations || locationOptions.length === 0 || isSubmittingOrder}
            onToggle={() => setActiveDropdown((current) => (current === 'location' ? null : 'location'))}
            onSelect={(value) => {
              setSelectedLocationId(value);
              setActiveDropdown(null);
            }}
          />
          {locationsErrorMessage ? <ThemedText style={styles.errorText}>{locationsErrorMessage}</ThemedText> : null}

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

          <View style={styles.fieldBlock}>
            <ThemedText style={styles.fieldLabel}>Menu</ThemedText>
            <Pressable
              style={({ pressed }) => [styles.viewMenuButton, pressed && styles.viewMenuButtonPressed]}
              onPress={() => {
                setActiveDropdown(null);
                setMenuModalVisible(true);
              }}
              accessibilityRole="button">
              <Utensils color={BrandColors.primary} size={16} />
              <ThemedText style={styles.viewMenuButtonText}>View Menu</ThemedText>
            </Pressable>
            <ThemedText style={styles.helperText}>
              {selectedItemCount > 0
                ? `${selectedItemCount} item${selectedItemCount === 1 ? '' : 's'} selected`
                : 'No items selected yet.'}
            </ThemedText>
            {menuItemsError ? <ThemedText style={styles.errorText}>{menuItemsError}</ThemedText> : null}
          </View>

          <View style={styles.totalRow}>
            <ThemedText style={styles.totalLabel}>Total</ThemedText>
            <ThemedText style={styles.totalValue}>{formatCurrency(orderTotal)}</ThemedText>
          </View>

          <View style={styles.fieldBlock}>
            <ThemedText style={styles.fieldLabel}>Payment</ThemedText>
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
                        <Check color="#ffffff" size={12} />
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
              pressed && styles.orderButtonPressed,
              !canSubmitOrder && styles.orderButtonDisabled,
            ]}
            disabled={!canSubmitOrder}
            onPress={() => void handleOrder()}>
            <ThemedText style={styles.orderButtonText}>{isSubmittingOrder ? 'Placing order...' : 'Order'}</ThemedText>
          </Pressable>

          {orderErrorMessage ? <ThemedText style={styles.errorText}>{orderErrorMessage}</ThemedText> : null}
        </View>
      </ScrollView>

      <Modal visible={isMenuModalVisible} transparent animationType="fade" onRequestClose={() => setMenuModalVisible(false)}>
        <View style={styles.menuModalOverlay}>
          <Pressable style={styles.menuModalBackdrop} onPress={() => setMenuModalVisible(false)} />
          <View style={styles.menuModalCard}>
            <View style={styles.menuModalHeader}>
              <ThemedText type="subtitle" style={styles.menuModalTitle}>
                Menu
              </ThemedText>
              <Pressable style={styles.menuCloseButton} onPress={() => setMenuModalVisible(false)}>
                <X color={BrandColors.darkAccent} size={18} />
              </Pressable>
            </View>

            {isLoadingMenuItems ? (
              <View style={styles.menuLoadingRow}>
                <ActivityIndicator color={BrandColors.primary} />
                <ThemedText style={styles.loadingText}>Loading menu items...</ThemedText>
              </View>
            ) : (
              <ScrollView
                style={styles.menuModalBody}
                contentContainerStyle={styles.menuModalBodyContent}
                showsVerticalScrollIndicator={false}>
                {visibleMenuSections.length === 0 ? (
                  <ThemedText style={styles.menuEmptyText}>
                    {menuItemsError ?? 'No menu items available right now.'}
                  </ThemedText>
                ) : (
                  visibleMenuSections.map((section) => (
                    <View key={section.title} style={styles.sectionBlock}>
                      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                        {section.title}
                      </ThemedText>

                      <View style={styles.sectionList}>
                        {section.items.map((item) => {
                          const isSelected = !!selectedMenuItems[item.name];

                          return (
                            <View key={item.name} style={styles.itemCard}>
                              <View style={styles.itemRow}>
                                <Image source={item.image} style={styles.itemImage} contentFit="cover" transition={120} />
                                <View style={styles.itemDetails}>
                                  <View style={styles.itemTopRow}>
                                    <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                                    <ThemedText style={styles.itemPrice}>{item.price}</ThemedText>
                                  </View>
                                  <ThemedText style={styles.itemDescription}>{item.description}</ThemedText>
                                  <Pressable
                                    style={({ pressed }) => [styles.itemToggleButton, pressed && styles.itemToggleButtonPressed]}
                                    onPress={() => toggleMenuItemSelection(item)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${isSelected ? 'Remove' : 'Add'} ${item.name} ${isSelected ? 'from' : 'to'} order`}>
                                    {isSelected ? (
                                      <SquareCheck color={BrandColors.primary} size={20} />
                                    ) : (
                                      <Square color={BrandColors.primary} size={20} />
                                    )}
                                  </Pressable>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            <Pressable style={({ pressed }) => [styles.menuDoneButton, pressed && styles.menuDoneButtonPressed]} onPress={() => setMenuModalVisible(false)}>
              <ThemedText style={styles.menuDoneButtonText}>Done</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={orderModalStage !== 'hidden'} transparent animationType="fade" onRequestClose={hideOrderModal}>
        <View style={styles.orderModalOverlay}>
          <View style={styles.orderModalCard}>
            {orderModalStage === 'loading' ? (
              <View style={styles.orderModalStateWrap}>
                <ActivityIndicator color={BrandColors.primary} size="large" />
                <ThemedText style={styles.loadingText}>Placing order...</ThemedText>
              </View>
            ) : null}

            {orderModalStage === 'success' ? (
              <View style={styles.orderModalStateWrap}>
                <CheckCircle2 color={BrandColors.primary} size={72} strokeWidth={2.25} />
                <ThemedText style={styles.successText}>Success</ThemedText>
              </View>
            ) : null}

            {orderModalStage === 'rewards' ? (
              <View style={styles.orderModalStateWrap}>
                <ThemedText style={styles.rewardsHeaderText}>Contrats! you earned rewards points!</ThemedText>
                <View style={styles.rewardsWheel}>
                  <View style={styles.rewardsWheelInner}>
                    <ThemedText style={styles.rewardsWheelValue}>{rewardCounter}</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.rewardsEarnedText}>+{rewardPointsEarned} points</ThemedText>
                {matchedLookupUser ? (
                  <>
                    <ThemedText style={styles.signupCtaText}>Sign in to claim your points.</ThemedText>
                    <View style={styles.claimForm}>
                      <View style={styles.fieldGroup}>
                        <ThemedText style={styles.claimFieldLabel}>User Name</ThemedText>
                        <TextInput
                          value={claimUserName}
                          editable={false}
                          selectTextOnFocus={false}
                          style={[styles.claimInput, styles.claimInputDisabled]}
                        />
                      </View>
                      <View style={styles.fieldGroup}>
                        <ThemedText style={styles.claimFieldLabel}>Password</ThemedText>
                        <TextInput
                          value={claimPassword}
                          onChangeText={setClaimPassword}
                          editable={!isClaimingPoints}
                          autoCapitalize="none"
                          autoCorrect={false}
                          secureTextEntry
                          placeholder="Enter password"
                          placeholderTextColor={BrandColors.darkAccent}
                          style={styles.claimInput}
                        />
                      </View>
                    </View>

                    {claimErrorMessage ? <ThemedText style={styles.errorText}>{claimErrorMessage}</ThemedText> : null}
                    {pointsClaimedMessage ? <ThemedText style={styles.claimedSuccessText}>{pointsClaimedMessage}</ThemedText> : null}

                    <Pressable
                      style={({ pressed }) => [styles.signupButton, pressed && styles.signupButtonPressed, isClaimingPoints && styles.signupButtonDisabled]}
                      disabled={isClaimingPoints}
                      onPress={() => void handleSignInAndClaimPoints()}>
                      {isClaimingPoints ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <ThemedText style={styles.signupButtonText}>Sign In & Claim</ThemedText>
                      )}
                    </Pressable>
                  </>
                ) : (
                  <>
                    <ThemedText style={styles.signupCtaText}>Sign Up to keep these reward points.</ThemedText>
                    <Pressable
                      style={({ pressed }) => [styles.signupButton, pressed && styles.signupButtonPressed]}
                      onPress={() => {
                        hideOrderModal();
                        router.push('/(auth)/signup');
                      }}>
                      <ThemedText style={styles.signupButtonText}>Sign Up</ThemedText>
                    </Pressable>
                  </>
                )}

                <Pressable
                  style={({ pressed }) => [styles.rewardsCloseButton, pressed && styles.rewardsCloseButtonPressed]}
                  onPress={hideOrderModal}>
                  <ThemedText style={styles.rewardsCloseButtonText}>Close</ThemedText>
                </Pressable>
              </View>
            ) : null}
          </View>
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
  content: {
    padding: 20,
    gap: 14,
    paddingBottom: 30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
  },
  backButtonPressed: {
    opacity: 0.82,
  },
  backButtonText: {
    color: BrandColors.darkAccent,
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    color: BrandColors.darkAccent,
    marginTop: 2,
  },
  subtitle: {
    color: BrandColors.text,
    marginTop: -4,
  },
  card: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 12,
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
  fieldLabel: {
    color: BrandColors.darkAccent,
    fontSize: 14,
    fontWeight: '700',
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
  fieldBlock: {
    gap: 7,
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dropdownTriggerDisabled: {
    opacity: 0.6,
  },
  dropdownTriggerPressed: {
    backgroundColor: '#f7f3ec',
  },
  dropdownValue: {
    color: BrandColors.darkAccent,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  dropdownPlaceholder: {
    color: '#8d7d70',
    fontWeight: '500',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownOptionPressed: {
    backgroundColor: '#f4f1eb',
  },
  dropdownOptionText: {
    color: BrandColors.text,
    fontSize: 14,
  },
  dropdownEmptyText: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#8d7d70',
    fontSize: 13,
  },
  viewMenuButton: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    backgroundColor: '#fffdf9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewMenuButtonPressed: {
    opacity: 0.84,
  },
  viewMenuButtonText: {
    color: BrandColors.darkAccent,
    fontSize: 14,
    fontWeight: '700',
  },
  helperText: {
    color: '#7c6e63',
    fontSize: 13,
  },
  errorText: {
    color: '#9e1a1a',
    fontSize: 12,
    lineHeight: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    backgroundColor: '#fffdf9',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  totalLabel: {
    color: BrandColors.darkAccent,
    fontWeight: '700',
    fontSize: 15,
  },
  totalValue: {
    color: BrandColors.primary,
    fontWeight: '700',
    fontSize: 18,
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
    height: 88,
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
    marginTop: 2,
    borderRadius: 10,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  orderButtonPressed: {
    opacity: 0.9,
  },
  orderButtonDisabled: {
    opacity: 0.55,
  },
  orderButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  menuModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menuModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuModalCard: {
    width: '100%',
    height: '88%',
    minHeight: 360,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  menuModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuModalTitle: {
    color: BrandColors.darkAccent,
  },
  menuCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffdf9',
  },
  menuLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  menuModalBody: {
    flex: 1,
  },
  menuModalBodyContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 16,
    gap: 12,
  },
  menuEmptyText: {
    color: BrandColors.text,
    textAlign: 'center',
    paddingVertical: 24,
  },
  sectionBlock: {
    gap: 8,
  },
  sectionTitle: {
    color: BrandColors.darkAccent,
  },
  sectionList: {
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
  itemImage: {
    width: 92,
    height: 92,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },
  itemDetails: {
    flex: 1,
    gap: 4,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
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
    padding: 2,
  },
  itemToggleButtonPressed: {
    opacity: 0.72,
  },
  menuDoneButton: {
    margin: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BrandColors.primary,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
  },
  menuDoneButtonPressed: {
    opacity: 0.84,
  },
  menuDoneButtonText: {
    color: BrandColors.primary,
    fontWeight: '700',
    fontSize: 15,
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
  loadingText: {
    color: BrandColors.darkAccent,
    fontWeight: '600',
    textAlign: 'center',
  },
  successText: {
    color: BrandColors.primary,
    fontSize: 22,
    fontWeight: '700',
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
  signupCtaText: {
    color: BrandColors.text,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 19,
  },
  claimForm: {
    width: '100%',
    gap: 8,
  },
  claimFieldLabel: {
    color: BrandColors.darkAccent,
    fontSize: 13,
    fontWeight: '700',
  },
  claimInput: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    color: BrandColors.darkAccent,
  },
  claimInputDisabled: {
    backgroundColor: '#f6f1ea',
    color: '#7c6e63',
  },
  claimedSuccessText: {
    color: '#197d3f',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  signupButton: {
    marginTop: 2,
    minWidth: 160,
    borderRadius: 10,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  signupButtonPressed: {
    opacity: 0.88,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    color: '#ffffff',
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
