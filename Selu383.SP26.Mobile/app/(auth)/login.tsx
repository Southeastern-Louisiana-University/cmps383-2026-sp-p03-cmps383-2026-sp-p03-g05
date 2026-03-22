import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { Coffee, Leaf, LogIn } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { BrandColors } from '@/constants/theme';

export default function LoginScreen() {
  const { signIn, isLoading, errorMessage, clearError, isAuthenticated } = useAuth();
  const [userName, setUserName] = useState('bob');
  const [password, setPassword] = useState('Password123!');

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  const onSignIn = async () => {
    clearError();
    try {
      await signIn(userName, password);
      router.replace('/(app)');
    } catch {
      // Error is surfaced via context state.
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.logoWrap}>
        <Image source={require('@/assets/images/logo-round.png')} style={styles.logo} contentFit="cover" />
      </View>

      <ThemedText type="title" style={styles.title}>
        Caffeinated Lions
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Mobile ordering for fresh coffee on the go.
      </ThemedText>

      <View style={styles.form}>
        <TextInput
          value={userName}
          onChangeText={setUserName}
          placeholder="Username"
          autoCapitalize="none"
          style={styles.input}
          editable={!isLoading}
          onFocus={clearError}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          editable={!isLoading}
          onFocus={clearError}
        />
      </View>

      <View style={styles.badgeRow}>
        <Pressable
          style={({ pressed }) => [styles.badge, pressed && styles.badgePressed]}
          onPress={() => router.push('/(auth)/fast-pickup')}>
          <Coffee color={BrandColors.darkAccent} size={16} />
          <ThemedText style={styles.badgeText}>Fast Pickup</ThemedText>
        </Pressable>
        <View style={styles.badge}>
          <Leaf color={BrandColors.primary} size={16} />
          <ThemedText style={styles.badgeText}>Eco Friendly</ThemedText>
        </View>
      </View>

      <Pressable style={styles.primaryButton} onPress={onSignIn} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color={BrandColors.secondary} size="small" />
        ) : (
          <LogIn color={BrandColors.secondary} size={18} />
        )}
        <ThemedText style={styles.primaryButtonText}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </ThemedText>
      </Pressable>

      {errorMessage ? <ThemedText style={styles.errorText}>{errorMessage}</ThemedText> : null}

      <ThemedText style={styles.helperText}>Use seeded users like bob/sue/galkadi.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
    backgroundColor: BrandColors.secondary,
  },
  logoWrap: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: BrandColors.accent,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
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
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  badge: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 999,
    paddingVertical: 10,
  },
  badgePressed: {
    opacity: 0.82,
  },
  badgeText: {
    color: BrandColors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 8,
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    color: BrandColors.secondary,
    fontWeight: '700',
  },
  helperText: {
    marginTop: 16,
    fontSize: 13,
    textAlign: 'center',
    color: BrandColors.text,
    opacity: 0.8,
  },
  errorText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#b11f2f',
    fontWeight: '600',
  },
});
