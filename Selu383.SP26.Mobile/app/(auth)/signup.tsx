import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { BrandColors } from '@/constants/theme';

type PolicyType = 'terms' | 'privacy' | null;

const stateAbbreviations = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
  'DC',
] as const;

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

export default function SignUpScreen() {
  const { beginDemoSession } = useAuth();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState<PolicyType>(null);
  const [isStateListVisible, setIsStateListVisible] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const coffeeFillProgress = useRef(new Animated.Value(0)).current;
  const { height: screenHeight } = useWindowDimensions();
  const stateListRows = useMemo(() => {
    const rows: Array<Array<(typeof stateAbbreviations)[number]>> = [];

    for (let i = 0; i < stateAbbreviations.length; i += 8) {
      rows.push(stateAbbreviations.slice(i, i + 8));
    }

    return rows;
  }, []);

  const onPhoneChange = (value: string) => {
    setPhoneNumber(formatPhoneNumber(value));
  };

  const closePolicyModal = () => setActivePolicyModal(null);
  const closeStateList = () => setIsStateListVisible(false);
  const chooseState = (nextState: (typeof stateAbbreviations)[number]) => {
    setStateCode(nextState);
    closeStateList();
  };
  const toggleStateList = () => {
    if (isSigningUp) {
      return;
    }

    setIsStateListVisible((previous) => !previous);
  };
  const coffeeFillTranslateY = coffeeFillProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  const onSignUpPress = async () => {
    if (isSigningUp) {
      return;
    }

    setIsSigningUp(true);
    closePolicyModal();
    closeStateList();
    coffeeFillProgress.setValue(0);

    // TODO: Replace this presentation flow with a real backend call to a new public signup endpoint.
    // TODO: Send name, phoneNumber, emailAddress, streetAddress, city, stateCode, zipCode, and hasAgreed.
    // TODO: Handle endpoint validation errors and show field-level messages before running success animation.
    const didFinish = await new Promise<boolean>((resolve) => {
      Animated.timing(coffeeFillProgress, {
        toValue: 1,
        duration: 4000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => resolve(finished));
    });

    if (!didFinish) {
      setIsSigningUp(false);
      coffeeFillProgress.setValue(0);
      return;
    }

    beginDemoSession(name.trim());
    router.replace('/(app)/home');
  };

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets>
          <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]} onPress={() => router.back()}>
            <ArrowLeft color={BrandColors.darkAccent} size={18} />
            <ThemedText style={styles.backButtonText}>Back</ThemedText>
          </Pressable>

          <View style={styles.logoWrap}>
            <Image source={require('@/assets/images/logo-round.png')} style={styles.logo} contentFit="cover" />
          </View>

          <ThemedText type="title" style={styles.title}>
            Lets get the caffeine flowing!
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign up to receive discounts, order your favorites faster and much more
          </ThemedText>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Name</ThemedText>
              <TextInput
                value={name}
                onChangeText={setName}
                onFocus={closeStateList}
                autoCapitalize="words"
                placeholder="Enter your full name"
                placeholderTextColor={BrandColors.darkAccent}
                style={styles.input}
                editable={!isSigningUp}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Phone Number</ThemedText>
              <TextInput
                value={phoneNumber}
                onChangeText={onPhoneChange}
                onFocus={closeStateList}
                keyboardType="phone-pad"
                placeholder="Enter your phone number"
                placeholderTextColor={BrandColors.darkAccent}
                maxLength={12}
                style={styles.input}
                editable={!isSigningUp}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Email Address</ThemedText>
              <TextInput
                value={emailAddress}
                onChangeText={setEmailAddress}
                onFocus={closeStateList}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Enter your email address"
                placeholderTextColor={BrandColors.darkAccent}
                style={styles.input}
                editable={!isSigningUp}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Street Address</ThemedText>
              <TextInput
                value={streetAddress}
                onChangeText={setStreetAddress}
                onFocus={closeStateList}
                autoCapitalize="words"
                placeholder="Enter your street address"
                placeholderTextColor={BrandColors.darkAccent}
                style={styles.input}
                editable={!isSigningUp}
              />
            </View>

            <View style={styles.cityStateZipRow}>
              <View style={[styles.fieldGroup, styles.cityField]}>
                <ThemedText style={styles.fieldLabel}>City</ThemedText>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  onFocus={closeStateList}
                  autoCapitalize="words"
                  placeholder="City"
                  placeholderTextColor={BrandColors.darkAccent}
                  style={styles.input}
                  editable={!isSigningUp}
                />
              </View>
              <View style={[styles.fieldGroup, styles.stateField]}>
                <ThemedText style={styles.fieldLabel}>State</ThemedText>
                <Pressable
                  style={({ pressed }) => [
                    styles.stateDropdown,
                    isStateListVisible && styles.stateDropdownOpen,
                    pressed && styles.stateDropdownPressed,
                    isSigningUp && styles.stateDropdownDisabled,
                  ]}
                  onPress={toggleStateList}
                  disabled={isSigningUp}>
                  <ThemedText style={[styles.stateDropdownText, !stateCode && styles.stateDropdownPlaceholder]}>
                    {stateCode || 'Select'}
                  </ThemedText>
                  <ChevronDown color={BrandColors.darkAccent} size={16} />
                </Pressable>
              </View>
              <View style={[styles.fieldGroup, styles.zipField]}>
                <ThemedText style={styles.fieldLabel}>Zip</ThemedText>
                <TextInput
                  value={zipCode}
                  onChangeText={setZipCode}
                  onFocus={closeStateList}
                  keyboardType="number-pad"
                  placeholder="70401"
                  placeholderTextColor={BrandColors.darkAccent}
                  maxLength={5}
                  style={styles.input}
                  editable={!isSigningUp}
                />
              </View>
            </View>

            {isStateListVisible ? (
              <View style={styles.stateListCard}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.stateListRows}
                  keyboardShouldPersistTaps="handled">
                  {stateListRows.map((row, rowIndex) => (
                    <View key={`state-row-${rowIndex}`} style={styles.stateListRow}>
                      {row.map((abbr) => (
                        <Pressable
                          key={abbr}
                          style={({ pressed }) => [
                            styles.stateChip,
                            stateCode === abbr && styles.stateChipSelected,
                            pressed && styles.stateChipPressed,
                          ]}
                          onPress={() => chooseState(abbr)}>
                          <ThemedText style={[styles.stateChipText, stateCode === abbr && styles.stateChipTextSelected]}>
                            {abbr}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>

          <View style={styles.agreementRow}>
            <Pressable
              style={({ pressed }) => [styles.checkbox, hasAgreed && styles.checkboxChecked, pressed && styles.checkboxPressed]}
              onPress={() => setHasAgreed((previous) => !previous)}
              disabled={isSigningUp}>
              {hasAgreed ? <Check color={BrandColors.secondary} size={14} /> : null}
            </Pressable>

            <ThemedText style={styles.agreementText}>
              By signing up, you agree to Caffeinated Lions LLC{' '}
              <ThemedText style={styles.policyLink} onPress={() => !isSigningUp && setActivePolicyModal('terms')}>
                Terms Of Service
              </ThemedText>{' '}
              and{' '}
              <ThemedText style={styles.policyLink} onPress={() => !isSigningUp && setActivePolicyModal('privacy')}>
                Privacy Policy
              </ThemedText>
              .
            </ThemedText>
          </View>

          <Pressable
            style={({ pressed }) => [styles.signUpButton, pressed && styles.signUpButtonPressed, isSigningUp && styles.signUpButtonDisabled]}
            onPress={() => void onSignUpPress()}
            disabled={isSigningUp}>
            <ThemedText style={styles.signUpButtonText}>{isSigningUp ? 'Brewing Account...' : 'Sign Up'}</ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={activePolicyModal !== null} transparent animationType="fade" onRequestClose={closePolicyModal}>
        <View style={styles.modalRoot}>
          <Pressable style={[StyleSheet.absoluteFill, styles.modalBackdrop]} onPress={closePolicyModal} />
          <View style={styles.modalCard}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              {activePolicyModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </ThemedText>

            <ThemedText style={styles.modalBody}>
              {activePolicyModal === 'terms'
                ? 'Placeholder: Terms of Service details will appear here, including account use, ordering terms, and service availability language.'
                : 'Placeholder: Privacy Policy details will appear here, including data collection, usage, storage, and contact information.'}
            </ThemedText>

            <Pressable style={({ pressed }) => [styles.modalButton, pressed && styles.modalButtonPressed]} onPress={closePolicyModal}>
              <ThemedText style={styles.modalButtonText}>Close</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      {isSigningUp ? (
        <View pointerEvents="none" style={styles.coffeeOverlayRoot}>
          <Animated.View style={[styles.coffeeFill, { transform: [{ translateY: coffeeFillTranslateY }] }]} />
          <View style={styles.coffeeStaticMessageWrap}>
            <ThemedText style={styles.coffeeTitle}>Filling up your details and your first cup of coffee!</ThemedText>
          </View>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BrandColors.secondary,
  },
  keyboardRoot: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 72,
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
    textAlign: 'center',
    color: BrandColors.darkAccent,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: BrandColors.text,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 20,
  },
  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BrandColors.accent,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 16,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  form: {
    gap: 12,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: BrandColors.darkAccent,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    color: BrandColors.darkAccent,
  },
  cityStateZipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cityField: {
    flex: 1.5,
  },
  stateField: {
    flex: 1.1,
  },
  zipField: {
    flex: 1.1,
  },
  stateDropdown: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stateDropdownOpen: {
    borderColor: BrandColors.primary,
  },
  stateDropdownPressed: {
    opacity: 0.86,
  },
  stateDropdownDisabled: {
    opacity: 0.84,
  },
  stateDropdownText: {
    color: BrandColors.darkAccent,
    fontWeight: '600',
    fontSize: 13,
  },
  stateDropdownPlaceholder: {
    color: BrandColors.text,
  },
  stateListCard: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  stateListRows: {
    gap: 8,
  },
  stateListRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stateChip: {
    minWidth: 38,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.secondary,
  },
  stateChipSelected: {
    borderColor: BrandColors.primary,
    backgroundColor: '#ecfff6',
  },
  stateChipPressed: {
    opacity: 0.84,
  },
  stateChipText: {
    color: BrandColors.darkAccent,
    fontWeight: '700',
    fontSize: 12,
  },
  stateChipTextSelected: {
    color: BrandColors.primary,
  },
  agreementRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    marginTop: 2,
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  checkboxPressed: {
    opacity: 0.84,
  },
  agreementText: {
    flex: 1,
    color: BrandColors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  policyLink: {
    color: BrandColors.primary,
    fontWeight: '700',
    textDecorationLine: 'none',
  },
  signUpButton: {
    marginTop: 18,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButtonPressed: {
    opacity: 0.84,
  },
  signUpButtonDisabled: {
    opacity: 0.92,
  },
  signUpButtonText: {
    color: BrandColors.secondary,
    fontWeight: '700',
  },
  coffeeOverlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    elevation: 50,
    overflow: 'hidden',
  },
  coffeeFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#5c3b2e',
  },
  coffeeStaticMessageWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  coffeeTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    backgroundColor: BrandColors.secondary,
    padding: 18,
  },
  modalTitle: {
    textAlign: 'center',
    color: BrandColors.darkAccent,
    marginBottom: 10,
  },
  modalBody: {
    color: BrandColors.text,
    lineHeight: 22,
  },
  modalButton: {
    marginTop: 14,
    alignSelf: 'center',
    minWidth: 110,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
  },
  modalButtonPressed: {
    opacity: 0.84,
  },
  modalButtonText: {
    color: BrandColors.secondary,
    fontWeight: '700',
  },
});
