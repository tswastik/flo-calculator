import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  /** Omit (or pass '') when `days` already spells out its own month(s), e.g. a range spanning two months */
  month?: string;
  days: string;
  daysFontSize: { fontSize: number; lineHeight: number };
  style?: object;
};

/** Size that fits the longest of a set of "days" strings, so sibling cards render at a matching scale. */
export function fontSizeForDays(...values: string[]): { fontSize: number; lineHeight: number } {
  const longest = Math.max(...values.map((value) => value.length));
  if (longest <= 2) return { fontSize: 40, lineHeight: 46 };
  if (longest <= 5) return { fontSize: 32, lineHeight: 38 };
  if (longest <= 8) return { fontSize: 24, lineHeight: 29 };
  return { fontSize: 18, lineHeight: 22 };
}

export function ResultCard({ label, month, days, daysFontSize, style }: Props) {
  const theme = useTheme();

  return (
    <ThemedView type="card" style={[styles.card, { borderColor: theme.border }, style]}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.dateBlock}>
        {!!month && (
          <ThemedText type="smallBold" style={{ color: theme.primary }}>
            {month}
          </ThemedText>
        )}
        <ThemedText style={[styles.days, daysFontSize]} numberOfLines={2}>
          {days}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  label: {
    textAlign: 'center',
  },
  dateBlock: {
    alignItems: 'center',
    width: '100%',
  },
  days: {
    fontWeight: '800',
    textAlign: 'center',
  },
});
