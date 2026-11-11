import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ARENAS, ERA_COLORS, STAT_ICONS, STAT_KEYS, STAT_LABELS, eraOf, power } from '../data/arenas';
import { FIGURES, FIGURE_MAP } from '../data/figures';
import { homeArenas } from '../engine/battle';
import { matchupProfile } from '../engine/meta';
import { randomSeed } from '../engine/rng';
import { useNav } from '../nav';
import { useProfile } from '../storage';
import { C, F } from '../theme';
import type { Figure } from '../types';
import { Avatar, Bar, Btn, Card, FadeIn, P, Section } from '../ui';
import { OverlayHeader, Screen } from './common';

type Profile = ReturnType<typeof matchupProfile>;

export default function DetailScreen({ id }: { id: string }) {
  const nav = useNav();
  const fig = FIGURE_MAP[id];
  const user = useProfile();
  const [mp, setMp] = useState<Profile | null>(null);

  useEffect(() => {
    setMp(null);
    const t = setTimeout(() => setMp(matchupProfile(fig)), 50);
    return () => clearTimeout(t);
  }, [fig]);

  const [c1, c2] = ERA_COLORS[eraOf(fig.year)];
  const home = ARENAS[homeArenas(fig)[0]];

  const fightRandom = () => {
    const pool = FIGURES.filter((f) => f.id !== fig.id);
    const opp = pool[Math.floor(Math.random() * pool.length)];
    nav.setSelection({ a: fig.id, b: opp.id });
    nav.openBattle({ a: fig.id, b: opp.id, seed: randomSeed(), predict: true, record: true });
  };

  const fightVs = (opp: Figure) => {
    nav.setSelection({ a: fig.id, b: opp.id });
    nav.openBattle({ a: fig.id, b: opp.id, seed: randomSeed(), predict: true, record: true });
  };

  return (
    <View style={{ flex: 1 }}>
      <OverlayHeader title={fig.name} />
      <Screen>
        <LinearGradient colors={[c1 + '55', C.surface]} style={styles.hero}>
          <Avatar fig={fig} size={110} ring={c1} />
          <Text style={styles.name}>{fig.name}</Text>
          <Text style={styles.title}>{fig.title}</Text>
          <Text style={styles.meta}>
            {fig.lived} · {fig.region} · {eraOf(fig.year)}
          </Text>
          <View style={styles.badges}>
            <Badge text={fig.category} />
            <Badge text={`⚡ Stärke ${power(fig)}`} gold />
            {fig.chaos && fig.chaos > 1 && <Badge text="🌪️ Chaos-Faktor" />}
            {user.wins[fig.id] ? <Badge text={`👑 ${user.wins[fig.id]} Siege bei dir`} /> : null}
          </View>
        </LinearGradient>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <Btn label="⚔️ In die Arena" onPress={() => nav.addFighter(fig.id)} style={{ flex: 1 }} />
          <Btn label="🎲 Zufall" onPress={fightRandom} variant="ghost" style={{ flex: 1 }} />
        </View>

        <Section title="📊 Werte">
          <Card>
            {STAT_KEYS.map((k, i) => (
              <View key={k} style={styles.statRow}>
                <Text style={styles.statLabel}>
                  {STAT_ICONS[k]} {STAT_LABELS[k]}
                </Text>
                <Bar value={fig.stats[k]} delay={i * 70} color={fig.stats[k] >= 90 ? C.gold : '#b9a576'} height={10} />
                <Text style={styles.statVal}>{fig.stats[k]}</Text>
              </View>
            ))}
          </Card>
        </Section>

        <Section title="⚔️ Kampfprofil">
          <View style={{ gap: 10 }}>
            <Card>
              <Text style={styles.label}>🎯 Heimarena</Text>
              <Text style={styles.abName}>
                {home.emoji} {home.name}
              </Text>
              <P style={{ fontSize: 13 }}>Hier wählt {fig.name.split(' ')[0]} das Terrain für Runde 1 oder 2.</P>
            </Card>
            <Card style={{ borderColor: C.green + '66' }}>
              <Text style={styles.label}>⚡ Spezialfähigkeit</Text>
              <Text style={styles.abName}>{fig.ability.name}</Text>
              <P style={{ fontSize: 13 }}>
                {fig.ability.desc}
                {fig.ability.value ? ` (+${fig.ability.value})` : ''}
              </P>
            </Card>
            <Card style={{ borderColor: C.red + '66' }}>
              <Text style={styles.label}>💔 Achillesferse</Text>
              <Text style={styles.abName}>{fig.weakness.name}</Text>
              <P style={{ fontSize: 13 }}>
                {fig.weakness.desc}
                {fig.weakness.value ? ` (${fig.weakness.value})` : ''}
              </P>
            </Card>
          </View>
        </Section>

        <Section title="📜 Steckbrief">
          <Card>
            <P style={{ color: C.text }}>{fig.bio}</P>
            <View style={styles.fact}>
              <Text style={styles.label}>💡 Wusstest du?</Text>
              <P style={{ color: C.text, marginTop: 4 }}>{fig.fact}</P>
            </View>
            <View style={[styles.fact, { borderLeftColor: C.dim }]}>
              <Text style={styles.label}>🗯️ Kampfansage (fiktiv)</Text>
              <P style={{ fontStyle: 'italic', marginTop: 4 }}>„{fig.taunt}“</P>
            </View>
          </Card>
        </Section>

        <Section title="🔮 Simulierte Bilanz">
          {!mp ? (
            <ActivityIndicator color={C.gold} style={{ marginVertical: 20 }} />
          ) : (
            <FadeIn>
              <Card>
                <Text style={styles.bigPct}>{Math.round(mp.total * 100)}%</Text>
                <P style={{ textAlign: 'center', fontSize: 13 }}>
                  Siegquote gegen alle {FIGURES.length - 1} anderen (je 6 simulierte Kämpfe)
                </P>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: C.green }]}>😎 Lieblingsgegner</Text>
                    {mp.favorite.map((x) => (
                      <OppRow key={x.opp.id} fig={x.opp} pct={x.pct} onPress={() => fightVs(x.opp)} />
                    ))}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: C.red }]}>😱 Angstgegner</Text>
                    {mp.nemesis.map((x) => (
                      <OppRow key={x.opp.id} fig={x.opp} pct={x.pct} onPress={() => fightVs(x.opp)} />
                    ))}
                  </View>
                </View>
              </Card>
            </FadeIn>
          )}
        </Section>
      </Screen>
    </View>
  );
}

const OppRow = ({ fig, pct, onPress }: { fig: Figure; pct: number; onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.oppRow}>
    <Avatar fig={fig} size={32} />
    <Text style={styles.oppName} numberOfLines={1}>
      {fig.name}
    </Text>
    <Text style={styles.oppPct}>{Math.round(pct * 100)}%</Text>
  </Pressable>
);

const Badge = ({ text, gold }: { text: string; gold?: boolean }) => (
  <View style={[styles.badge, gold && { backgroundColor: C.gold }]}>
    <Text style={[styles.badgeText, gold && { color: '#1a1406' }]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  hero: { borderRadius: 22, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: C.line },
  name: { fontFamily: F.display, color: C.gold, fontSize: 26, textAlign: 'center', marginTop: 12 },
  title: { color: C.text, fontSize: 15, marginTop: 4, textAlign: 'center' },
  meta: { color: C.muted, fontSize: 13, marginTop: 4, textAlign: 'center' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 12 },
  badge: { backgroundColor: C.surface2, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: C.text, fontSize: 12, fontWeight: '600' },
  statRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6, gap: 10 },
  statLabel: { width: 118, color: C.text, fontSize: 13 },
  statVal: { width: 30, textAlign: 'right', color: C.gold, fontWeight: '700' },
  label: { color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: '700' },
  abName: { color: C.text, fontFamily: F.title, fontSize: 16, marginTop: 4, marginBottom: 2 },
  fact: { marginTop: 14, borderLeftWidth: 3, borderLeftColor: C.gold, paddingLeft: 12 },
  bigPct: { fontFamily: F.display, color: C.gold, fontSize: 40, textAlign: 'center' },
  oppRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  oppName: { flex: 1, color: C.text, fontSize: 13 },
  oppPct: { color: C.muted, fontSize: 12, fontWeight: '700' },
});
