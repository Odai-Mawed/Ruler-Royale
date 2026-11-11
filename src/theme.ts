import { Platform } from 'react-native';

export const C = {
  bg: '#0b0a10',
  bg2: '#12101a',
  surface: '#17151f',
  surface2: '#221f2d',
  line: '#2e2a3b',
  gold: '#e8c26a',
  goldDeep: '#a8842f',
  text: '#f3eee2',
  muted: '#a49e8f',
  dim: '#6e6879',
  red: '#e2574c',
  blue: '#4c8fe2',
  green: '#4cc38a',
};

export const SIDE = [C.red, C.blue] as const;

export const F = {
  display: 'Cinzel_900Black',
  title: 'Cinzel_700Bold',
};

export const shadow = Platform.select({
  web: { boxShadow: '0 6px 24px rgba(0,0,0,0.45)' } as object,
  default: { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
});

export const MAX_W = 960;
