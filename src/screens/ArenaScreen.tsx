import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { eraOf, power } from '../data/arenas';
import { FIGURES, FIGURE_MAP } from '../data/figures';
import { randomSeed } from '../engine/rng';
import { useNav } from '../nav';
import { useProfile } from '../storage';
import { C, SIDE } from '../theme';
import { Avatar, Btn, Card, H1, P, Section } from '../ui';
import { Screen } from './common';

export const DREAM_MATCHES: { a: string; b: string; tag: string }[] = [
  { a: 'napoleon', b: 'omar', tag: 'Kaiser vs. Kalif' },
  { a: 'churchill', b: 'trump', tag: 'Bulldogge vs. Dealmaker' },
  { a: 'alexander', b: 'dschingis', tag: 'Die größten Eroberer' },
  { a: 'caesar', b: 'hannibal', tag: 'Rom vs. Karthago 2.0' },
  { a: 'saladin', b: 'richard', tag: 'Revanche der Kreuzzüge' },
  { a: 'kleopatra', b: 'elisabeth', tag: 'Duell der Königinnen' },
  { a: 'einstein', b: 'leonardo', tag: 'Genie gegen Genie' },
  { a: 'bismarck', b: 'machiavelli', tag: 'Realpolitik-Gipfel' },
  { a: 'sunzi', b: 'napoleon', tag: 'Theorie vs. Praxis' },
  { a: 'merkel', b: 'thatcher', tag: 'Eiserne Kanzlerinnen' },
  { a: 'lincoln', b: 'washington', tag: 'Mount-Rushmore-Derby' },
  { a: 'sueleyman', b: 'karl', tag: 'Orient trifft Okzident' },
  { a: 'gandhi', b: 'dschingis', tag: 'Gewaltlos vs. grenzenlos' },
  { a: 'obama', b: 'trump', tag: 'Weißes-Haus-Derby' },
  { a: 'qin', b: 'augustus', tag: 'Erste Kaiser unter sich' },
  { a: 'mansa-musa', b: 'ludwig', tag: 'Gold vs. Glanz' },
];

const Slot = ({ id, side, onPress }: { id?: string; side: 0 | 1; onPress: () => void }) => {
  const fig = id ? FIGURE_MAP[id] : undefined;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.slot, pressed && { opacity: 0.7 }]}>
      <View style={[styles.sideDot, { backgroundColor: SIDE[side] }]} />
      {fig ? (
        <>
          <Avatar fig={fig} size={64} />
          <Text style={styles.slotName} numberOfLines={2}>
            {fig.name}
          </Text>
          <Text style={styles.slotTitle} numberOfLines={1}>
            {fig.title}
          </Text>
        </>
      ) : (
        <Text style={styles.slotName}>Kämpfer wählen</Text>
      )}
      <Text style={styles.slotHint}>Ändern</Text>
    </Pressable>
  );
};

export default function ArenaScreen() {
  const nav = useNav();
  const profile = useProfile();
  const { a, b } = nav.selection;

  const pick = (side: 'a' | 'b') =>
    nav.openPicker(
      side === 'a' ? 'Kämpfer Rot wählen' : 'Kämpfer Blau wählen',
      (id) => nav.setSelection({ ...nav.selection, [side]: id }),
      side === 'a' ? b : a,
    );

  const random = () => {
    const i = Math.floor(Math.random() * FIGURES.length);
    let j = Math.floor(Math.random() * (FIGURES.length - 1));
    if (j >= i) j++;
    nav.setSelection({ a: FIGURES[i].id, b: FIGURES[j].id });
  };

  const fight = () => {
    if (a && b) nav.openBattle({ a, b, seed: randomSeed(), predict: true, record: true });
  };

  const quote = Math.round((profile.predCorrect / Math.max(1, profile.predTotal)) * 100);

  return (
    <Screen>
      <H1>Ruler Royale</H1>
      <P>Wähle zwei Persönlichkeiten der Geschichte und finde heraus, wer gewonnen hätte.</P>

      <View style={styles.vsRow}>
        <Slot id={a} side={0} onPress={() => pick('a')} />
        <Pressable
          onPress={() => nav.setSelection({ a: b, b: a })}
          hitSlop={10}
          accessibilityLabel="Seiten tauschen"
          style={styles.vsCol}
        >
          <Text style={styles.vs}>vs</Text>
          <Text style={styles.swap}>⇄</Text>
        </Pressable>
        <Slot id={b} side={1} onPress={() => pick('b')} />
      </View>

      {a && b && (
        <Text style={styles.gap}>
          {gapText(FIGURE_MAP[a].year, FIGURE_MAP[b].year)} · {eraOf(FIGURE_MAP[a].year)} vs. {eraOf(FIGURE_MAP[b].year)}
        </Text>
      )}

      <View style={styles.actions}>
        <Btn label="Kampf starten" onPress={fight} disabled={!a || !b} style={{ flex: 2 }} />
        <Btn label="Zufall" onPress={random} variant="ghost" style={{ flex: 1 }} />
      </View>

      <Section title="Traumduelle">
        <Card style={{ padding: 0 }}>
          {DREAM_MATCHES.map((m, i) => {
            const fa = FIGURE_MAP[m.a];
            const fb = FIGURE_MAP[m.b];
            return (
              <Pressable
                key={m.a + m.b}
                onPress={() => {
                  nav.setSelection({ a: m.a, b: m.b });
                  nav.openBattle({ a: m.a, b: m.b, seed: randomSeed(), predict: true, record: true });
                }}
                style={({ pressed }) => [styles.row, i > 0 && styles.rowBorder, pressed && { backgroundColor: C.surface2 }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {fa.name} vs. {fb.name}
                  </Text>
                  <Text style={styles.rowSub}>{m.tag}</Text>
                </View>
                <Text style={styles.chev}>›</Text>
              </Pressable>
            );
          })}
        </Card>
      </Section>

      <Section title="Deine Bilanz">
        <View style={styles.statsRow}>
          <Stat label="Kämpfe" value={String(profile.battles)} />
          <Stat label="Treffer" value={profile.predTotal ? `${quote}%` : '–'} />
          <Stat label="Serie" value={String(profile.streak)} />
          <Stat label="Rekord" value={String(profile.bestStreak)} />
        </View>
        <P style={{ marginTop: 8, fontSize: 13 }}>Tippe vor jedem Kampf auf den Sieger, um deine Serie auszubauen.</P>
      </Section>

      {profile.history.length > 0 && (
        <Section title="Letzte Kämpfe">
          <Card style={{ padding: 0 }}>
            {profile.history.slice(0, 8).map((h, i) => {
              const fa = FIGURE_MAP[h.a];
              const fb = FIGURE_MAP[h.b];
              if (!fa || !fb) return null;
              return (
                <Pressable
                  key={h.t + h.seed}
                  onPress={() => nav.openBattle({ a: h.a, b: h.b, seed: h.seed, predict: false, record: false, label: 'Wiederholung' })}
                  style={[styles.row, i > 0 && styles.rowBorder]}
                >
                  <Text style={[styles.histName, h.w === h.a && styles.histWin]} numberOfLines={1}>
                    {fa.name}
                  </Text>
                  <Text style={{ color: C.dim, marginHorizontal: 8 }}>vs</Text>
                  <Text style={[styles.histName, { textAlign: 'right' }, h.w === h.b && styles.histWin]} numberOfLines={1}>
                    {fb.name}
                  </Text>
                </Pressable>
              );
            })}
          </Card>
        </Section>
      )}
    </Screen>
  );
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.stat}>
    <Text style={{ color: C.text, fontWeight: '700', fontSize: 20 }}>{value}</Text>
    <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{label}</Text>
  </View>
);

export const gapText = (y1: number, y2: number) => {
  const d = Math.abs(y1 - y2);
  if (d < 15) return 'Zeitgenossen';
  return `${d.toLocaleString('de-DE')} Jahre auseinander`;
};

const styles = StyleSheet.create({
  vsRow: { flexDirection: 'row', alignItems: 'stretch', marginTop: 24 },
  vsCol: { width: 48, alignItems: 'center', justifyContent: 'center' },
  vs: { fontWeight: '600', fontSize: 16, color: C.muted },
  swap: { fontSize: 18, color: C.muted, marginTop: 6 },
  slot: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    paddingVertical: 20,
    paddingHorizontal: 8,
    minHeight: 180,
    justifyContent: 'center',
  },
  sideDot: { position: 'absolute', top: 10, left: 10, width: 8, height: 8, borderRadius: 4 },
  slotName: { color: C.text, fontWeight: '600', fontSize: 15, textAlign: 'center', marginTop: 10 },
  slotTitle: { color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 2 },
  slotHint: { fontSize: 12, marginTop: 8, color: C.dim },
  gap: { color: C.muted, textAlign: 'center', marginTop: 12, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: C.line },
  rowTitle: { color: C.text, fontSize: 14, fontWeight: '500' },
  rowSub: { color: C.muted, fontSize: 12, marginTop: 2 },
  chev: { color: C.dim, fontSize: 20, marginLeft: 8 },
  statsRow: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: C.surface2, borderRadius: 10 },
  histName: { flex: 1, color: C.muted, fontSize: 14 },
  histWin: { color: C.text, fontWeight: '700' },
});
