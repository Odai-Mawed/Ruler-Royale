import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { eraOf, power } from '../data/arenas';
import { FIGURES, FIGURE_MAP } from '../data/figures';
import { randomSeed } from '../engine/rng';
import { useNav } from '../nav';
import { useProfile } from '../storage';
import { C, F, SIDE, shadow } from '../theme';
import { Avatar, Btn, Card, FadeIn, P, Pulse, Section } from '../ui';
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
    <Pressable onPress={onPress} style={({ pressed }) => [styles.slot, { borderColor: SIDE[side] }, pressed && { opacity: 0.8 }]}>
      {fig ? (
        <>
          <Avatar fig={fig} size={84} ring={SIDE[side]} />
          <Text style={styles.slotName} numberOfLines={2}>
            {fig.name}
          </Text>
          <Text style={styles.slotTitle} numberOfLines={1}>
            {fig.title}
          </Text>
          <View style={styles.powerBadge}>
            <Text style={styles.powerText}>⚡ {power(fig)}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={[styles.emptyAvatar, { borderColor: SIDE[side] }]}>
            <Text style={{ fontSize: 34, color: SIDE[side] }}>?</Text>
          </View>
          <Text style={styles.slotName}>Kämpfer wählen</Text>
        </>
      )}
      <Text style={[styles.slotHint, { color: SIDE[side] }]}>{fig ? 'Tippen zum Ändern' : 'Tippen'}</Text>
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
      <LinearGradient colors={['#2a1f0a', '#120f19']} style={[styles.hero, shadow]}>
        <Text style={styles.crown}>👑</Text>
        <Text style={styles.logo}>RULER ROYALE</Text>
        <Text style={styles.tagline}>Die Arena der Weltgeschichte. Wer hätte gewonnen?</Text>
        <Text style={styles.sub}>
          {FIGURES.length} Herrscher, Feldherren & Genies · 5 Runden · 8 Arenen · Zufallsereignisse
        </Text>
      </LinearGradient>

      <View style={styles.vsRow}>
        <Slot id={a} side={0} onPress={() => pick('a')} />
        <View style={styles.vsCol}>
          <Pulse>
            <Text style={styles.vs}>VS</Text>
          </Pulse>
          <Pressable onPress={() => nav.setSelection({ a: b, b: a })} hitSlop={10} accessibilityLabel="Seiten tauschen">
            <Text style={{ fontSize: 20, marginTop: 8 }}>🔄</Text>
          </Pressable>
        </View>
        <Slot id={b} side={1} onPress={() => pick('b')} />
      </View>

      {a && b && (
        <Text style={styles.gap}>
          ⏳ {gapText(FIGURE_MAP[a].year, FIGURE_MAP[b].year)} · {eraOf(FIGURE_MAP[a].year)} vs. {eraOf(FIGURE_MAP[b].year)}
        </Text>
      )}

      <View style={styles.actions}>
        <Btn label="⚔️  ZUM KAMPF!" onPress={fight} disabled={!a || !b} style={{ flex: 2 }} />
        <Btn label="🎲 Zufall" onPress={random} variant="ghost" style={{ flex: 1 }} />
      </View>

      <Section title="🔥 Traumduelle">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
          {DREAM_MATCHES.map((m, i) => {
            const fa = FIGURE_MAP[m.a];
            const fb = FIGURE_MAP[m.b];
            return (
              <FadeIn key={m.a + m.b} delay={i * 40}>
                <Pressable
                  onPress={() => {
                    nav.setSelection({ a: m.a, b: m.b });
                    nav.openBattle({ a: m.a, b: m.b, seed: randomSeed(), predict: true, record: true });
                  }}
                  style={({ pressed }) => [styles.dream, pressed && { opacity: 0.8 }]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar fig={fa} size={46} ring={C.red} />
                    <Text style={styles.dreamVs}>vs</Text>
                    <Avatar fig={fb} size={46} ring={C.blue} />
                  </View>
                  <Text style={styles.dreamTag}>{m.tag}</Text>
                  <Text style={styles.dreamNames} numberOfLines={2}>
                    {fa.name} vs. {fb.name}
                  </Text>
                </Pressable>
              </FadeIn>
            );
          })}
        </ScrollView>
      </Section>

      <Section title="🎯 Deine Bilanz">
        <View style={styles.statsRow}>
          <Stat label="Kämpfe" value={String(profile.battles)} />
          <Stat label="Trefferquote" value={profile.predTotal ? `${quote}%` : '–'} />
          <Stat label="Serie" value={`🔥 ${profile.streak}`} />
          <Stat label="Rekord" value={`🏅 ${profile.bestStreak}`} />
        </View>
        <P style={{ marginTop: 8, fontSize: 13 }}>
          Tippe vor jedem Kampf auf den Sieger und baue deine Siegesserie aus.
        </P>
      </Section>

      {profile.history.length > 0 && (
        <Section title="📜 Letzte Kämpfe">
          <Card style={{ padding: 0 }}>
            {profile.history.slice(0, 8).map((h, i) => {
              const fa = FIGURE_MAP[h.a];
              const fb = FIGURE_MAP[h.b];
              if (!fa || !fb) return null;
              return (
                <Pressable
                  key={h.t + h.seed}
                  onPress={() => nav.openBattle({ a: h.a, b: h.b, seed: h.seed, predict: false, record: false, label: 'Wiederholung' })}
                  style={[styles.histRow, i > 0 && { borderTopWidth: 1, borderTopColor: C.line }]}
                >
                  <Text style={[styles.histName, h.w === h.a && styles.histWin]} numberOfLines={1}>
                    {h.w === h.a ? '👑 ' : ''}
                    {fa.name}
                  </Text>
                  <Text style={{ color: C.dim, marginHorizontal: 8 }}>vs</Text>
                  <Text style={[styles.histName, { textAlign: 'right' }, h.w === h.b && styles.histWin]} numberOfLines={1}>
                    {fb.name}
                    {h.w === h.b ? ' 👑' : ''}
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
  <Card style={{ flex: 1, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 6 }}>
    <Text style={{ color: C.gold, fontFamily: F.title, fontSize: 18 }}>{value}</Text>
    <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{label}</Text>
  </Card>
);

export const gapText = (y1: number, y2: number) => {
  const d = Math.abs(y1 - y2);
  if (d < 15) return 'Zeitgenossen!';
  return `${d.toLocaleString('de-DE')} Jahre Zeitreise`;
};

const styles = StyleSheet.create({
  hero: {
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a3a16',
  },
  crown: { fontSize: 40 },
  logo: { fontFamily: F.display, color: C.gold, fontSize: 34, letterSpacing: 3, textAlign: 'center' },
  tagline: { color: C.text, fontSize: 16, marginTop: 6, textAlign: 'center' },
  sub: { color: C.muted, fontSize: 12, marginTop: 6, textAlign: 'center' },
  vsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  vsCol: { width: 60, alignItems: 'center' },
  vs: { fontFamily: F.display, fontSize: 30, color: C.gold },
  slot: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 2,
    paddingVertical: 18,
    paddingHorizontal: 8,
    minHeight: 210,
    justifyContent: 'center',
  },
  emptyAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotName: { color: C.text, fontFamily: F.title, fontSize: 15, textAlign: 'center', marginTop: 10 },
  slotTitle: { color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 2 },
  slotHint: { fontSize: 11, marginTop: 8, opacity: 0.8 },
  powerBadge: { marginTop: 8, backgroundColor: C.surface2, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  powerText: { color: C.gold, fontSize: 12, fontWeight: '700' },
  gap: { color: C.muted, textAlign: 'center', marginTop: 12, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  dream: {
    width: 170,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    padding: 12,
    alignItems: 'center',
  },
  dreamVs: { color: C.gold, fontFamily: F.display, marginHorizontal: 6 },
  dreamTag: { color: C.gold, fontSize: 12, fontWeight: '700', marginTop: 8, textAlign: 'center' },
  dreamNames: { color: C.text, fontSize: 13, marginTop: 2, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 8 },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14 },
  histName: { flex: 1, color: C.muted, fontSize: 14 },
  histWin: { color: C.gold, fontWeight: '700' },
});
