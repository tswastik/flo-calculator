import { StyleSheet, View } from 'react-native';

import { DateField } from '@/components/date-field';
import { GradientButton } from '@/components/gradient-button';
import { Stepper } from '@/components/stepper';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { isLikelyIrregular } from '@/lib/cycleMath';

type Props = {
  lastPeriodStart: Date;
  onChangeLastPeriodStart: (date: Date) => void;
  periodLength: number;
  onChangePeriodLength: (value: number) => void;
  cycleLength: number;
  onChangeCycleLength: (value: number) => void;
  onSubmit: () => void;
};

export function CycleForm({
  lastPeriodStart,
  onChangeLastPeriodStart,
  periodLength,
  onChangePeriodLength,
  cycleLength,
  onChangeCycleLength,
  onSubmit,
}: Props) {
  const showIrregularHint = isLikelyIrregular(periodLength, cycleLength);

  return (
    <View style={styles.container}>
      <DateField
        label="When did your last period start?"
        value={lastPeriodStart}
        onChange={onChangeLastPeriodStart}
      />

      <View style={styles.row}>
        <Stepper
          label="How many days did it last?"
          value={periodLength}
          onChange={onChangePeriodLength}
          min={1}
          max={10}
          style={styles.rowItem}
        />
        <Stepper
          label="Average cycle length (days)"
          value={cycleLength}
          onChange={onChangeCycleLength}
          min={15}
          max={45}
          style={styles.rowItem}
        />
      </View>

      {showIrregularHint && (
        <ThemedText type="small" themeColor="textSecondary">
          A cycle of 21-35 days and a period of 2-7 days is typical. Outside that range can still be
          normal for you, but it may be worth mentioning to a doctor.
        </ThemedText>
      )}

      <GradientButton label="See results" onPress={onSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  rowItem: {
    flex: 1,
  },
});
