import AsyncStorage from '@react-native-async-storage/async-storage';

import { CycleEntry, UserProfile } from '@/lib/types';

export const MAX_USERS = 3;

const USERS_KEY = 'flo-calculator/users';
const ACTIVE_USER_KEY = 'flo-calculator/active-user';
const historyKey = (userId: string) => `flo-calculator/cycle-history/${userId}`;
const lastInputsKey = (userId: string) => `flo-calculator/last-inputs/${userId}`;

export type LastInputs = {
  periodLength: number;
  cycleLength: number;
};

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// --- Users (up to MAX_USERS, each with their own separately stored dashboard) ---

export async function getUsers(): Promise<UserProfile[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as UserProfile[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function setUsers(users: UserProfile[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function createUser(name: string): Promise<UserProfile[]> {
  const users = await getUsers();
  if (users.length >= MAX_USERS) {
    throw new Error(`You can only have up to ${MAX_USERS} profiles on this device.`);
  }

  const user: UserProfile = { id: generateId(), name: name.trim(), createdAt: new Date().toISOString() };
  const next = [...users, user];
  await setUsers(next);
  await setActiveUserId(user.id);
  return next;
}

export async function deleteUser(id: string): Promise<UserProfile[]> {
  const users = await getUsers();
  const next = users.filter((user) => user.id !== id);
  await setUsers(next);
  await AsyncStorage.multiRemove([historyKey(id), lastInputsKey(id)]);

  const activeId = await getActiveUserId();
  if (activeId === id) {
    await setActiveUserId(next[0]?.id ?? null);
  }
  return next;
}

export async function getActiveUserId(): Promise<string | null> {
  return AsyncStorage.getItem(ACTIVE_USER_KEY);
}

export async function setActiveUserId(id: string | null): Promise<void> {
  if (id) {
    await AsyncStorage.setItem(ACTIVE_USER_KEY, id);
  } else {
    await AsyncStorage.removeItem(ACTIVE_USER_KEY);
  }
}

// --- Per-user cycle history and calculator defaults ---

export async function getHistory(userId: string): Promise<CycleEntry[]> {
  const raw = await AsyncStorage.getItem(historyKey(userId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CycleEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function setHistory(userId: string, entries: CycleEntry[]): Promise<void> {
  await AsyncStorage.setItem(historyKey(userId), JSON.stringify(entries));
}

export async function saveCycleEntry(userId: string, entry: CycleEntry): Promise<CycleEntry[]> {
  const current = await getHistory(userId);
  const next = [...current, entry];
  await setHistory(userId, next);
  return next;
}

export async function deleteCycleEntry(userId: string, id: string): Promise<CycleEntry[]> {
  const current = await getHistory(userId);
  const next = current.filter((entry) => entry.id !== id);
  await setHistory(userId, next);
  return next;
}

export async function getLastInputs(userId: string): Promise<LastInputs | null> {
  const raw = await AsyncStorage.getItem(lastInputsKey(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LastInputs;
  } catch {
    return null;
  }
}

export async function setLastInputs(userId: string, inputs: LastInputs): Promise<void> {
  await AsyncStorage.setItem(lastInputsKey(userId), JSON.stringify(inputs));
}
