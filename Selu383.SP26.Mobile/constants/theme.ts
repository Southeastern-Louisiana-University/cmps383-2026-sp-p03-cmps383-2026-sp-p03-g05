/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const BrandColors = {
  primary: '#10b981',
  secondary: '#FBF3E8',
  accent: '#CBBBA0',
  text: '#5B3F32',
  darkAccent: '#3A2F24',
  altForest: '#4A6C6F',
  altNeutral: '#C2A790',
} as const;

export const Colors = {
  light: {
    text: BrandColors.text,
    background: BrandColors.secondary,
    tint: BrandColors.primary,
    icon: BrandColors.darkAccent,
    tabIconDefault: BrandColors.text,
    tabIconSelected: BrandColors.primary,
    card: BrandColors.accent,
    border: BrandColors.darkAccent,
  },
  dark: {
    text: BrandColors.secondary,
    background: BrandColors.darkAccent,
    tint: BrandColors.primary,
    icon: BrandColors.accent,
    tabIconDefault: BrandColors.accent,
    tabIconSelected: BrandColors.primary,
    card: BrandColors.text,
    border: BrandColors.accent,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
