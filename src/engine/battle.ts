import { ARENAS, EVENTS, EVENT_IDS, REGULAR_ARENAS, power } from '../data/arenas';
import type { Ability, ArenaId, EventId, Figure, StatKey } from '../types';
import { createRng, pick, shuffle, type RNG } from './rng';

export interface Modifier {
  label: string;
  value: number;
  kind: 'ability' | 'weakness' | 'event' | 'swap';
}

export interface SideRound {
  base: number;
  roll: number;
  mods: Modifier[];
  total: number;
}

export interface RoundResult {
  index: number;
  arena: ArenaId;
  event?: EventId;
  sides: [SideRound, SideRound];
  winner: 0 | 1 | -1;
  damage: number;
  hpAfter: [number, number];
  lines: string[];
}

export interface BattleResult {
  a: Figure;
  b: Figure;
  seed: string;
  rounds: RoundResult[];
  winner: 0 | 1;
  ko: boolean;
  koRound?: number;
  hp: [number, number];
  verdict: string;
  epilog: string;
}

export const MAX_HP = 100;

const ROLE_BY_STAT: Record<StatKey, string> = {
  mil: 'Oberbefehlshaber der Palastwache',
  str: 'Chefstratege',
  dip: 'Sonderbotschafter',
  cha: 'Pressesprecher',
  adm: 'Finanzminister',
  int: 'Hofgelehrter',
  leg: 'Hofchronist',
};

const bestStat = (f: Figure): StatKey =>
  (Object.keys(f.stats) as StatKey[]).reduce((best, k) => (f.stats[k] > f.stats[best] ? k : best), 'mil');

interface Ctx {
  round: number;
  arena: ArenaId;
  event?: EventId;
  self: Figure;
  opp: Figure;
  hpSelf: number;
  hpOpp: number;
}

const triggers = (ab: Ability, c: Ctx): boolean => {
  const t = ab.trigger;
  switch (t.kind) {
    case 'arena':
      return c.arena === t.arena;
    case 'opening':
      return c.round === 0;
    case 'finale':
      return c.arena === 'finale';
    case 'comeback':
      return c.hpSelf < c.hpOpp;
    case 'lowHp':
      return c.hpSelf <= 45;
    case 'vsOlder':
      return c.opp.year < c.self.year - 400;
    case 'anyEvent':
      return !!c.event;
    case 'event':
      return c.event === t.event;
    default:
      return false;
  }
};

/** Liefert den Ereignis-Effekt für eine Seite. */
const eventEffect = (
  ev: EventId,
  self: Figure,
  opp: Figure,
  sideIndex: number,
  shared: { seucheVictim: number },
  rng: RNG,
): number => {
  switch (ev) {
    case 'winter':
      return self.tags.includes('nordisch') ? 10 : -4;
    case 'seuche':
      return shared.seucheVictim === sideIndex ? -10 : 0;
    case 'verrat':
      if (self.stats.adm === opp.stats.adm) return -5;
      return self.stats.adm < opp.stats.adm ? -10 : 0;
    case 'presse':
      if (self.year >= 1850) return Math.round((rng() * 2 - 1) * 12 * (self.chaos ?? 1));
      if (self.year < 500) return 3;
      return 0;
    case 'orakel':
      return self.year < 500 ? 8 : 0;
    case 'gold':
      if (self.tags.includes('reich')) return 12;
      return self.stats.adm >= 90 ? 6 : 0;
    case 'volk':
      if (self.stats.cha >= 90) return 10;
      return self.stats.cha < 75 ? -6 : 0;
    case 'zeitriss':
      return power(self) < power(opp) ? 12 : power(self) === power(opp) ? 4 : 0;
    case 'sturm':
      return self.tags.includes('seemacht') ? 10 : -3;
  }
};

const fill = (tpl: string, w: Figure, l: Figure) => tpl.replace(/\{W\}/g, w.name).replace(/\{L\}/g, l.name);

export const simulateBattle = (a: Figure, b: Figure, seed: string): BattleResult => {
  const rng = createRng(`${a.id}|${b.id}|${seed}`);
  const fighters: [Figure, Figure] = [a, b];
  // Wahl des Schlachtfelds: Jede Seite wählt ihre Heimarena, der Rest ist Zufall.
  const homeA = homeArenas(a)[0];
  const homeB = homeArenas(b).find((x) => x !== homeA)!;
  const rest = shuffle(rng, REGULAR_ARENAS.filter((x) => x !== homeA && x !== homeB)).slice(0, 2);
  const arenas: ArenaId[] = [homeA, homeB, ...rest, 'finale'];
  const picks: Partial<Record<number, 0 | 1>> = { 0: 0, 1: 1 };
  const usedEvents = new Set<EventId>();
  const hp: [number, number] = [MAX_HP, MAX_HP];
  const rounds: RoundResult[] = [];
  let ko = false;
  let koRound: number | undefined;

  for (let i = 0; i < arenas.length; i++) {
    const arenaId = arenas[i];
    const arena = ARENAS[arenaId];
    let event: EventId | undefined;
    if (rng() < 0.42) {
      const free = EVENT_IDS.filter((e) => !usedEvents.has(e));
      event = pick(rng, free);
      usedEvents.add(event);
    }
    const shared = { seucheVictim: rng() < 0.5 ? 0 : 1 };
    const lines: string[] = [];
    const picker = picks[i];
    if (picker !== undefined) lines.push(`${fighters[picker].name} wählt das Terrain: ${arena.name}.`);

    const sides = fighters.map((self, k) => {
      const opp = fighters[1 - k];
      const ctx: Ctx = { round: i, arena: arenaId, event, self, opp, hpSelf: hp[k], hpOpp: hp[1 - k] };
      const mods: Modifier[] = [];

      // Grundwert aus gewichteten Stats (mit evtl. Stat-Tausch)
      let base = 0;
      const swap = self.ability.trigger.kind === 'swap' ? self.ability.trigger : undefined;
      let swapped = false;
      for (const [key, w] of Object.entries(arena.weights) as [StatKey, number][]) {
        let v = self.stats[key];
        if (swap && swap.from === key && self.stats[swap.to] > v) {
          v = self.stats[swap.to];
          swapped = true;
        }
        base += v * w;
      }
      if (swapped) {
        mods.push({ label: self.ability.name, value: 0, kind: 'swap' });
      }

      // Würfel – Chaos vergrößert die Streuung
      const chaos = self.chaos ?? 1;
      const roll = Math.round((rng() * 30 - 15) * chaos + 15);

      // Spezialfähigkeit
      if (self.ability.trigger.kind !== 'swap' && triggers(self.ability, ctx)) {
        mods.push({ label: self.ability.name, value: self.ability.value, kind: 'ability' });
      }
      // Schwäche
      if (triggers(self.weakness, ctx)) {
        mods.push({ label: self.weakness.name, value: self.weakness.value, kind: 'weakness' });
      }
      // Ereignis
      if (event) {
        let v = eventEffect(event, self, opp, k, shared, rng);
        if (self.ability.trigger.kind === 'anyEvent' && v < 0) v = 0;
        if (v !== 0) mods.push({ label: EVENTS[event].name, value: v, kind: 'event' });
      }

      const total = Math.round(base + roll + mods.reduce((acc, m) => acc + m.value, 0));
      return { base: Math.round(base), roll, mods, total } as SideRound;
    }) as [SideRound, SideRound];

    // Erzählung: Ereignis & Fähigkeiten
    if (event) lines.push(`Ereignis: ${EVENTS[event].name}. ${EVENTS[event].text}`);
    sides.forEach((sd, k) => {
      sd.mods.forEach((m) => {
        if (m.kind === 'ability') lines.push(`${fighters[k].name} aktiviert „${m.label}“ (+${m.value})`);
        if (m.kind === 'swap') lines.push(`${fighters[k].name}: „${m.label}“ – kämpft auf eigene Art!`);
        if (m.kind === 'weakness') lines.push(`Schwäche von ${fighters[k].name}: „${m.label}“ (${m.value})`);
      });
    });

    const diff = sides[0].total - sides[1].total;
    const mult = arenaId === 'finale' ? 1.5 : 1;
    let winner: 0 | 1 | -1;
    let damage: number;
    if (Math.abs(diff) <= 1) {
      winner = -1;
      damage = Math.round(6 * mult);
      hp[0] = Math.max(0, hp[0] - damage);
      hp[1] = Math.max(0, hp[1] - damage);
      lines.push(`Patt! Beide schenken sich nichts – jeder verliert ${damage} Machtpunkte.`);
    } else {
      winner = diff > 0 ? 0 : 1;
      const abs = Math.abs(diff);
      damage = Math.round(Math.min(38, Math.max(10, 10 + abs * 1.2)) * mult);
      hp[1 - winner] = Math.max(0, hp[1 - winner] - damage);
      const w = fighters[winner];
      const l = fighters[1 - winner];
      const tpl = abs >= 14 ? pick(rng, arena.winBig) : pick(rng, arena.winTight);
      lines.push(fill(tpl, w, l));
    }

    rounds.push({ index: i, arena: arenaId, event, sides, winner, damage, hpAfter: [hp[0], hp[1]], lines });

    if (hp[0] <= 0 || hp[1] <= 0) {
      ko = true;
      koRound = i + 1;
      break;
    }
  }

  let winner: 0 | 1;
  if (hp[0] !== hp[1]) winner = hp[0] > hp[1] ? 0 : 1;
  else winner = a.stats.leg >= b.stats.leg ? 0 : 1;

  const w = fighters[winner];
  const l = fighters[1 - winner];
  const margin = Math.abs(hp[0] - hp[1]);
  let verdict: string;
  if (ko) verdict = `K.O. in Runde ${koRound}!`;
  else if (margin === 0) verdict = 'Gleichstand – die Geschichte entscheidet!';
  else if (margin < 12) verdict = 'Hauchdünner Punktsieg!';
  else if (margin < 40) verdict = 'Sieg nach Punkten';
  else verdict = 'Dominanter Sieg!';

  const epilogs = [
    `In dieser Zeitlinie wird ${l.name} zum ${ROLE_BY_STAT[bestStat(l)]} von ${w.name} ernannt.`,
    `${w.name} lässt in ${l.region} eine Statue errichten – natürlich von sich selbst.`,
    `Historiker nennen die folgende Epoche das „Zeitalter von ${w.name}“. ${l.name} bekommt immerhin eine Briefmarke.`,
    `${l.name} schreibt im Exil ein Buch: „Wie ich fast gegen ${w.name} gewonnen hätte“. Ein Bestseller.`,
    `Am Abend teilen beide ein Abendessen. ${w.name} bezahlt – Sieger haben Stil.`,
  ];
  const epilog = pick(rng, epilogs);

  return { a, b, seed, rounds, winner, ko, koRound, hp: [hp[0], hp[1]], verdict, epilog };
};

const arenaBase = (f: Figure, id: ArenaId): number => {
  const ar = ARENAS[id];
  const swap = f.ability.trigger.kind === 'swap' ? f.ability.trigger : undefined;
  let v = 0;
  for (const [k, w] of Object.entries(ar.weights) as [StatKey, number][]) {
    let x = f.stats[k];
    if (swap && swap.from === k) x = Math.max(x, f.stats[swap.to]);
    v += x * w;
  }
  const t = f.ability.trigger;
  if (t.kind === 'arena' && t.arena === id) v += f.ability.value;
  const wt = f.weakness.trigger;
  if (wt.kind === 'arena' && wt.arena === id) v += f.weakness.value;
  return v;
};

/** Arenen sortiert nach Stärke der Figur – die erste ist ihre Heimarena. */
export const homeArenas = (f: Figure): ArenaId[] =>
  [...REGULAR_ARENAS].sort((x, y) => arenaBase(f, y) - arenaBase(f, x));

/** Schnelle Siegquote von a gegen b über mehrere Seeds. */
export const winRate = (a: Figure, b: Figure, n = 10): number => {
  let wins = 0;
  for (let i = 0; i < n; i++) if (simulateBattle(a, b, `wr${i}`).winner === 0) wins++;
  return wins / n;
};
