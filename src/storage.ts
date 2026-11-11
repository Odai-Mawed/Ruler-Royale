import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface HistoryEntry {
  a: string;
  b: string;
  w: string;
  seed: string;
  t: number;
}

export interface Profile {
  battles: number;
  predTotal: number;
  predCorrect: number;
  streak: number;
  bestStreak: number;
  wins: Record<string, number>;
  history: HistoryEntry[];
  champions: Record<string, number>;
}

const KEY = 'ruler-royale:profile:v1';

const EMPTY: Profile = {
  battles: 0,
  predTotal: 0,
  predCorrect: 0,
  streak: 0,
  bestStreak: 0,
  wins: {},
  history: [],
  champions: {},
};

let memory: Profile = EMPTY;
const listeners = new Set<(p: Profile) => void>();
let loaded = false;

const persist = async (p: Profile) => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Speicher nicht verfügbar (z. B. privates Fenster) – App läuft trotzdem.
  }
};

const set = (p: Profile) => {
  memory = p;
  listeners.forEach((l) => l(p));
  persist(p);
};

const load = async () => {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      memory = { ...EMPTY, ...JSON.parse(raw) };
      listeners.forEach((l) => l(memory));
    }
  } catch {
    // ignorieren
  }
};

export const recordBattle = (entry: HistoryEntry, prediction?: string) => {
  const p = { ...memory, wins: { ...memory.wins } };
  p.battles += 1;
  p.wins[entry.w] = (p.wins[entry.w] ?? 0) + 1;
  p.history = [entry, ...memory.history].slice(0, 25);
  if (prediction) {
    p.predTotal += 1;
    if (prediction === entry.w) {
      p.predCorrect += 1;
      p.streak += 1;
      p.bestStreak = Math.max(p.bestStreak, p.streak);
    } else {
      p.streak = 0;
    }
  }
  set(p);
};

export const recordChampion = (id: string) => {
  set({ ...memory, champions: { ...memory.champions, [id]: (memory.champions[id] ?? 0) + 1 } });
};

export const resetProfile = () => set(EMPTY);

export const useProfile = () => {
  const [p, setP] = useState<Profile>(memory);
  useEffect(() => {
    listeners.add(setP);
    load();
    return () => {
      listeners.delete(setP);
    };
  }, []);
  return p;
};

export const useToggle = (initial = false) => {
  const [v, setV] = useState(initial);
  const toggle = useCallback(() => setV((x) => !x), []);
  return [v, toggle, setV] as const;
};
