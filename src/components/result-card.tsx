import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  month: string;
  days: string;
  style?: object;
};

export function ResultCard({ label, month, days, style }: Props) {
  const theme = useTheme();

  return (
    <ThemedView type="card" style={[styles.card, { borderColor: theme.border }, style]}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.dateBlock}>
        <ThemedText type="smallBold" style={{ color: theme.primary }}>
          {month}
        </ThemedText>
        <ThemedText style={styles.days}>{days}</ThemedText>
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
  },
  days: {
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 46,
  },
});
