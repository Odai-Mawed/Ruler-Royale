import { createContext, useContext } from 'react';

export type Tab = 'arena' | 'lexikon' | 'turnier' | 'rangliste' | 'info';

export interface BattleRequest {
  a: string;
  b: string;
  seed?: string;
  predict?: boolean;
  record?: boolean;
  label?: string;
}

export interface Nav {
  tab: Tab;
  setTab: (t: Tab) => void;
  openDetail: (id: string) => void;
  openBattle: (req: BattleRequest) => void;
  openPicker: (title: string, onPick: (id: string) => void, exclude?: string) => void;
  close: () => void;
  selection: { a?: string; b?: string };
  setSelection: (s: { a?: string; b?: string }) => void;
  addFighter: (id: string) => void;
}

export const NavContext = createContext<Nav | null>(null);

export const useNav = () => {
  const n = useContext(NavContext);
  if (!n) throw new Error('NavContext fehlt');
  return n;
};
