import { Cinzel_700Bold } from '@expo-google-fonts/cinzel/700Bold';
import { Cinzel_900Black } from '@expo-google-fonts/cinzel/900Black';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FIGURE_MAP } from './src/data/figures';
import { NavContext, type BattleRequest, type Nav, type Tab } from './src/nav';
import ArenaScreen from './src/screens/ArenaScreen';
import BattleScreen from './src/screens/BattleScreen';
import DetailScreen from './src/screens/DetailScreen';
import InfoScreen from './src/screens/InfoScreen';
import LexikonScreen from './src/screens/LexikonScreen';
import PickerScreen from './src/screens/PickerScreen';
import RankingScreen from './src/screens/RankingScreen';
import TournamentScreen from './src/screens/TournamentScreen';
import { C, F } from './src/theme';

type Overlay =
  | { type: 'detail'; id: string }
  | { type: 'battle'; req: BattleRequest; key: number }
  | { type: 'picker'; title: string; onPick: (id: string) => void; exclude?: string };

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'arena', icon: '⚔️', label: 'Arena' },
  { id: 'lexikon', icon: '📚', label: 'Lexikon' },
  { id: 'turnier', icon: '🏆', label: 'Turnier' },
  { id: 'rangliste', icon: '📊', label: 'Rangliste' },
  { id: 'info', icon: '📖', label: 'Regeln' },
];

const readUrlBattle = (): BattleRequest | null => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  const a = q.get('a');
  const b = q.get('b');
  if (a && b && FIGURE_MAP[a] && FIGURE_MAP[b] && a !== b) {
    return { a, b, seed: q.get('s') ?? undefined, predict: true, record: true };
  }
  return null;
};

function Shell() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('arena');
  const [stack, setStack] = useState<Overlay[]>([]);
  const [selection, setSelection] = useState<{ a?: string; b?: string }>({ a: 'napoleon', b: 'omar' });

  useEffect(() => {
    const req = readUrlBattle();
    if (req) {
      setSelection({ a: req.a, b: req.b });
      setStack([{ type: 'battle', req, key: Date.now() }]);
    }
  }, []);

  const close = useCallback(() => setStack((s) => s.slice(0, -1)), []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length) {
        close();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, close]);

  const nav: Nav = useMemo(
    () => ({
      tab,
      setTab: (t) => {
        setStack([]);
        setTab(t);
      },
      openDetail: (id) => setStack((s) => [...s, { type: 'detail', id }]),
      openBattle: (req) => setStack((s) => [...s.filter((o) => o.type !== 'picker'), { type: 'battle', req, key: Date.now() }]),
      openPicker: (title, onPick, exclude) => setStack((s) => [...s, { type: 'picker', title, onPick, exclude }]),
      close,
      selection,
      setSelection,
      addFighter: (id) => {
        setSelection((sel) => {
          if (sel.a === id || sel.b === id) return sel;
          if (!sel.a) return { ...sel, a: id };
          if (!sel.b) return { ...sel, b: id };
          return { a: sel.a, b: id };
        });
        setStack([]);
        setTab('arena');
      },
    }),
    [tab, selection, close],
  );

  const top = stack[stack.length - 1];

  return (
    <NavContext.Provider value={nav}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={{ flex: 1 }}>
          {tab === 'arena' && <ArenaScreen />}
          {tab === 'lexikon' && <LexikonScreen />}
          {tab === 'turnier' && <TournamentScreen />}
          {tab === 'rangliste' && <RankingScreen />}
          {tab === 'info' && <InfoScreen />}
        </View>
        <View style={[styles.tabbar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          {TABS.map((t) => {
            const active = t.id === tab && !top;
            return (
              <Pressable key={t.id} onPress={() => nav.setTab(t.id)} style={styles.tab} accessibilityRole="tab">
                <Text style={[styles.tabIcon, !active && { opacity: 0.55 }]}>{t.icon}</Text>
                <Text style={[styles.tabLabel, active && { color: C.gold }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {stack.map((o, i) => (
          <View key={i} style={[StyleSheet.absoluteFill, styles.overlay, { paddingTop: insets.top }]}>
            {o.type === 'detail' && <DetailScreen id={o.id} />}
            {o.type === 'battle' && <BattleScreen key={o.key} req={o.req} />}
            {o.type === 'picker' && (
              <PickerScreen
                title={o.title}
                exclude={o.exclude}
                onPick={(id) => {
                  close();
                  o.onPick(id);
                }}
              />
            )}
          </View>
        ))}
      </View>
    </NavContext.Provider>
  );
}

export default function App() {
  const [loaded] = useFonts({ Cinzel_700Bold, Cinzel_900Black });
  if (!loaded) {
    return (
      <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={C.gold} />
      </View>
    );
  }
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Shell />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  overlay: { backgroundColor: C.bg },
  tabbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: C.line,
    backgroundColor: C.bg2,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  tabIcon: { fontSize: 20 },
  tabLabel: { color: C.muted, fontSize: 11, fontFamily: F.title },
});
