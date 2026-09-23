import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { computeAverageCycleLength, formatLongDate } from '@/lib/cycleMath';
import { deleteCycleEntry, getHistory } from '@/lib/storage';
import { CycleEntry } from '@/lib/types';
import { useTheme } from '@/hooks/use-theme';

export default function HistoryScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getHistory().then((history) => {
        setEntries(history);
        setLoaded(true);
      });
    }, [])
  );

  const handleDelete = async (id: string) => {
    const next = await deleteCycleEntry(id);
    setEntries(next);
  };

  const sorted = [...entries].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const averageCycleLength = computeAverageCycleLength(entries);

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
        <ThemedText type="subtitle">Cycle history</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Cycles you save from the calculator appear here. Log a couple to get an automatically
          computed average cycle length.
        </ThemedText>

        {averageCycleLength && (
          <ThemedView type="backgroundElement" style={styles.averageBanner}>
            <ThemedText type="small" themeColor="textSecondary">
              Average cycle length from your history
            </ThemedText>
            <ThemedText type="subtitle">{averageCycleLength} days</ThemedText>
          </ThemedView>
        )}

        {loaded && sorted.length === 0 && (
          <ThemedView type="backgroundElement" style={styles.emptyState}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
              No cycles saved yet. Calculate a cycle and tap &quot;Save this cycle&quot; to start
              building your history.
            </ThemedText>
          </ThemedView>
        )}

        <View style={styles.list}>
          {sorted.map((entry) => (
            <ThemedView key={entry.id} type="card" style={[styles.row, { borderColor: theme.border }]}>
              <View>
                <ThemedText type="smallBold">{formatLongDate(new Date(entry.startDate))}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Lasted {entry.periodLength} {entry.periodLength === 1 ? 'day' : 'days'}
                </ThemedText>
              </View>
              <Pressable
                onPress={() => handleDelete(entry.id)}
                hitSlop={12}
                style={({ pressed }) => pressed && styles.pressed}>
                <SymbolView
                  name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                  size={20}
                  tintColor={theme.textSecondary}
                />
              </Pressable>
            </ThemedView>
          ))}
        </View>
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
  averageBanner: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  emptyState: {
    borderRadius: Spacing.four,
    padding: Spacing.five,
  },
  emptyText: {
    textAlign: 'center',
  },
  list: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Spacing.four,
    padding: Spacing.four,
  },
  pressed: {
    opacity: 0.6,
  },
});
