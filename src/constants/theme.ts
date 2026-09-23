/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    card: '#ffffff',
    border: '#E2E1E6',
    primary: '#F2496A',
    primaryDark: '#D63C5C',
    accent: '#1E9E8C',
    period: '#F0506B',
    diagramBackground: '#E5D9F2',
    diagramTrack: '#FFFFFF',
    regular: '#1E9E8C',
    regularSoft: '#E1F5F1',
    irregular: '#D6336C',
    irregularSoft: '#FBE1EA',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    card: '#1B1C1F',
    border: '#33343A',
    primary: '#F2496A',
    primaryDark: '#D63C5C',
    accent: '#2BBBA6',
    period: '#F0506B',
    diagramBackground: '#2B2138',
    diagramTrack: '#3A3143',
    regular: '#2BBBA6',
    regularSoft: '#183430',
    irregular: '#F0679A',
    irregularSoft: '#3A2029',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const PrimaryGradient = ['#F45C79', '#F2909A'] as const;

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
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
