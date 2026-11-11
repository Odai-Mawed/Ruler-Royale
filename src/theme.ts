// Schlichtes, helles Design: eine Akzentfarbe, flache Flächen, Systemschrift.
export const C = {
  bg: '#ffffff',
  bg2: '#ffffff',
  surface: '#ffffff',
  surface2: '#f2f2f4',
  line: '#e7e7eb',
  gold: '#111111', // Akzentfarbe (historischer Name)
  goldDeep: '#111111',
  onAccent: '#ffffff',
  text: '#111111',
  muted: '#6b6b76',
  dim: '#a3a3ad',
  red: '#d9443a',
  blue: '#2f6fdb',
  green: '#1f9d61',
};

export const SIDE = [C.red, C.blue] as const;

export const MAX_W = 760;
