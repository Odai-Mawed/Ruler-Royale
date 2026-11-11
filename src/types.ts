export type StatKey = 'mil' | 'str' | 'dip' | 'cha' | 'adm' | 'int' | 'leg';

export type Stats = Record<StatKey, number>;

export type ArenaId =
  | 'schlacht'
  | 'diplomatie'
  | 'rede'
  | 'krise'
  | 'intrige'
  | 'geist'
  | 'belagerung'
  | 'finale';

export type EventId =
  | 'winter'
  | 'seuche'
  | 'verrat'
  | 'presse'
  | 'orakel'
  | 'gold'
  | 'volk'
  | 'zeitriss'
  | 'sturm';

export type Tag =
  | 'eroberer'
  | 'reiter'
  | 'seemacht'
  | 'redner'
  | 'reformer'
  | 'rebell'
  | 'diplomat'
  | 'taktiker'
  | 'gelehrt'
  | 'baumeister'
  | 'nordisch'
  | 'reich';

export type Trigger =
  | { kind: 'arena'; arena: ArenaId }
  | { kind: 'opening' }
  | { kind: 'finale' }
  | { kind: 'comeback' }
  | { kind: 'lowHp' }
  | { kind: 'vsOlder' }
  | { kind: 'anyEvent' }
  | { kind: 'event'; event: EventId }
  | { kind: 'swap'; from: StatKey; to: StatKey }
  | { kind: 'chaos' };

export interface Ability {
  name: string;
  desc: string;
  trigger: Trigger;
  value: number;
}

export type Category =
  | 'Eroberer'
  | 'Kaiser & Könige'
  | 'Kalifen & Sultane'
  | 'Staatsleute'
  | 'Revolutionäre'
  | 'Denker & Genies';

export interface Figure {
  id: string;
  name: string;
  title: string;
  lived: string;
  year: number; // Jahr der größten Macht (negativ = v. Chr.)
  region: string;
  emoji: string;
  category: Category;
  stats: Stats;
  tags: Tag[];
  chaos?: number; // Zufallsstreuung, Standard 1
  ability: Ability;
  weakness: Ability;
  taunt: string; // fiktive Kampfansage
  bio: string;
  fact: string;
}

export type Era = 'Antike' | 'Mittelalter' | 'Frühe Neuzeit' | 'Moderne' | 'Gegenwart';
