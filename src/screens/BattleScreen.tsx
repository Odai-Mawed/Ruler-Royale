import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { ARENAS, STAT_ICONS, STAT_KEYS, STAT_LABELS, eraOf } from '../data/arenas';
import { FIGURE_MAP } from '../data/figures';
import { MAX_HP, homeArenas, simulateBattle, type RoundResult } from '../engine/battle';
import { randomSeed } from '../engine/rng';
import { useNav, type BattleRequest } from '../nav';
import { recordBattle } from '../storage';
import { C, SIDE } from '../theme';
import type { Figure } from '../types';
import { Avatar, Bar, Btn, Card, FadeIn, P } from '../ui';
import { gapText } from './ArenaScreen';
import { OverlayHeader, Screen } from './common';

type Phase = 'intro' | 'fight' | 'result';

const REVEAL_MS = 2600;

const shareBattle = async (a: Figure, b: Figure, seed: string, winner: Figure) => {
  const text = `${winner.name} gewinnt bei Ruler Royale: ${a.name} vs. ${b.name}! Schaffst du's anders?`;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const url = `${window.location.origin}${window.location.pathname}?a=${a.id}&b=${b.id}&s=${seed}`;
    const nav = window.navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    try {
      if (nav.share) {
        await nav.share({ title: 'Ruler Royale', text, url });
        return 'Geteilt!';
      }
      await nav.clipboard.writeText(`${text}\n${url}`);
      return 'Link kopiert!';
    } catch {
      return 'Teilen abgebrochen';
    }
  }
  try {
    await Share.share({ message: text });
    return 'Geteilt!';
  } catch {
    return 'Teilen abgebrochen';
  }
};

export default function BattleScreen({ req }: { req: BattleRequest }) {
  const nav = useNav();
  const [seed, setSeed] = useState(req.seed ?? randomSeed());
  const a = FIGURE_MAP[req.a];
  const b = FIGURE_MAP[req.b];
  const result = useMemo(() => simulateBattle(a, b, seed), [a, b, seed]);
  const [phase, setPhase] = useState<Phase>('intro');
  const [prediction, setPrediction] = useState<string | undefined>();
  const [revealed, setRevealed] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const recorded = useRef(false);

  // Rundenweise aufdecken
  useEffect(() => {
    if (phase !== 'fight') return;
    if (revealed >= result.rounds.length) {
      const t = setTimeout(() => setPhase('result'), 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRevealed((r) => r + 1), revealed === 0 ? 400 : REVEAL_MS);
    return () => clearTimeout(t);
  }, [phase, revealed, result.rounds.length]);

  // Ergebnis speichern
  useEffect(() => {
    if (phase === 'result' && !recorded.current && req.record !== false) {
      recorded.current = true;
      recordBattle({ a: a.id, b: b.id, w: result.winner === 0 ? a.id : b.id, seed, t: Date.now() }, prediction);
    }
  }, [phase, a.id, b.id, result.winner, seed, prediction, req.record]);

  const start = (pred?: string) => {
    setPrediction(pred);
    setRevealed(0);
    setPhase('fight');
  };

  const rematch = () => {
    recorded.current = false;
    setSeed(randomSeed());
    setPrediction(undefined);
    setRevealed(0);
    setPhase(req.predict === false ? 'fight' : 'intro');
  };

  const hp: [number, number] =
    revealed === 0 ? [MAX_HP, MAX_HP] : result.rounds[Math.min(revealed, result.rounds.length) - 1].hpAfter;

  const winner = result.winner === 0 ? a : b;
  const loser = result.winner === 0 ? b : a;

  const share = async () => {
    const msg = await shareBattle(a, b, seed, winner);
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <View style={{ flex: 1 }}>
      <OverlayHeader
        title={req.label ?? (phase === 'intro' ? 'Vor dem Kampf' : phase === 'fight' ? 'Der Kampf' : 'Ergebnis')}
        right={
          phase === 'fight' ? (
            <Pressable onPress={() => setRevealed(result.rounds.length)} hitSlop={10}>
              <Text style={{ color: C.gold, fontWeight: '600', fontSize: 13 }}>Überspringen</Text>
            </Pressable>
          ) : undefined
        }
      />
      {phase !== 'intro' && <HpHeader a={a} b={b} hp={hp} />}
      <Screen key={phase === 'intro' ? 'intro' : 'fight'} autoScroll={phase === 'fight'}>
        {phase === 'intro' ? (
          <Intro a={a} b={b} onStart={start} predict={req.predict !== false} />
        ) : (
          <>
            {result.rounds.slice(0, revealed).map((r) => (
              <FadeIn key={`${seed}-${r.index}`}>
                <RoundCard r={r} a={a} b={b} total={result.rounds.length} />
              </FadeIn>
            ))}
            {phase === 'fight' && revealed < result.rounds.length && (
              <Text style={{ color: C.muted, textAlign: 'center', marginTop: 16 }}>Runde {revealed + 1} läuft …</Text>
            )}
            {phase === 'result' && (
              <FadeIn>
                <View style={styles.winner}>
                  <Text style={styles.winnerLabel}>Sieger</Text>
                  <Avatar fig={winner} size={88} />
                  <Text style={styles.winnerName}>{winner.name}</Text>
                  <Text style={styles.verdict}>{result.verdict}</Text>
                  <Text style={styles.hpFinal}>
                    {result.hp[0]} : {result.hp[1]} Machtpunkte
                  </Text>
                  <View style={styles.speech}>
                    <Text style={styles.speechLabel}>Siegesrede (fiktiv)</Text>
                    <Text style={styles.speechText}>„{winner.taunt}“</Text>
                  </View>
                  {prediction && (
                    <Text style={[styles.pred, { color: prediction === winner.id ? C.green : C.red }]}>
                      {prediction === winner.id
                        ? 'Dein Tipp war richtig.'
                        : `Daneben – du hattest auf ${FIGURE_MAP[prediction].name} gesetzt.`}
                    </Text>
                  )}
                  <View style={styles.epilog}>
                    <Text style={styles.epilogLabel}>Alternative Geschichte</Text>
                    <Text style={styles.epilogText}>{result.epilog}</Text>
                  </View>
                  <Text style={{ color: C.dim, fontSize: 12, marginTop: 10 }}>
                    {loser.name} kann sich trösten: „{loser.fact}“
                  </Text>
                </View>
                <View style={styles.resultBtns}>
                  <Btn label="Revanche" onPress={rematch} style={{ flex: 1 }} />
                  <Btn label="Teilen" onPress={share} variant="ghost" style={{ flex: 1 }} />
                </View>
                <View style={[styles.resultBtns, { marginTop: 10 }]}>
                  <Btn label={a.name} onPress={() => nav.openDetail(a.id)} variant="dark" small style={{ flex: 1 }} />
                  <Btn label={b.name} onPress={() => nav.openDetail(b.id)} variant="dark" small style={{ flex: 1 }} />
                </View>
                <Btn label="Neue Gegner wählen" onPress={nav.close} variant="dark" style={{ marginTop: 10 }} />
                <P style={{ textAlign: 'center', fontSize: 11, marginTop: 14 }}>Kampf-Code: {seed}</P>
              </FadeIn>
            )}
          </>
        )}
      </Screen>
      {toast && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={{ color: C.onAccent, fontWeight: '700' }}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

// ───────── Intro / Tale of the Tape ─────────

const Intro = ({
  a,
  b,
  onStart,
  predict,
}: {
  a: Figure;
  b: Figure;
  onStart: (pred?: string) => void;
  predict: boolean;
}) => {
  const slideA = useRef(new Animated.Value(-120)).current;
  const slideB = useRef(new Animated.Value(120)).current;
  useEffect(() => {
    const native = Platform.OS !== 'web';
    Animated.parallel([
      Animated.spring(slideA, { toValue: 0, useNativeDriver: native, friction: 6 }),
      Animated.spring(slideB, { toValue: 0, useNativeDriver: native, friction: 6 }),
    ]).start();
  }, [slideA, slideB]);

  const homeA = ARENAS[homeArenas(a)[0]];
  const homeBId = homeArenas(b).find((x) => x !== homeArenas(a)[0])!;
  const homeB = ARENAS[homeBId];

  return (
    <View>
      <View style={styles.introRow}>
        <Animated.View style={[styles.introSide, { transform: [{ translateX: slideA }] }]}>
          <Avatar fig={a} size={96} ring={SIDE[0]} />
          <Text style={styles.introName}>{a.name}</Text>
          <Text style={styles.introMeta}>{a.title}</Text>
          <Text style={styles.introMeta}>{a.lived}</Text>
        </Animated.View>
        <Text style={styles.bigVs}>vs</Text>
        <Animated.View style={[styles.introSide, { transform: [{ translateX: slideB }] }]}>
          <Avatar fig={b} size={96} ring={SIDE[1]} />
          <Text style={styles.introName}>{b.name}</Text>
          <Text style={styles.introMeta}>{b.title}</Text>
          <Text style={styles.introMeta}>{b.lived}</Text>
        </Animated.View>
      </View>
      <Text style={styles.gap}>
        {gapText(a.year, b.year)} · {eraOf(a.year)} vs. {eraOf(b.year)}
      </Text>

      <View style={styles.tauntRow}>
        <FadeIn delay={300} style={[styles.bubble, { borderColor: SIDE[0] }]}>
          <Text style={styles.bubbleText}>„{a.taunt}“</Text>
        </FadeIn>
        <FadeIn delay={600} style={[styles.bubble, { borderColor: SIDE[1] }]}>
          <Text style={styles.bubbleText}>„{b.taunt}“</Text>
        </FadeIn>
      </View>
      <Text style={{ color: C.dim, fontSize: 11, textAlign: 'center', marginTop: 4 }}>Kampfansagen sind frei erfunden.</Text>

      <Card style={{ marginTop: 18 }}>
        <Text style={styles.tapeTitle}>Werte im Vergleich</Text>
        {STAT_KEYS.map((k, i) => {
          const va = a.stats[k];
          const vb = b.stats[k];
          return (
            <View key={k} style={styles.tapeRow}>
              <Text style={[styles.tapeVal, va >= vb && { color: SIDE[0] }]}>{va}</Text>
              <Bar value={va} color={va >= vb ? SIDE[0] : C.dim} reverse delay={i * 60} />
              <Text style={styles.tapeLabel}>
                {STAT_ICONS[k]} {STAT_LABELS[k]}
              </Text>
              <Bar value={vb} color={vb >= va ? SIDE[1] : C.dim} delay={i * 60} />
              <Text style={[styles.tapeVal, vb >= va && { color: SIDE[1] }]}>{vb}</Text>
            </View>
          );
        })}
      </Card>

      <View style={styles.abilityRow}>
        {[a, b].map((f, k) => (
          <Card key={f.id} style={{ flex: 1, borderColor: SIDE[k] }}>
            <Text style={styles.abLabel}>Heimarena</Text>
            <Text style={styles.abName}>
              {(k === 0 ? homeA : homeB).name}
            </Text>
            <Text style={[styles.abLabel, { marginTop: 10 }]}>Stärke</Text>
            <Text style={styles.abName}>{f.ability.name}</Text>
            <Text style={styles.abDesc}>{f.ability.desc}</Text>
            <Text style={[styles.abLabel, { marginTop: 10 }]}>Schwäche</Text>
            <Text style={styles.abName}>{f.weakness.name}</Text>
            <Text style={styles.abDesc}>{f.weakness.desc}</Text>
          </Card>
        ))}
      </View>

      {predict ? (
        <Card style={{ marginTop: 18, alignItems: 'center' }}>
          <Text style={styles.tapeTitle}>Wer gewinnt? Dein Tipp:</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, width: '100%' }}>
            <Btn label={a.name} onPress={() => onStart(a.id)} style={{ flex: 1, backgroundColor: SIDE[0] }} small />
            <Btn label={b.name} onPress={() => onStart(b.id)} style={{ flex: 1, backgroundColor: SIDE[1] }} small />
          </View>
          <Pressable onPress={() => onStart()} style={{ marginTop: 12 }}>
            <Text style={{ color: C.muted, textDecorationLine: 'underline' }}>Ohne Tipp kämpfen</Text>
          </Pressable>
        </Card>
      ) : (
        <Btn label="Kampf starten" onPress={() => onStart()} style={{ marginTop: 18 }} />
      )}
    </View>
  );
};

// ───────── HP-Leiste ─────────

const HpBar = ({ hp, side }: { hp: number; side: 0 | 1 }) => {
  const anim = useRef(new Animated.Value(hp)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: hp, duration: 700, useNativeDriver: false }).start();
  }, [hp, anim]);
  const color = hp > 50 ? SIDE[side] : hp > 25 ? '#e8a33c' : '#ff3b3b';
  return (
    <View style={[styles.hpTrack, { flexDirection: side === 0 ? 'row' : 'row-reverse' }]}>
      <Animated.View
        style={{
          backgroundColor: color,
          height: '100%',
          borderRadius: 99,
          width: anim.interpolate({ inputRange: [0, MAX_HP], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
};

const HpHeader = ({ a, b, hp }: { a: Figure; b: Figure; hp: [number, number] }) => (
  <View style={styles.hpHeader}>
    <View style={styles.hpInner}>
      <View style={styles.hpSide}>
        <Avatar fig={a} size={40} ring={SIDE[0]} />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.hpName} numberOfLines={1}>
            {a.name}
          </Text>
          <HpBar hp={hp[0]} side={0} />
          <Text style={styles.hpNum}>{hp[0]} MP</Text>
        </View>
      </View>
      <Text style={{ color: C.muted, fontWeight: '600', marginHorizontal: 8 }}>vs</Text>
      <View style={[styles.hpSide, { flexDirection: 'row-reverse' }]}>
        <Avatar fig={b} size={40} ring={SIDE[1]} />
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[styles.hpName, { textAlign: 'right' }]} numberOfLines={1}>
            {b.name}
          </Text>
          <HpBar hp={hp[1]} side={1} />
          <Text style={[styles.hpNum, { textAlign: 'right' }]}>{hp[1]} MP</Text>
        </View>
      </View>
    </View>
  </View>
);

// ───────── Runde ─────────

const RoundCard = ({ r, a, b, total }: { r: RoundResult; a: Figure; b: Figure; total: number }) => {
  const arena = ARENAS[r.arena];
  const fighters = [a, b];
  const isFinal = r.arena === 'finale';
  return (
    <Card style={[styles.round, isFinal && { borderColor: C.text }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={styles.roundNo}>
          RUNDE {r.index + 1}/{total}
        </Text>
        {r.winner !== -1 && (
          <Text style={[styles.roundWin, { color: SIDE[r.winner] }]}>
            {fighters[r.winner].name.split(' ')[0]} gewinnt
          </Text>
        )}
      </View>
      <Text style={styles.arenaName}>
        {arena.name}
      </Text>
      <Text style={styles.arenaIntro}>{arena.intro}</Text>

      <View style={styles.scoreRow}>
        {r.sides.map((s, k) => (
          <View key={k} style={[styles.scoreBox, { borderColor: r.winner === k ? SIDE[k as 0 | 1] : C.line }]}>
            <Text style={[styles.scoreTotal, { color: SIDE[k as 0 | 1] }]}>{s.total}</Text>
            <Text style={styles.scoreDetail}>
              Basis {s.base} · Würfel {s.roll >= 0 ? '+' : ''}
              {s.roll}
            </Text>
            {s.mods
              .filter((m) => m.value !== 0)
              .map((m, i) => (
                <Text key={i} style={[styles.scoreDetail, { color: m.value > 0 ? C.green : C.red }]} numberOfLines={1}>
                  {m.value > 0 ? '+' : ''}
                  {m.value} {m.label}
                </Text>
              ))}
          </View>
        ))}
      </View>

      {r.lines.map((l, i) => (
        <Text key={i} style={[styles.line, i === r.lines.length - 1 && styles.lineMain]}>
          {l}
        </Text>
      ))}
      {r.winner !== -1 && (
        <Text style={styles.damage}>
          −{r.damage} Machtpunkte für {fighters[1 - r.winner].name}
          {isFinal ? ' (Finale ×1,5)' : ''}
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  introRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  introSide: { flex: 1, alignItems: 'center' },
  introName: { color: C.text, fontWeight: '600', fontSize: 16, textAlign: 'center', marginTop: 10 },
  introMeta: { color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 2 },
  bigVs: { fontWeight: '600', fontSize: 18, color: C.muted, marginHorizontal: 6 },
  gap: { color: C.muted, textAlign: 'center', marginTop: 14, fontSize: 13 },
  tauntRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  bubble: { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderRadius: 14, padding: 12 },
  bubbleText: { color: C.text, fontStyle: 'italic', fontSize: 13, lineHeight: 19 },
  tapeTitle: { color: C.text, fontWeight: '600', fontSize: 15, marginBottom: 6, textAlign: 'center' },
  tapeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 },
  tapeVal: { width: 28, textAlign: 'center', color: C.muted, fontWeight: '700', fontSize: 13 },
  tapeLabel: { width: 104, textAlign: 'center', color: C.text, fontSize: 12 },
  abilityRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  abLabel: { color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  abName: { color: C.text, fontWeight: '600', fontSize: 13, marginTop: 2 },
  abDesc: { color: C.muted, fontSize: 12, marginTop: 2 },
  hpHeader: { backgroundColor: C.bg2, borderBottomWidth: 1, borderBottomColor: C.line },
  hpInner: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  hpSide: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  hpName: { color: C.text, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  hpTrack: { height: 12, backgroundColor: C.surface2, borderRadius: 99, overflow: 'hidden' },
  hpNum: { color: C.muted, fontSize: 11, marginTop: 3 },
  round: { marginBottom: 12 },
  roundNo: { color: C.dim, fontSize: 11, letterSpacing: 1.5, fontWeight: '700' },
  roundWin: { fontSize: 12, fontWeight: '700' },
  arenaName: { color: C.text, fontWeight: '600', fontSize: 18, marginTop: 4 },
  arenaIntro: { color: C.muted, fontSize: 13, marginTop: 2 },
  scoreRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  scoreBox: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center', backgroundColor: C.bg2 },
  scoreTotal: { fontWeight: '700', fontSize: 26 },
  scoreDetail: { color: C.muted, fontSize: 11, marginTop: 2 },
  line: { color: C.muted, fontSize: 13, marginTop: 8, lineHeight: 19 },
  lineMain: { color: C.text, fontSize: 15, fontWeight: '500' },
  damage: { color: C.red, fontSize: 13, marginTop: 8, fontWeight: '700' },
  winner: { borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: C.line, marginTop: 8 },
  winnerLabel: { color: C.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  winnerName: { fontWeight: '700', color: C.text, fontSize: 24, textAlign: 'center', marginTop: 12 },
  verdict: { color: C.text, fontWeight: '600', fontSize: 16, marginTop: 4 },
  hpFinal: { color: C.muted, fontSize: 13, marginTop: 4 },
  speech: { marginTop: 16, backgroundColor: C.surface2, borderRadius: 14, padding: 14, width: '100%' },
  speechLabel: { color: C.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  speechText: { color: C.text, fontSize: 15, fontStyle: 'italic', marginTop: 4, lineHeight: 22 },
  pred: { marginTop: 14, fontWeight: '700', textAlign: 'center' },
  epilog: { marginTop: 14, width: '100%' },
  epilogLabel: { color: C.muted, fontSize: 12, fontWeight: '700' },
  epilogText: { color: C.text, fontSize: 14, marginTop: 4, lineHeight: 20 },
  resultBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  toast: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: C.gold,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 99,
  },
});
