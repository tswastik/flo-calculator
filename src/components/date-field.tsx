import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { formatLongDate, isSameDay, startOfDay } from '@/lib/cycleMath';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
};

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function DateField({ label, value, onChange }: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());

  const today = startOfDay(new Date());

  const openPicker = () => {
    setViewYear(value.getFullYear());
    setViewMonth(value.getMonth());
    setOpen(true);
  };

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();

  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectDay = (day: number) => {
    onChange(new Date(viewYear, viewMonth, day));
    setOpen(false);
  };

  return (
    <View>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
      <Pressable
        onPress={openPicker}
        style={({ pressed }) => [styles.field, { borderColor: theme.border }, pressed && styles.pressed]}>
        <ThemedText type="default">{formatLongDate(value)}</ThemedText>
        <SymbolView
          name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
          size={20}
          tintColor={theme.text}
        />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <ThemedView type="card" style={[styles.calendar, { borderColor: theme.border }]}>
              <View style={styles.calendarHeader}>
                <Pressable onPress={goToPrevMonth} hitSlop={12}>
                  <SymbolView
                    name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                    size={18}
                    tintColor={theme.text}
                  />
                </Pressable>
                <ThemedText type="smallBold">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </ThemedText>
                <Pressable onPress={goToNextMonth} hitSlop={12}>
                  <SymbolView
                    name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                    size={18}
                    tintColor={theme.text}
                  />
                </Pressable>
              </View>

              <View style={styles.weekdayRow}>
                {WEEKDAY_LABELS.map((weekday) => (
                  <ThemedText key={weekday} type="small" themeColor="textSecondary" style={styles.weekdayCell}>
                    {weekday}
                  </ThemedText>
                ))}
              </View>

              <View style={styles.grid}>
                {cells.map((day, index) => {
                  if (day === null) return <View key={`blank-${index}`} style={styles.dayCell} />;

                  const cellDate = new Date(viewYear, viewMonth, day);
                  const isFuture = cellDate.getTime() > today.getTime();
                  const isSelected = isSameDay(cellDate, value);

                  return (
                    <Pressable
                      key={day}
                      disabled={isFuture}
                      onPress={() => selectDay(day)}
                      style={[
                        styles.dayCell,
                        isSelected && { backgroundColor: theme.primary },
                      ]}>
                      <ThemedText
                        type="small"
                        themeColor={isFuture ? 'textSecondary' : 'text'}
                        style={[isSelected && styles.selectedDayText, isFuture && styles.futureDayText]}>
                        {day}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </ThemedView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: Spacing.two,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendar: {
    width: 300,
    borderRadius: Spacing.four,
    borderWidth: 1,
    padding: Spacing.four,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayCell: {
    width: `${100 / 7}%`,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  futureDayText: {
    opacity: 0.4,
  },
});
