import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { eraOf } from '../data/arenas';
import { FIGURE_MAP } from '../data/figures';
import { computeRanking, type RankingRow } from '../engine/meta';
import { useNav } from '../nav';
import { useProfile } from '../storage';
import { C } from '../theme';
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
          <ActivityIndicator color={C.muted} />
          <P style={{ marginTop: 12 }}>Simuliere tausende Kämpfe …</P>
        </View>
      ) : (
        <>
          <Card style={{ padding: 0, marginTop: 8 }}>
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
                    <Bar value={r.pct * 100} height={6} color={r.rank <= 10 ? C.text : C.dim} />
                  </View>
                </View>
                <Text style={styles.pct}>{Math.round(r.pct * 100)}%</Text>
              </Pressable>
            ))}
          </Card>
        </>
      )}

      {mine.length > 0 && (
        <Section title="Deine Hall of Fame">
          <Card>
            {mine.map(([id, n]) => (
              <View key={id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
                <Avatar fig={FIGURE_MAP[id]} size={32} />
                <Text style={{ color: C.text, flex: 1, marginLeft: 10 }}>{FIGURE_MAP[id].name}</Text>
                <Text style={{ color: C.muted }}>{n} Siege</Text>
              </View>
            ))}
          </Card>
        </Section>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: C.line },
  rank: { width: 30, color: C.muted, fontWeight: '600', fontSize: 14 },
  name: { color: C.text, fontSize: 14, fontWeight: '600' },
  pct: { width: 46, textAlign: 'right', color: C.text, fontWeight: '600' },
});
