import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  /** null when there isn't an earlier entry to measure this cycle's length against */
  isIrregular: boolean | null;
};

export function RegularityBadge({ isIrregular }: Props) {
  const theme = useTheme();

  if (isIrregular === null) {
    return (
      <ThemedView type="backgroundElement" style={styles.badge}>
        <ThemedText type="small" themeColor="textSecondary">
          First logged cycle
        </ThemedText>
      </ThemedView>
    );
  }

  const background = isIrregular ? theme.irregularSoft : theme.regularSoft;
  const foreground = isIrregular ? theme.irregular : theme.regular;

  return (
    <ThemedView style={[styles.badge, { backgroundColor: background }]}>
      <ThemedText type="small" style={{ color: foreground, fontWeight: '700' }}>
        {isIrregular ? 'Irregular' : 'Regular'}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.half,
  },
});
