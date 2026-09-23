import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CycleForm } from '@/components/cycle-form';
import { CyclePhaseDiagram } from '@/components/cycle-phase-diagram';
import { GradientButton } from '@/components/gradient-button';
import { fontSizeForDays, ResultCard } from '@/components/result-card';
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
import { generateId, getHistory, getLastInputs, saveCycleEntry, setLastInputs } from '@/lib/storage';
import { CalculatorResult } from '@/lib/types';
import { useTheme } from '@/hooks/use-theme';
import { useUser } from '@/hooks/use-user-store';

export default function CalculatorScreen() {
  const theme = useTheme();
  const { activeUser } = useUser();
  const userId = activeUser?.id;
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
    if (!userId) return;

    (async () => {
      setIsReady(false);
      setResult(null);
      setSaved(false);
      setLastPeriodStart(new Date());

      const [defaults, history] = await Promise.all([getLastInputs(userId), getHistory(userId)]);
      const averageFromHistory = computeAverageCycleLength(history);

      setPeriodLength(defaults?.periodLength ?? 5);
      setCycleLength(averageFromHistory ?? defaults?.cycleLength ?? 28);
      setIsReady(true);
    })();
  }, [userId]);

  const handleCalculate = async () => {
    if (!userId) return;
    const computed = calculateCycle(lastPeriodStart, periodLength, cycleLength);
    setResult(computed);
    setSaved(false);
    await setLastInputs(userId, { periodLength, cycleLength });
  };

  const handleSave = async () => {
    if (!result || !userId) return;
    await saveCycleEntry(userId, {
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
        {activeUser && (
          <ThemedText type="small" style={{ color: theme.primary }}>
            Hi, {activeUser.name}
          </ThemedText>
        )}
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
              {(() => {
                const ovulationDays = formatDayRange(result.ovulationDate, result.ovulationDate);
                const nextPeriodDays = formatDayRange(result.nextPeriodStart, result.nextPeriodEnd);
                const sharedDaysFontSize = fontSizeForDays(ovulationDays, nextPeriodDays);
                const nextPeriodSpansMonths =
                  result.nextPeriodStart.getMonth() !== result.nextPeriodEnd.getMonth() ||
                  result.nextPeriodStart.getFullYear() !== result.nextPeriodEnd.getFullYear();

                return (
                  <>
                    <ResultCard
                      label="Estimated ovulation date"
                      month={formatMonthAbbrev(result.ovulationDate)}
                      days={ovulationDays}
                      daysFontSize={sharedDaysFontSize}
                    />
                    <ResultCard
                      label="Estimated next period"
                      month={nextPeriodSpansMonths ? '' : formatMonthAbbrev(result.nextPeriodStart)}
                      days={nextPeriodDays}
                      daysFontSize={sharedDaysFontSize}
                    />
                  </>
                );
              })()}
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
