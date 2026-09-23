import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CycleForm } from '@/components/cycle-form';
import { CyclePhaseDiagram } from '@/components/cycle-phase-diagram';
import { GradientButton } from '@/components/gradient-button';
import { ResultCard } from '@/components/result-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import {
  calculateCycle,
  computeAverageCycleLength,
  formatDayRange,
  formatMonthAbbrev,
  toISODateString,
} from '@/lib/cycleMath';
import { getHistory, getLastInputs, saveCycleEntry, setLastInputs } from '@/lib/storage';
import { CalculatorResult } from '@/lib/types';
import { useTheme } from '@/hooks/use-theme';

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function CalculatorScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const [isReady, setIsReady] = useState(false);
  const [lastPeriodStart, setLastPeriodStart] = useState(new Date());
  const [periodLength, setPeriodLength] = useState(5);
  const [cycleLength, setCycleLength] = useState(28);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const [defaults, history] = await Promise.all([getLastInputs(), getHistory()]);
      const averageFromHistory = computeAverageCycleLength(history);

      if (defaults) setPeriodLength(defaults.periodLength);
      if (averageFromHistory) {
        setCycleLength(averageFromHistory);
      } else if (defaults) {
        setCycleLength(defaults.cycleLength);
      }
      setIsReady(true);
    })();
  }, []);

  const handleCalculate = async () => {
    const computed = calculateCycle(lastPeriodStart, periodLength, cycleLength);
    setResult(computed);
    setSaved(false);
    await setLastInputs({ periodLength, cycleLength });
  };

  const handleSave = async () => {
    if (!result) return;
    await saveCycleEntry({
      id: generateId(),
      startDate: toISODateString(result.lastPeriodStart),
      periodLength: result.periodLength,
    });
    setSaved(true);
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

  if (!isReady) return <ThemedView style={styles.flex} />;

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.scrollContent, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Period calculator</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.intro}>
          Predict your next period, ovulation date, and fertile window from your last cycle.
          Estimates only - not medical advice.
        </ThemedText>

        <CycleForm
          lastPeriodStart={lastPeriodStart}
          onChangeLastPeriodStart={setLastPeriodStart}
          periodLength={periodLength}
          onChangePeriodLength={setPeriodLength}
          cycleLength={cycleLength}
          onChangeCycleLength={setCycleLength}
          onSubmit={handleCalculate}
        />

        {result && (
          <ThemedView style={styles.resultsSection}>
            <ThemedView style={styles.resultCards}>
              <ResultCard
                label="Estimated ovulation date"
                month={formatMonthAbbrev(result.ovulationDate)}
                days={formatDayRange(result.ovulationDate, result.ovulationDate)}
              />
              <ResultCard
                label="Estimated next period"
                month={formatMonthAbbrev(result.nextPeriodStart)}
                days={formatDayRange(result.nextPeriodStart, result.nextPeriodEnd)}
              />
            </ThemedView>

            <GradientButton
              label={saved ? 'Saved to history ✓' : 'Save this cycle'}
              onPress={handleSave}
              disabled={saved}
            />

            <CyclePhaseDiagram result={result} />
          </ThemedView>
        )}
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
  intro: {
    marginBottom: Spacing.two,
  },
  resultsSection: {
    gap: Spacing.four,
  },
  resultCards: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
});
