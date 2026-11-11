import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { eraOf, power } from '../data/arenas';
import { FIGURES } from '../data/figures';
import { useNav } from '../nav';
import { C, MAX_W } from '../theme';
import type { Category } from '../types';
import { Avatar, Chip, FadeIn, H1, P } from '../ui';
import { Screen } from './common';
import { EraChips, SearchBar, useFigureFilter } from './PickerScreen';

const CATEGORIES: Category[] = ['Eroberer', 'Kaiser & Könige', 'Kalifen & Sultane', 'Staatsleute', 'Revolutionäre', 'Denker & Genies'];

type Sort = 'chrono' | 'power' | 'name';

export default function LexikonScreen() {
  const nav = useNav();
  const { width } = useWindowDimensions();
  const { query, setQuery, era, setEra, list } = useFigureFilter();
  const [cat, setCat] = useState<Category | null>(null);
  const [sort, setSort] = useState<Sort>('chrono');

  const shown = useMemo(() => {
    const l = list.filter((f) => !cat || f.category === cat);
    if (sort === 'power') return [...l].sort((x, y) => power(y) - power(x));
    if (sort === 'name') return [...l].sort((x, y) => x.name.localeCompare(y.name, 'de'));
    return [...l].sort((x, y) => x.year - y.year);
  }, [list, cat, sort]);

  const cols = width > 860 ? 4 : width > 560 ? 3 : 2;
  const cardW = (Math.min(width, MAX_W) - 32 - (cols - 1) * 10) / cols;

  return (
    <Screen>
      <H1>Lexikon</H1>
      <P>
        {FIGURES.length} Persönlichkeiten aus 3.800 Jahren Geschichte. Tippe auf eine Karte für Werte, Fähigkeiten und
        Fun Facts.
      </P>
      <View style={{ marginTop: 14 }}>
        <SearchBar value={query} onChange={setQuery} />
      </View>
      <EraChips era={era} setEra={setEra} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} active={cat === c} onPress={() => setCat(cat === c ? null : c)} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 12 }}>
        <Text style={{ color: C.muted, marginRight: 8, fontSize: 13 }}>Sortieren:</Text>
        <Chip label="Zeit" active={sort === 'chrono'} onPress={() => setSort('chrono')} />
        <Chip label="Stärke" active={sort === 'power'} onPress={() => setSort('power')} />
        <Chip label="A–Z" active={sort === 'name'} onPress={() => setSort('name')} />
      </View>

      <View style={styles.grid}>
        {shown.map((f, i) => (
          <FadeIn key={f.id} delay={Math.min(i, 12) * 25} style={{ width: cardW }}>
            <Pressable
              onPress={() => nav.openDetail(f.id)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}
            >
              <Avatar fig={f} size={64} />
              <Text style={styles.name} numberOfLines={2}>
                {f.name}
              </Text>
              <Text style={styles.title} numberOfLines={1}>
                {f.title}
              </Text>
              <Text style={styles.era}>
                {eraOf(f.year)} · {f.lived}
              </Text>
              <View style={styles.power}>
                <Text style={styles.powerText}>⚡ {power(f)}</Text>
              </View>
            </Pressable>
          </FadeIn>
        ))}
      </View>
      {shown.length === 0 && <P style={{ textAlign: 'center', marginTop: 30 }}>Niemand gefunden 🤷</P>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    padding: 14,
    alignItems: 'center',
    minHeight: 200,
  },
  name: { color: C.text, fontWeight: '600', fontSize: 14, textAlign: 'center', marginTop: 10 },
  title: { color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 2 },
  era: { color: C.dim, fontSize: 11, textAlign: 'center', marginTop: 4 },
  power: { marginTop: 8, backgroundColor: C.surface2, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  powerText: { color: C.muted, fontSize: 12, fontWeight: '500' },
});
