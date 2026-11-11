import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { eraOf } from '../data/arenas';
import { FIGURE_MAP } from '../data/figures';
import { computeRanking, type RankingRow } from '../engine/meta';
import { useNav } from '../nav';
import { useProfile } from '../storage';
import { C, F } from '../theme';
import type { Era } from '../types';
import { Avatar, Bar, Card, FadeIn, H1, P, Section } from '../ui';
import { Screen } from './common';
import { EraChips } from './PickerScreen';

export default function RankingScreen() {
  const nav = useNav();
  const profile = useProfile();
  const [rows, setRows] = useState<RankingRow[] | null>(null);
  const [era, setEra] = useState<Era | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setRows(computeRanking()), 60);
    return () => clearTimeout(t);
  }, []);

  const shown = useMemo(() => (rows ?? []).filter((r) => !era || eraOf(r.fig.year) === era), [rows, era]);
  const podium = shown.slice(0, 3);

  const mine = Object.entries(profile.wins)
    .filter(([id]) => FIGURE_MAP[id])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <Screen>
      <H1>Weltrangliste</H1>
      <P>
        Jeder gegen jeden: Alle Paarungen wurden mehrfach simuliert. Das ist die ewige Tabelle der Arena – rein
        spielerisch.
      </P>
      <EraChips era={era} setEra={setEra} />

      {!rows ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <ActivityIndicator color={C.gold} size="large" />
          <P style={{ marginTop: 12 }}>Simuliere tausende Kämpfe …</P>
        </View>
      ) : (
        <>
          <View style={styles.podium}>
            {[1, 0, 2].map((i) => {
              const r = podium[i];
              if (!r) return <View key={i} style={{ flex: 1 }} />;
              const h = i === 0 ? 150 : i === 1 ? 120 : 100;
              return (
                <FadeIn key={r.fig.id} delay={i * 150} style={{ flex: 1, alignItems: 'center' }}>
                  <Pressable onPress={() => nav.openDetail(r.fig.id)} style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 26 }}>{['🥇', '🥈', '🥉'][i]}</Text>
                    <Avatar fig={r.fig} size={i === 0 ? 72 : 58} ring={C.gold} />
                    <Text style={styles.podName} numberOfLines={2}>
                      {r.fig.name}
                    </Text>
                  </Pressable>
                  <View style={[styles.podBlock, { height: h }]}>
                    <Text style={styles.podPct}>{Math.round(r.pct * 100)}%</Text>
                  </View>
                </FadeIn>
              );
            })}
          </View>

          <Card style={{ padding: 0, marginTop: 16 }}>
            {shown.map((r, i) => (
              <Pressable
                key={r.fig.id}
                onPress={() => nav.openDetail(r.fig.id)}
                style={({ pressed }) => [styles.row, i > 0 && styles.rowBorder, pressed && { backgroundColor: C.surface2 }]}
              >
                <Text style={styles.rank}>{r.rank}</Text>
                <Avatar fig={r.fig} size={36} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.name} numberOfLines={1}>
                    {r.fig.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Bar value={r.pct * 100} height={6} color={r.rank <= 10 ? C.gold : '#8f7f5a'} />
                  </View>
                </View>
                <Text style={styles.pct}>{Math.round(r.pct * 100)}%</Text>
              </Pressable>
            ))}
          </Card>
        </>
      )}

      {mine.length > 0 && (
        <Section title="⭐ Deine Hall of Fame">
          <Card>
            {mine.map(([id, n]) => (
              <View key={id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
                <Avatar fig={FIGURE_MAP[id]} size={32} />
                <Text style={{ color: C.text, flex: 1, marginLeft: 10 }}>{FIGURE_MAP[id].name}</Text>
                <Text style={{ color: C.gold, fontWeight: '700' }}>{n} Siege</Text>
              </View>
            ))}
          </Card>
        </Section>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  podium: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 20, gap: 8 },
  podName: { color: C.text, fontFamily: F.title, fontSize: 12, textAlign: 'center', marginTop: 6, minHeight: 32 },
  podBlock: {
    width: '100%',
    marginTop: 6,
    backgroundColor: C.surface2,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    borderColor: C.goldDeep,
    alignItems: 'center',
    paddingTop: 10,
  },
  podPct: { fontFamily: F.display, color: C.gold, fontSize: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: C.line },
  rank: { width: 30, color: C.muted, fontFamily: F.title, fontSize: 14 },
  name: { color: C.text, fontSize: 14, fontWeight: '600' },
  pct: { width: 46, textAlign: 'right', color: C.gold, fontWeight: '700' },
});
