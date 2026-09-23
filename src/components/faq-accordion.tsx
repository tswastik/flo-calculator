import { StyleSheet, View } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { FAQItem } from '@/lib/faqContent';

type Props = {
  items: FAQItem[];
};

export function FAQAccordion({ items }: Props) {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <Collapsible key={item.question} title={item.question}>
          <ThemedText type="small" style={styles.answer}>
            {item.answer}
          </ThemedText>
        </Collapsible>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  answer: {
    lineHeight: 20,
  },
});
