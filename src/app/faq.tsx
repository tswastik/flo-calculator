import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FAQAccordion } from '@/components/faq-accordion';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { FAQ_ITEMS } from '@/lib/faqContent';
import { useTheme } from '@/hooks/use-theme';

export default function FAQScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.scrollContent, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Cycle FAQ</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Common questions about periods, ovulation, and what counts as irregular.
        </ThemedText>

        <FAQAccordion items={FAQ_ITEMS} />

        <ThemedText type="small" themeColor="textSecondary" style={styles.disclaimer}>
          This information is for general awareness only and is not a substitute for medical
          advice. If something feels off, talk to a healthcare provider.
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  disclaimer: {
    marginTop: Spacing.two,
  },
});
