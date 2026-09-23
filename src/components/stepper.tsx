import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  style?: object;
};

export function Stepper({ label, value, onChange, min, max, step = 1, style }: Props) {
  const theme = useTheme();

  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));

  return (
    <View style={style}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
      <View style={[styles.box, { borderColor: theme.border }]}>
        <Pressable
          onPress={decrement}
          disabled={value <= min}
          hitSlop={12}
          style={({ pressed }) => pressed && styles.pressed}>
          <SymbolView
            name={{ ios: 'minus', android: 'remove', web: 'remove' }}
            size={20}
            tintColor={value <= min ? theme.textSecondary : theme.accent}
          />
        </Pressable>
        <ThemedText type="subtitle" style={styles.value}>
          {value}
        </ThemedText>
        <Pressable
          onPress={increment}
          disabled={value >= max}
          hitSlop={12}
          style={({ pressed }) => pressed && styles.pressed}>
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'add' }}
            size={20}
            tintColor={value >= max ? theme.textSecondary : theme.accent}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: Spacing.two,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  value: {
    fontSize: 22,
  },
  pressed: {
    opacity: 0.5,
  },
});
