import { Plus } from 'lucide-react-native';
import { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { BrandColors } from '@/constants/theme';

type AddToCartButtonProps = {
  isSelected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
};

export function AddToCartButton({
  isSelected,
  onPress,
  accessibilityLabel,
  style,
  pressedStyle,
}: AddToCartButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const playBounce = useCallback(() => {
    scale.stopAnimation();
    scale.setValue(1);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.86,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.08,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        isSelected && styles.selected,
        style,
        pressed && styles.pressed,
        pressed && pressedStyle,
      ]}
      onPress={() => {
        playBounce();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Plus color={isSelected ? '#ffffff' : BrandColors.primary} size={20} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.42)',
    borderRadius: 8,
    backgroundColor: '#ffffffee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
});
