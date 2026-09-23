import AsyncStorage from '@react-native-async-storage/async-storage';

import { CycleEntry } from '@/lib/types';

const HISTORY_KEY = 'flo-calculator/cycle-history';
const LAST_INPUTS_KEY = 'flo-calculator/last-inputs';

export type LastInputs = {
  periodLength: number;
  cycleLength: number;
};

export async function getHistory(): Promise<CycleEntry[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CycleEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function setHistory(entries: CycleEntry[]): Promise<void> {
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

export async function saveCycleEntry(entry: CycleEntry): Promise<CycleEntry[]> {
  const current = await getHistory();
  const next = [...current, entry];
  await setHistory(next);
  return next;
}

export async function deleteCycleEntry(id: string): Promise<CycleEntry[]> {
  const current = await getHistory();
  const next = current.filter((entry) => entry.id !== id);
  await setHistory(next);
  return next;
}

export async function getLastInputs(): Promise<LastInputs | null> {
  const raw = await AsyncStorage.getItem(LAST_INPUTS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LastInputs;
  } catch {
    return null;
  }
}

export async function setLastInputs(inputs: LastInputs): Promise<void> {
  await AsyncStorage.setItem(LAST_INPUTS_KEY, JSON.stringify(inputs));
}
