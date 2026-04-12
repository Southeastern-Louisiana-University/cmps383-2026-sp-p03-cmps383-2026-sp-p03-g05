import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useRef, useState } from 'react';
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
import { usersApi } from '@/lib/api';

type PolicyType = 'terms' | 'privacy' | null;

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
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [signUpErrorMessage, setSignUpErrorMessage] = useState<string | null>(null);
  const [activePolicyModal, setActivePolicyModal] = useState<PolicyType>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const coffeeFillProgress = useRef(new Animated.Value(0)).current;
  const { height: screenHeight } = useWindowDimensions();

  const onPhoneChange = (value: string) => {
    setPhoneNumber(formatPhoneNumber(value));
  };
  const onStateChange = (value: string) => {
    setStateCode(value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2));
  };

  const closePolicyModal = () => setActivePolicyModal(null);
  const coffeeFillTranslateY = coffeeFillProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  const onSignUpPress = async () => {
    if (isSigningUp) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedEmail = emailAddress.trim();
    const trimmedUserName = userName.trim();
    const trimmedPassword = password;
    const trimmedAddress = streetAddress.trim();
    const phoneDigits = trimmedPhone.replace(/\D/g, '');

    if (!trimmedName || !trimmedPhone || !trimmedEmail || !trimmedUserName || !trimmedPassword || !trimmedAddress) {
      setSignUpErrorMessage(
        'Name, phone number, email, user name, password, and address are required.'
      );
      return;
    }

    if (!trimmedEmail.includes('@')) {
      setSignUpErrorMessage('Enter a valid email address.');
      return;
    }

    if (phoneDigits.length !== 10) {
      setSignUpErrorMessage('Enter a valid 10-digit phone number.');
      return;
    }

    if (!hasAgreed) {
      setSignUpErrorMessage('You must agree to the terms and privacy policy.');
      return;
    }

    setIsSigningUp(true);
    setSignUpErrorMessage(null);
    closePolicyModal();
    coffeeFillProgress.setValue(0);

    try {
      const [firstName, ...lastNameParts] = trimmedName.split(/\s+/);
      const lastName = lastNameParts.join(' ').trim() || 'Customer';

      await usersApi.create({
        userName: trimmedUserName,
        password: trimmedPassword,
        roles: ['User'],
        firstName,
        lastName,
        email: trimmedEmail,
        phoneNumber: trimmedPhone,
        address: trimmedAddress,
        city: city.trim(),
        state: stateCode.trim(),
        zipCode: zipCode.trim(),
        pridePoints: 0,
        hasAgreedToPolicies: hasAgreed,
      });

      await signIn(trimmedUserName, trimmedPassword);

      const didFinish = await new Promise<boolean>((resolve) => {
        Animated.timing(coffeeFillProgress, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(({ finished }) => resolve(finished));
      });

      if (!didFinish) {
        setIsSigningUp(false);
        coffeeFillProgress.setValue(0);
        return;
      }

      router.replace('/(app)/home');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      setSignUpErrorMessage(message);
      setIsSigningUp(false);
      coffeeFillProgress.setValue(0);
      return;
    }
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
            <View style={styles.twoColumnRow}>
              <View style={[styles.fieldGroup, styles.twoColumnField]}>
                <ThemedText style={styles.fieldLabel}>Name</ThemedText>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  placeholder="Enter your full name"
                  placeholderTextColor={BrandColors.darkAccent}
                  style={styles.input}
                  editable={!isSigningUp}
                />
              </View>

              <View style={[styles.fieldGroup, styles.twoColumnField]}>
                <ThemedText style={styles.fieldLabel}>Phone Number</ThemedText>
                <TextInput
                  value={phoneNumber}
                  onChangeText={onPhoneChange}
                  keyboardType="phone-pad"
                  placeholder="Enter your phone number"
                  placeholderTextColor={BrandColors.darkAccent}
                  maxLength={12}
                  style={styles.input}
                  editable={!isSigningUp}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Email Address</ThemedText>
              <TextInput
                value={emailAddress}
                onChangeText={setEmailAddress}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Enter your email address"
                placeholderTextColor={BrandColors.darkAccent}
                style={styles.input}
                editable={!isSigningUp}
              />
            </View>

            <View style={styles.twoColumnRow}>
              <View style={[styles.fieldGroup, styles.twoColumnField]}>
                <ThemedText style={styles.fieldLabel}>User Name</ThemedText>
                <TextInput
                  value={userName}
                  onChangeText={setUserName}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Choose a user name"
                  placeholderTextColor={BrandColors.darkAccent}
                  style={styles.input}
                  editable={!isSigningUp}
                />
              </View>

              <View style={[styles.fieldGroup, styles.twoColumnField]}>
                <ThemedText style={styles.fieldLabel}>Password</ThemedText>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Enter your password"
                  placeholderTextColor={BrandColors.darkAccent}
                  style={styles.input}
                  editable={!isSigningUp}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Street Address</ThemedText>
              <TextInput
                value={streetAddress}
                onChangeText={setStreetAddress}
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
                  autoCapitalize="words"
                  placeholder="City"
                  placeholderTextColor={BrandColors.darkAccent}
                  style={styles.input}
                  editable={!isSigningUp}
                />
              </View>
              <View style={[styles.fieldGroup, styles.stateField]}>
                <ThemedText style={styles.fieldLabel}>State</ThemedText>
                <TextInput
                  value={stateCode}
                  onChangeText={onStateChange}
                  autoCapitalize="characters"
                  placeholder="LA"
                  placeholderTextColor={BrandColors.darkAccent}
                  maxLength={2}
                  style={styles.input}
                  editable={!isSigningUp}
                />
              </View>
              <View style={[styles.fieldGroup, styles.zipField]}>
                <ThemedText style={styles.fieldLabel}>Zip</ThemedText>
                <TextInput
                  value={zipCode}
                  onChangeText={setZipCode}
                  keyboardType="number-pad"
                  placeholder="70401"
                  placeholderTextColor={BrandColors.darkAccent}
                  maxLength={5}
                  style={styles.input}
                  editable={!isSigningUp}
                />
              </View>
            </View>
          </View>

          {signUpErrorMessage ? <ThemedText style={styles.formError}>{signUpErrorMessage}</ThemedText> : null}

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
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  twoColumnField: {
    flex: 1,
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
  formError: {
    marginTop: 12,
    color: '#9E1A1A',
    fontSize: 13,
    lineHeight: 18,
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
