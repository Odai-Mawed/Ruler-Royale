import type { ArenaId, Era, EventId, Figure, StatKey } from '../types';

export const STAT_LABELS: Record<StatKey, string> = {
  mil: 'Militär',
  str: 'Strategie',
  dip: 'Diplomatie',
  cha: 'Charisma',
  adm: 'Verwaltung',
  int: 'Intellekt',
  leg: 'Vermächtnis',
};

export const STAT_ICONS: Record<StatKey, string> = {
  mil: '⚔️',
  str: '♟️',
  dip: '🤝',
  cha: '🔥',
  adm: '🏛️',
  int: '🧠',
  leg: '📜',
};

export const STAT_KEYS: StatKey[] = ['mil', 'str', 'dip', 'cha', 'adm', 'int', 'leg'];

export interface Arena {
  id: ArenaId;
  name: string;
  emoji: string;
  intro: string;
  weights: Partial<Record<StatKey, number>>;
  winTight: string[];
  winBig: string[];
}

export const ARENAS: Record<ArenaId, Arena> = {
  schlacht: {
    id: 'schlacht',
    name: 'Das Schlachtfeld',
    emoji: '⚔️',
    intro: 'Zwei Heere, eine Ebene, kein Zurück.',
    weights: { mil: 0.5, str: 0.35, cha: 0.15 },
    winTight: [
      '{W} durchbricht im letzten Moment die Linien von {L}.',
      'Ein Flankenmanöver in letzter Sekunde – {W} behält knapp das Feld.',
      'Staub, Chaos, Geschrei – als sich der Nebel lichtet, steht {W}s Banner noch.',
    ],
    winBig: [
      '{W} überrollt {L} wie eine Lawine. Das war keine Schlacht, das war eine Lektion.',
      '{L}s Truppen fliehen in alle Himmelsrichtungen. {W} lässt sich nicht mal aufhalten.',
      'Totale Umfassung! {W} kesselt {L} komplett ein.',
    ],
  },
  diplomatie: {
    id: 'diplomatie',
    name: 'Der Verhandlungstisch',
    emoji: '🤝',
    intro: 'Kein Schwert, nur Worte, Wein und Hintergedanken.',
    weights: { dip: 0.55, cha: 0.25, int: 0.2 },
    winTight: [
      '{W} ringt {L} in letzter Minute eine Unterschrift ab.',
      'Nach zwölf Stunden Verhandlung steht fest: {W} hat das kleine Detail im Vertrag versteckt.',
      'Ein Kompromiss – aber einer, der {W} deutlich besser schmeckt.',
    ],
    winBig: [
      '{W} diktiert die Bedingungen, {L} darf nur noch unterschreiben.',
      '{L} verlässt den Saal ohne Schuhe – {W} hat sogar die verhandelt.',
      'Meisterklasse in Diplomatie: {W} lässt {L} glauben, es sei dessen eigene Idee gewesen.',
    ],
  },
  rede: {
    id: 'rede',
    name: 'Die Rede ans Volk',
    emoji: '📣',
    intro: 'Ein Balkon, ein Platz voller Menschen und ein Mikrofon (oder eine sehr laute Stimme).',
    weights: { cha: 0.6, leg: 0.2, dip: 0.2 },
    winTight: [
      'Das Publikum ist gespalten – doch {W}s Schlusssatz bringt den Jubel.',
      '{W} gewinnt das Volk mit einer einzigen, perfekt platzierten Pause.',
    ],
    winBig: [
      'Gänsehaut! Die Menge trägt {W} auf Schultern, während {L} noch das Mikro sucht.',
      '{W} spricht – und selbst {L}s Anhänger klatschen mit.',
      'Standing Ovations für {W}. {L} wird höflich ausgepfiffen.',
    ],
  },
  krise: {
    id: 'krise',
    name: 'Die Reichskrise',
    emoji: '🔥',
    intro: 'Hungersnot, leere Kassen, Chaos in den Provinzen. Wer hält das Reich zusammen?',
    weights: { adm: 0.5, str: 0.3, int: 0.2 },
    winTight: [
      '{W} stopft das Haushaltsloch – mit viel Kreativität und etwas Glück.',
      'Knapp! {W}s Reformen greifen einen Tag, bevor alles zusammenbricht.',
    ],
    winBig: [
      '{W} löst die Krise vor dem Frühstück. {L} sucht noch die Akten.',
      'Während bei {L} die Provinzen rebellieren, baut {W} schon die nächste Straße.',
    ],
  },
  intrige: {
    id: 'intrige',
    name: 'Die Hofintrige',
    emoji: '🗝️',
    intro: 'Geflüster hinter Vorhängen, vergiftete Becher, falsche Freunde.',
    weights: { str: 0.45, int: 0.3, dip: 0.25 },
    winTight: [
      '{W} fängt den entscheidenden Brief ab – um Haaresbreite.',
      'Wer hat wen verraten? Am Ende sitzt {W} auf dem Thron, knapp.',
    ],
    winBig: [
      '{L} merkt erst drei Züge später, dass {W} längst gewonnen hat.',
      '{W} spinnt ein Netz so fein, dass sich {L} selbst darin fesselt.',
    ],
  },
  geist: {
    id: 'geist',
    name: 'Das Duell der Geister',
    emoji: '🧠',
    intro: 'Rätsel, Philosophie und ein Schachbrett. Muskeln zählen hier nicht.',
    weights: { int: 0.6, str: 0.25, cha: 0.15 },
    winTight: [
      'Schach – und nach 4 Stunden Matt: {W} gewinnt hauchdünn.',
      '{W} findet den Fehler in {L}s Argument in der allerletzten Sekunde.',
    ],
    winBig: [
      '{W} löst das Rätsel, bevor {L} die Frage verstanden hat.',
      'Intellektueller Knockout: {W} zerlegt {L}s These in ihre Einzelteile.',
    ],
  },
  belagerung: {
    id: 'belagerung',
    name: 'Die Belagerung',
    emoji: '🏰',
    intro: 'Hohe Mauern, knappe Vorräte, Geduld als Waffe.',
    weights: { mil: 0.4, str: 0.3, adm: 0.3 },
    winTight: [
      'Die Vorräte reichen genau einen Tag länger: {W} hält durch.',
      'Ein geheimer Tunnel entscheidet – {W} ist knapp im Vorteil.',
    ],
    winBig: [
      'Die Mauern von {L} fallen wie Kartenhäuser. {W} marschiert ein.',
      '{W} belagert so geduldig, dass {L} freiwillig die Tore öffnet.',
    ],
  },
  finale: {
    id: 'finale',
    name: 'Das Urteil der Geschichte',
    emoji: '⏳',
    intro: 'Finale! Jahrhunderte später: Wessen Name lebt weiter? (Doppelter Schaden)',
    weights: { leg: 0.6, adm: 0.2, cha: 0.2 },
    winTight: [
      'Die Historiker streiten noch immer – aber die Mehrheit stimmt für {W}.',
      'Knapp, aber eindeutig: Die Schulbücher widmen {W} ein Kapitel mehr.',
    ],
    winBig: [
      'Die Geschichte hat entschieden: {W} lebt in Statuen, Straßennamen und Schulbüchern. {L}? Eine Fußnote.',
      'Jahrhunderte vergehen – und überall auf der Welt kennt man {W}s Namen.',
    ],
  },
};

export const REGULAR_ARENAS: ArenaId[] = ['schlacht', 'diplomatie', 'rede', 'krise', 'intrige', 'geist', 'belagerung'];

export interface GameEvent {
  id: EventId;
  name: string;
  emoji: string;
  text: string;
}

export const EVENTS: Record<EventId, GameEvent> = {
  winter: { id: 'winter', name: 'Eisiger Winter', emoji: '❄️', text: 'Ein brutaler Winter bricht herein. Nordische Herrscher grinsen.' },
  seuche: { id: 'seuche', name: 'Seuche im Lager', emoji: '🦠', text: 'Eine Krankheit breitet sich aus – und trifft eine Seite härter.' },
  verrat: { id: 'verrat', name: 'Verrat!', emoji: '🗡️', text: 'Ein Vertrauter wechselt die Seiten. Wer schlechter organisiert ist, leidet.' },
  presse: { id: 'presse', name: 'Breaking News', emoji: '📰', text: 'Die Presse dreht durch! Moderne Figuren werden durchgeschüttelt, Antike fragen: „Was ist eine Zeitung?“' },
  orakel: { id: 'orakel', name: 'Das Orakel spricht', emoji: '🔮', text: 'Das Orakel von Delphi meldet sich. Antike Herrscher fühlen sich bestätigt.' },
  gold: { id: 'gold', name: 'Goldrausch', emoji: '🪙', text: 'Eine Goldader wird entdeckt! Gute Verwalter profitieren.' },
  volk: { id: 'volk', name: 'Das Volk erhebt sich', emoji: '✊', text: 'Massen auf den Straßen! Nur echtes Charisma zähmt die Menge.' },
  zeitriss: { id: 'zeitriss', name: 'Zeitriss', emoji: '🌀', text: 'Das Raum-Zeit-Kontinuum flackert. Der Außenseiter bekommt Rückenwind.' },
  sturm: { id: 'sturm', name: 'Sturm auf See', emoji: '🌊', text: 'Ein Sturm zieht auf. Seemächte wissen, was zu tun ist.' },
};

export const EVENT_IDS = Object.keys(EVENTS) as EventId[];

export const eraOf = (year: number): Era => {
  if (year < 500) return 'Antike';
  if (year < 1500) return 'Mittelalter';
  if (year < 1789) return 'Frühe Neuzeit';
  if (year < 1950) return 'Moderne';
  return 'Gegenwart';
};

export const ERAS: Era[] = ['Antike', 'Mittelalter', 'Frühe Neuzeit', 'Moderne', 'Gegenwart'];

export const ERA_COLORS: Record<Era, [string, string]> = {
  Antike: ['#c9a227', '#6b4e16'],
  Mittelalter: ['#b23a48', '#4a1520'],
  'Frühe Neuzeit': ['#3a7bd5', '#142d57'],
  Moderne: ['#2a9d8f', '#0f3b36'],
  Gegenwart: ['#8e5bd6', '#2e1a4d'],
};

export const power = (f: Figure): number => {
  const v = Object.values(f.stats);
  return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
};

export const formatYear = (y: number) => (y < 0 ? `${-y} v. Chr.` : `${y}`);
