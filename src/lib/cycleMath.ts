import { CalculatorResult, CycleEntry } from '@/lib/types';

const LUTEAL_PHASE_DAYS = 14;
const FERTILE_WINDOW_BEFORE_OVULATION = 5;
const FERTILE_WINDOW_AFTER_OVULATION = 1;

export const TYPICAL_PERIOD_LENGTH_RANGE = { min: 2, max: 7 };
export const TYPICAL_CYCLE_LENGTH_RANGE = { min: 21, max: 35 };

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function daysBetween(from: Date, to: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / msPerDay);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function calculateCycle(
  lastPeriodStart: Date,
  periodLength: number,
  cycleLength: number
): CalculatorResult {
  const start = startOfDay(lastPeriodStart);
  const nextPeriodStart = addDays(start, cycleLength);
  const nextPeriodEnd = addDays(nextPeriodStart, periodLength - 1);
  const ovulationDate = addDays(nextPeriodStart, -LUTEAL_PHASE_DAYS);
  const fertileWindowStart = addDays(ovulationDate, -FERTILE_WINDOW_BEFORE_OVULATION);
  const fertileWindowEnd = addDays(ovulationDate, FERTILE_WINDOW_AFTER_OVULATION);

  return {
    lastPeriodStart: start,
    periodLength,
    cycleLength,
    nextPeriodStart,
    nextPeriodEnd,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
  };
}

export function computeAverageCycleLength(history: CycleEntry[]): number | null {
  if (history.length < 2) return null;

  const sorted = [...history].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push(daysBetween(new Date(sorted[i - 1].startDate), new Date(sorted[i].startDate)));
  }

  const average = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  return Math.round(average);
}

export function isLikelyIrregular(periodLength: number, cycleLength: number): boolean {
  return (
    periodLength < TYPICAL_PERIOD_LENGTH_RANGE.min ||
    periodLength > TYPICAL_PERIOD_LENGTH_RANGE.max ||
    cycleLength < TYPICAL_CYCLE_LENGTH_RANGE.min ||
    cycleLength > TYPICAL_CYCLE_LENGTH_RANGE.max
  );
}

export type AnnotatedCycleEntry = CycleEntry & {
  /** Days since the previous logged period; null when there's no earlier entry to compare against. */
  cycleLength: number | null;
  /** null when cycleLength is unknown (the earliest logged entry) */
  isIrregular: boolean | null;
};

/** Sorted oldest-first, each entry's cycle length measured against the one logged before it. */
export function annotateHistoryRegularity(history: CycleEntry[]): AnnotatedCycleEntry[] {
  const sorted = [...history].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return sorted.map((entry, index) => {
    if (index === 0) return { ...entry, cycleLength: null, isIrregular: null };

    const cycleLength = daysBetween(
      new Date(sorted[index - 1].startDate),
      new Date(entry.startDate)
    );
    return { ...entry, cycleLength, isIrregular: isLikelyIrregular(entry.periodLength, cycleLength) };
  });
}

const MONTH_ABBREVIATIONS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

export function formatMonthAbbrev(date: Date): string {
  return MONTH_ABBREVIATIONS[date.getMonth()];
}

/** e.g. "21-25" if the range stays in one month, or "30 Oct - 3 Nov" if it spans two */
export function formatDayRange(start: Date, end: Date): string {
  if (isSameDay(start, end)) return `${start.getDate()}`;
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}-${end.getDate()}`;
  }
  return `${start.getDate()} ${formatMonthAbbrev(start)} - ${end.getDate()} ${formatMonthAbbrev(end)}`;
}

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

export function formatLongDate(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
