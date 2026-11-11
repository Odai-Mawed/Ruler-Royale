import { FIGURES, FIGURE_MAP } from '../data/figures';
import { eraOf } from '../data/arenas';
import type { Figure } from '../types';
import { simulateBattle } from './battle';
import { createRng, shuffle } from './rng';

// ───────── Simulierte Weltrangliste ─────────

export interface RankingRow {
  fig: Figure;
  wins: number;
  games: number;
  pct: number;
  rank: number;
}

let rankingCache: RankingRow[] | null = null;

export const computeRanking = (perPair = 4): RankingRow[] => {
  if (rankingCache) return rankingCache;
  const wins: Record<string, number> = {};
  const games: Record<string, number> = {};
  FIGURES.forEach((f) => {
    wins[f.id] = 0;
    games[f.id] = 0;
  });
  for (let i = 0; i < FIGURES.length; i++) {
    for (let j = i + 1; j < FIGURES.length; j++) {
      for (let k = 0; k < perPair; k++) {
        const [a, b] = k % 2 === 0 ? [FIGURES[i], FIGURES[j]] : [FIGURES[j], FIGURES[i]];
        const r = simulateBattle(a, b, `rank${k}`);
        const w = r.winner === 0 ? a : b;
        wins[w.id]++;
        games[a.id]++;
        games[b.id]++;
      }
    }
  }
  const rows = FIGURES.map((fig) => ({
    fig,
    wins: wins[fig.id],
    games: games[fig.id],
    pct: games[fig.id] ? wins[fig.id] / games[fig.id] : 0,
    rank: 0,
  })).sort((x, y) => y.pct - x.pct);
  rows.forEach((r, i) => (r.rank = i + 1));
  rankingCache = rows;
  return rows;
};

/** Bilanz einer Figur gegen alle anderen – inkl. Angst- und Lieblingsgegner. */
export const matchupProfile = (fig: Figure, perOpp = 6) => {
  const results = FIGURES.filter((o) => o.id !== fig.id).map((opp) => {
    let w = 0;
    for (let k = 0; k < perOpp; k++) {
      const r = k % 2 === 0 ? simulateBattle(fig, opp, `mp${k}`) : simulateBattle(opp, fig, `mp${k}`);
      const won = k % 2 === 0 ? r.winner === 0 : r.winner === 1;
      if (won) w++;
    }
    return { opp, pct: w / perOpp };
  });
  const total = results.reduce((a, r) => a + r.pct, 0) / results.length;
  const sorted = [...results].sort((x, y) => x.pct - y.pct);
  return {
    total,
    nemesis: sorted.slice(0, 3),
    favorite: sorted.slice(-3).reverse(),
  };
};

// ───────── Turnier ─────────

export interface Match {
  a: string;
  b: string;
  seed: string;
  winner?: string;
  verdict?: string;
}

export interface Tournament {
  name: string;
  rounds: Match[][];
  champion?: string;
}

export interface TournamentTheme {
  id: string;
  name: string;
  emoji: string;
  filter: (f: Figure) => boolean;
}

export const TOURNAMENT_THEMES: TournamentTheme[] = [
  { id: 'all', name: 'Weltmeisterschaft', emoji: '🌍', filter: () => true },
  { id: 'antike', name: 'Antike Giganten', emoji: '🏛️', filter: (f) => eraOf(f.year) === 'Antike' },
  { id: 'mittelalter', name: 'Mittelalter-Masters', emoji: '🏰', filter: (f) => eraOf(f.year) === 'Mittelalter' },
  { id: 'neuzeit', name: 'Kronen der Neuzeit', emoji: '👑', filter: (f) => eraOf(f.year) === 'Frühe Neuzeit' },
  {
    id: 'modern',
    name: 'Moderne & Gegenwart',
    emoji: '🎙️',
    filter: (f) => eraOf(f.year) === 'Moderne' || eraOf(f.year) === 'Gegenwart',
  },
  { id: 'eroberer', name: 'Eroberer-Cup', emoji: '⚔️', filter: (f) => f.tags.includes('eroberer') },
  {
    id: 'frauen',
    name: 'Königinnen & Ikonen',
    emoji: '🌹',
    filter: (f) =>
      [
        'kleopatra',
        'hatschepsut',
        'boudicca',
        'wu-zetian',
        'jeanne',
        'isabella',
        'elisabeth',
        'nzinga',
        'maria-theresia',
        'katharina',
        'victoria',
        'curie',
        'thatcher',
        'merkel',
      ].includes(f.id),
  },
  { id: 'geist', name: 'Köpfe gegen Kronen', emoji: '🧠', filter: (f) => f.category === 'Denker & Genies' || f.stats.int >= 90 },
  {
    id: 'orient',
    name: 'Kalifen, Sultane & Khane',
    emoji: '🌙',
    filter: (f) => f.category === 'Kalifen & Sultane' || ['dschingis', 'kublai', 'timur', 'kyros', 'akbar'].includes(f.id),
  },
];

export const createTournament = (name: string, ids: string[], seed: string): Tournament => {
  const rng = createRng(`t|${seed}`);
  const order = shuffle(rng, ids);
  const first: Match[] = [];
  for (let i = 0; i < order.length; i += 2) {
    first.push({ a: order[i], b: order[i + 1], seed: `${seed}-r0-${i}` });
  }
  return { name, rounds: [first] };
};

export const playMatch = (m: Match): Match => {
  const r = simulateBattle(FIGURE_MAP[m.a], FIGURE_MAP[m.b], m.seed);
  return { ...m, winner: r.winner === 0 ? m.a : m.b, verdict: r.verdict };
};

/** Spielt die aktuelle Runde aus und erzeugt ggf. die nächste. */
export const advanceTournament = (t: Tournament): Tournament => {
  if (t.champion) return t;
  const rounds = t.rounds.map((r) => [...r]);
  const current = rounds[rounds.length - 1];
  const played = current.map((m) => (m.winner ? m : playMatch(m)));
  rounds[rounds.length - 1] = played;
  if (played.length === 1) {
    return { ...t, rounds, champion: played[0].winner };
  }
  const next: Match[] = [];
  for (let i = 0; i < played.length; i += 2) {
    next.push({ a: played[i].winner!, b: played[i + 1].winner!, seed: `${played[i].seed}-n${rounds.length}` });
  }
  rounds.push(next);
  return { ...t, rounds };
};

export const ROUND_NAMES: Record<number, string> = {
  32: 'Sechzehntelfinale',
  16: 'Achtelfinale',
  8: 'Viertelfinale',
  4: 'Halbfinale',
  2: 'Finale',
};
