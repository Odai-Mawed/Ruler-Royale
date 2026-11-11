import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FIGURES, FIGURE_MAP } from '../data/figures';
import {
  ROUND_NAMES,
  TOURNAMENT_THEMES,
  advanceTournament,
  createTournament,
  type Match,
  type Tournament,
} from '../engine/meta';
import { randomSeed, shuffle } from '../engine/rng';
import { useNav } from '../nav';
import { recordChampion, useProfile } from '../storage';
import { C, F, SIDE, shadow } from '../theme';
import { Avatar, Btn, Card, Chip, FadeIn, H1, P, Pulse, Section } from '../ui';
import { Screen } from './common';

// Turnier bleibt beim Tab-Wechsel erhalten
let saved: Tournament | null = null;

export default function TournamentScreen() {
  const nav = useNav();
  const profile = useProfile();
  const [themeId, setThemeId] = useState('all');
  const [size, setSize] = useState(16);
  const [t, setT] = useState<Tournament | null>(saved);

  useEffect(() => {
    saved = t;
  }, [t]);

  const theme = TOURNAMENT_THEMES.find((x) => x.id === themeId)!;
  const pool = useMemo(() => FIGURES.filter(theme.filter), [theme]);
  const sizes = [4, 8, 16, 32].filter((s) => s <= pool.length);
  const effSize = sizes.includes(size) ? size : sizes[sizes.length - 1];

  const start = () => {
    const ids = shuffle(Math.random, pool.map((f) => f.id)).slice(0, effSize);
    setT(createTournament(`${theme.emoji} ${theme.name}`, ids, randomSeed()));
  };

  const next = () => {
    if (!t) return;
    const n = advanceTournament(t);
    if (n.champion && !t.champion) recordChampion(n.champion);
    setT(n);
  };

  const all = () => {
    if (!t) return;
    let n = t;
    while (!n.champion) n = advanceTournament(n);
    if (!t.champion && n.champion) recordChampion(n.champion);
    setT(n);
  };

  const watch = (m: Match) =>
    nav.openBattle({
      a: m.a,
      b: m.b,
      seed: m.seed,
      predict: !m.winner,
      record: false,
      label: m.winner ? 'Turnier-Wiederholung' : 'Turnierkampf live',
    });

  const champs = Object.entries(profile.champions)
    .sort((x, y) => y[1] - x[1])
    .slice(0, 5);

  if (!t) {
    return (
      <Screen>
        <H1>Turnier</H1>
        <P>Wähle ein Thema und eine Größe – dann kämpfen sich die Legenden im K.-o.-System bis zum Thron.</P>
        <Section title="Thema">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {TOURNAMENT_THEMES.map((th) => (
              <Chip key={th.id} label={`${th.emoji} ${th.name}`} active={th.id === themeId} onPress={() => setThemeId(th.id)} />
            ))}
          </View>
          <P style={{ fontSize: 13 }}>{pool.length} mögliche Teilnehmer</P>
        </Section>
        <Section title="Teilnehmer">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {sizes.map((s) => (
              <Chip key={s} label={`${s} Kämpfer`} active={s === effSize} onPress={() => setSize(s)} />
            ))}
          </View>
        </Section>
        <Btn label="🏆 Turnier starten" onPress={start} style={{ marginTop: 20 }} />
        {champs.length > 0 && (
          <Section title="👑 Deine Turniersieger">
            <Card>
              {champs.map(([id, n]) => (
                <View key={id} style={styles.champRow}>
                  <Avatar fig={FIGURE_MAP[id]} size={34} />
                  <Text style={{ color: C.text, flex: 1, marginLeft: 10 }}>{FIGURE_MAP[id].name}</Text>
                  <Text style={{ color: C.gold, fontWeight: '700' }}>{n}× 🏆</Text>
                </View>
              ))}
            </Card>
          </Section>
        )}
      </Screen>
    );
  }

  return (
    <Screen>
      <H1 style={{ fontSize: 24 }}>{t.name}</H1>
      {t.champion ? (
        <FadeIn>
          <LinearGradient colors={['#3a2a08', '#17131f']} style={[styles.champ, shadow]}>
            <Pulse>
              <Text style={{ fontSize: 44 }}>🏆</Text>
            </Pulse>
            <Avatar fig={FIGURE_MAP[t.champion]} size={100} ring={C.gold} />
            <Text style={styles.champName}>{FIGURE_MAP[t.champion].name}</Text>
            <Text style={{ color: C.text, marginTop: 4 }}>ist Champion der Geschichte! 🎉</Text>
          </LinearGradient>
        </FadeIn>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <Btn label={`▶ ${ROUND_NAMES[t.rounds[t.rounds.length - 1].length * 2] ?? 'Runde'} ausspielen`} onPress={next} style={{ flex: 2 }} />
          <Btn label="⏩ Alles" onPress={all} variant="ghost" style={{ flex: 1 }} />
        </View>
      )}
      <P style={{ fontSize: 12, marginTop: 10 }}>Tippe auf einen Kampf, um ihn live (oder als Wiederholung) anzusehen.</P>

      {t.rounds.map((round, ri) => (
        <Section key={ri} title={ROUND_NAMES[round.length * 2] ?? `Runde ${ri + 1}`}>
          <View style={styles.matches}>
            {round.map((m, mi) => (
              <MatchCard key={mi} m={m} onPress={() => watch(m)} />
            ))}
          </View>
        </Section>
      ))}

      <Btn label="Neues Turnier" onPress={() => setT(null)} variant="dark" style={{ marginTop: 24 }} />
    </Screen>
  );
}

const MatchCard = ({ m, onPress }: { m: Match; onPress: () => void }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.match, pressed && { opacity: 0.8 }]}>
    {[m.a, m.b].map((id, k) => {
      const f = FIGURE_MAP[id];
      const won = m.winner === id;
      const lost = m.winner && !won;
      return (
        <View key={id} style={[styles.matchRow, lost && { opacity: 0.4 }]}>
          <Avatar fig={f} size={30} ring={won ? C.gold : SIDE[k]} />
          <Text style={[styles.matchName, won && { color: C.gold, fontWeight: '700' }]} numberOfLines={1}>
            {f.name}
          </Text>
          {won && <Text>👑</Text>}
        </View>
      );
    })}
    <Text style={styles.matchVerdict}>{m.verdict ?? '⚔️ ansehen'}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  champRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  champ: { borderRadius: 22, padding: 20, alignItems: 'center', marginTop: 14, borderWidth: 1, borderColor: C.goldDeep },
  champName: { fontFamily: F.display, color: C.gold, fontSize: 24, marginTop: 10, textAlign: 'center' },
  matches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  match: {
    flexGrow: 1,
    flexBasis: 260,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    padding: 10,
  },
  matchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 8 },
  matchName: { flex: 1, color: C.text, fontSize: 14 },
  matchVerdict: { color: C.dim, fontSize: 11, marginTop: 4, textAlign: 'right' },
});
