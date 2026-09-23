import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PrimaryGradient, Spacing } from '@/constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
};

export function GradientButton({ label, onPress, style, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [pressed && styles.pressed, disabled && styles.disabled, style]}>
      <LinearGradient
        colors={PrimaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.pill}>
        <ThemedText type="smallBold" style={styles.label}>
          {label}
        </ThemedText>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
