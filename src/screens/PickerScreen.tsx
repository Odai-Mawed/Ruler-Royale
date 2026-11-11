import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ERAS, eraOf, power } from '../data/arenas';
import { FIGURES } from '../data/figures';
import { C, MAX_W } from '../theme';
import type { Era } from '../types';
import { Avatar, Chip } from '../ui';
import { OverlayHeader } from './common';

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export const useFigureFilter = () => {
  const [query, setQuery] = useState('');
  const [era, setEra] = useState<Era | null>(null);
  const list = useMemo(() => {
    const q = normalize(query.trim());
    return FIGURES.filter(
      (f) =>
        (!era || eraOf(f.year) === era) &&
        (!q || normalize(`${f.name} ${f.title} ${f.region} ${f.category}`).includes(q)),
    );
  }, [query, era]);
  return { query, setQuery, era, setEra, list };
};

export const SearchBar = ({ value, onChange }: { value: string; onChange: (s: string) => void }) => (
  <TextInput
    value={value}
    onChangeText={onChange}
    placeholder="Suche: Name, Titel, Region …"
    placeholderTextColor={C.dim}
    style={styles.search}
    autoCorrect={false}
  />
);

export const EraChips = ({ era, setEra }: { era: Era | null; setEra: (e: Era | null) => void }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
    <Chip label="Alle" active={!era} onPress={() => setEra(null)} />
    {ERAS.map((e) => (
      <Chip key={e} label={e} active={era === e} onPress={() => setEra(era === e ? null : e)} />
    ))}
  </View>
);

export default function PickerScreen({
  title,
  onPick,
  exclude,
}: {
  title: string;
  onPick: (id: string) => void;
  exclude?: string;
}) {
  const { query, setQuery, era, setEra, list } = useFigureFilter();
  return (
    <View style={{ flex: 1 }}>
      <OverlayHeader
        title={title}
        right={
          <Pressable
            onPress={() => {
              const pool = FIGURES.filter((f) => f.id !== exclude);
              onPick(pool[Math.floor(Math.random() * pool.length)].id);
            }}
          >
            <Text style={{ color: C.gold, fontWeight: '600' }}>Zufall</Text>
          </Pressable>
        }
      />
      <FlatList
        data={list}
        keyExtractor={(f) => f.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={{ marginBottom: 8 }}>
            <SearchBar value={query} onChange={setQuery} />
            <EraChips era={era} setEra={setEra} />
          </View>
        }
        renderItem={({ item }) => {
          const disabled = item.id === exclude;
          return (
            <Pressable
              disabled={disabled}
              onPress={() => onPick(item.id)}
              style={({ pressed }) => [styles.row, disabled && { opacity: 0.35 }, pressed && { backgroundColor: C.surface2 }]}
            >
              <Avatar fig={item} size={46} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {item.title} · {item.lived}
                </Text>
              </View>
              <Text style={styles.power}>⚡{power(item)}</Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={{ color: C.muted, textAlign: 'center', marginTop: 40 }}>Niemand gefunden 🤷</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: { width: '100%', maxWidth: MAX_W, alignSelf: 'center', padding: 16, paddingBottom: 60 },
  search: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: C.text,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  name: { color: C.text, fontWeight: '600', fontSize: 15 },
  meta: { color: C.muted, fontSize: 12, marginTop: 2 },
  power: { color: C.muted, fontWeight: '500', fontSize: 13 },
});
