import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle2, ChevronDown } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';

const menuItems = ['Americano/Drip', 'Latte', 'Cappuccino', 'Iced Latte', 'Iced Coffee', 'Hot Tea'] as const;
const sizeOptions = ['12oz', '16oz', '20 oz'] as const;
const storeOptions = [
  '123 Lion Way, Hammond LA',
  '456 Seattle Row, Seattle WA',
  '789 5th Ave, New York NY',
] as const;

type MenuItem = (typeof menuItems)[number];
type StoreOption = (typeof storeOptions)[number];

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

export default function FastPickupScreen() {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeDrink, setActiveDrink] = useState<MenuItem | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Partial<Record<MenuItem, string>>>({});
  const [selectedLocation, setSelectedLocation] = useState<StoreOption>(storeOptions[0]);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const orderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phoneInputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    return () => {
      if (orderTimerRef.current) {
        clearTimeout(orderTimerRef.current);
      }
    };
  }, []);

  const closeSizeModal = () => setActiveDrink(null);
  const closeLocationModal = () => setIsLocationModalVisible(false);

  const chooseSize = (size: string) => {
    if (!activeDrink) {
      return;
    }

    setSelectedSizes((previous) => ({
      ...previous,
      [activeDrink]: size,
    }));
    closeSizeModal();
  };

  const chooseLocation = (location: StoreOption) => {
    setSelectedLocation(location);
    closeLocationModal();
  };

  const onPhoneNumberChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);

    if (formatted.replace(/\D/g, '').length === 10) {
      phoneInputRef.current?.blur();
    }
  };

  const placeOrder = () => {
    setIsPlacingOrder(true);

    if (orderTimerRef.current) {
      clearTimeout(orderTimerRef.current);
    }

    orderTimerRef.current = setTimeout(() => {
      setIsPlacingOrder(false);
      setIsSuccessModalVisible(true);
      orderTimerRef.current = null;
    }, 1200);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalVisible(false);
    router.replace('/(auth)/login');
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]} onPress={() => router.back()}>
          <ArrowLeft color={BrandColors.darkAccent} size={18} />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </Pressable>

        <ThemedText type="title" style={styles.title}>
          Fast Pickup
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Enter your info and tap a drink to pick the size.
        </ThemedText>

        <View style={styles.form}>
          <TextInput
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Enter your name"
            placeholderTextColor={BrandColors.darkAccent}
            style={styles.input}
            autoCapitalize="words"
          />
          <TextInput
            value={phoneNumber}
            ref={phoneInputRef}
            onChangeText={onPhoneNumberChange}
            placeholder="Enter your phone number"
            placeholderTextColor={BrandColors.darkAccent}
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={12}
          />
          {/* ADD BACKEND LOGIC TO CHECK FOR CURRENT CUSTOMERS. */}
        </View>

        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <Pressable
              key={item}
              style={({ pressed }) => [styles.menuCard, pressed && styles.menuCardPressed]}
              onPress={() => setActiveDrink(item)}>
              {selectedSizes[item] ? (
                <View style={styles.cardSelectedIcon}>
                  <CheckCircle2 color={BrandColors.primary} size={18} />
                </View>
              ) : null}
              <Image source={require('@/assets/images/Coffee Cup.png')} style={styles.menuIcon} contentFit="contain" />
              <ThemedText style={styles.menuLabel}>{item}</ThemedText>
              {selectedSizes[item] ? <ThemedText style={styles.selectedSize}>{selectedSizes[item]}</ThemedText> : null}
            </Pressable>
          ))}
        </View>

        <View style={styles.orderSection}>
          <Pressable
            style={({ pressed }) => [styles.locationButton, pressed && styles.locationButtonPressed]}
            onPress={() => setIsLocationModalVisible(true)}
            disabled={isPlacingOrder}>
            <View style={styles.locationTextWrap}>
              <ThemedText style={styles.locationButtonLabel}>Choose Location</ThemedText>
              <ThemedText style={styles.locationValue}>{selectedLocation}</ThemedText>
            </View>
            <ChevronDown color={BrandColors.darkAccent} size={18} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.orderButton, pressed && styles.orderButtonPressed]}
            onPress={placeOrder}
            disabled={isPlacingOrder}>
            <ThemedText style={styles.orderButtonText}>Place Order!</ThemedText>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={activeDrink !== null} transparent animationType="fade" onRequestClose={closeSizeModal}>
        <View style={styles.modalRoot}>
          <Pressable style={[StyleSheet.absoluteFill, styles.modalBackdrop]} onPress={closeSizeModal} />
          <View style={styles.modalCard}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Choose Size
            </ThemedText>
            <ThemedText style={styles.modalDrink}>{activeDrink}</ThemedText>
            <View style={styles.sizeRow}>
              {sizeOptions.map((size) => (
                <Pressable
                  key={size}
                  style={({ pressed }) => [styles.sizeButton, pressed && styles.sizeButtonPressed]}
                  onPress={() => chooseSize(size)}>
                  <ThemedText style={styles.sizeButtonText}>{size}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isLocationModalVisible} transparent animationType="fade" onRequestClose={closeLocationModal}>
        <View style={styles.modalRoot}>
          <Pressable style={[StyleSheet.absoluteFill, styles.modalBackdrop]} onPress={closeLocationModal} />
          <View style={styles.locationModalCard}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Choose Location
            </ThemedText>
            <View style={styles.locationWheelFrame}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.locationWheelContent}
                snapToAlignment="center"
                decelerationRate="fast">
                {storeOptions.map((location) => (
                  <Pressable
                    key={location}
                    style={({ pressed }) => [
                      styles.locationOption,
                      selectedLocation === location && styles.locationOptionSelected,
                      pressed && styles.locationOptionPressed,
                    ]}
                    onPress={() => chooseLocation(location)}>
                    <ThemedText
                      style={[
                        styles.locationOptionText,
                        selectedLocation === location && styles.locationOptionTextSelected,
                      ]}>
                      {location}
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isPlacingOrder} transparent animationType="fade">
        <View style={styles.modalRoot}>
          <View style={styles.loaderCard}>
            <ActivityIndicator color={BrandColors.primary} size="small" />
            <ThemedText style={styles.loaderText}>Placing your order...</ThemedText>
          </View>
        </View>
      </Modal>

      <Modal visible={isSuccessModalVisible} transparent animationType="fade" onRequestClose={closeSuccessModal}>
        <View style={styles.modalRoot}>
          <Pressable style={[StyleSheet.absoluteFill, styles.modalBackdrop]} onPress={closeSuccessModal} />
          <View style={styles.successCard}>
            <CheckCircle2 color={BrandColors.primary} size={32} />
            <ThemedText type="subtitle" style={styles.successTitle}>
              Success
            </ThemedText>
            <ThemedText style={styles.successMessage}>Your order has been placed.</ThemedText>
            <Pressable style={({ pressed }) => [styles.successButton, pressed && styles.successButtonPressed]} onPress={closeSuccessModal}>
              <ThemedText style={styles.successButtonText}>Back to Login</ThemedText>
            </Pressable>
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
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  backButtonPressed: {
    opacity: 0.75,
  },
  backButtonText: {
    color: BrandColors.darkAccent,
    fontWeight: '600',
  },
  title: {
    color: BrandColors.darkAccent,
    marginBottom: 10,
  },
  subtitle: {
    color: BrandColors.text,
    marginBottom: 18,
  },
  form: {
    gap: 10,
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#fff',
    color: BrandColors.darkAccent,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  menuCard: {
    width: '31%',
    minHeight: 128,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  menuCardPressed: {
    opacity: 0.86,
  },
  cardSelectedIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  menuIcon: {
    width: 46,
    height: 46,
    marginBottom: 8,
  },
  menuLabel: {
    color: BrandColors.text,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 15,
  },
  selectedSize: {
    color: BrandColors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  orderSection: {
    marginTop: 24,
    gap: 12,
  },
  locationButton: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  locationButtonPressed: {
    opacity: 0.86,
  },
  locationTextWrap: {
    flex: 1,
  },
  locationButtonLabel: {
    color: BrandColors.text,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  locationValue: {
    color: BrandColors.darkAccent,
    fontWeight: '600',
    lineHeight: 20,
  },
  orderButton: {
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  orderButtonPressed: {
    opacity: 0.85,
  },
  orderButtonText: {
    color: BrandColors.secondary,
    fontWeight: '700',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(58, 47, 36, 0.38)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: BrandColors.secondary,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 16,
    padding: 18,
  },
  locationModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: BrandColors.secondary,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 16,
    padding: 18,
  },
  modalTitle: {
    textAlign: 'center',
    color: BrandColors.darkAccent,
    marginBottom: 4,
  },
  modalDrink: {
    textAlign: 'center',
    color: BrandColors.text,
    marginBottom: 14,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  locationWheelFrame: {
    maxHeight: 170,
    marginTop: 10,
  },
  locationWheelContent: {
    paddingVertical: 4,
    gap: 8,
  },
  locationOption: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationOptionSelected: {
    borderColor: BrandColors.primary,
  },
  locationOptionPressed: {
    opacity: 0.84,
  },
  locationOptionText: {
    color: BrandColors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  locationOptionTextSelected: {
    color: BrandColors.darkAccent,
  },
  sizeButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    backgroundColor: '#fff',
    paddingVertical: 10,
    alignItems: 'center',
  },
  sizeButtonPressed: {
    opacity: 0.82,
  },
  sizeButtonText: {
    color: BrandColors.darkAccent,
    fontWeight: '700',
  },
  loaderCard: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 10,
  },
  loaderText: {
    color: BrandColors.darkAccent,
    fontWeight: '600',
  },
  successCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    backgroundColor: BrandColors.secondary,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  successTitle: {
    color: BrandColors.darkAccent,
  },
  successMessage: {
    textAlign: 'center',
    color: BrandColors.text,
    marginBottom: 4,
  },
  successButton: {
    marginTop: 6,
    width: '100%',
    borderRadius: 10,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    paddingVertical: 12,
  },
  successButtonPressed: {
    opacity: 0.84,
  },
  successButtonText: {
    color: BrandColors.secondary,
    fontWeight: '700',
  },
});
