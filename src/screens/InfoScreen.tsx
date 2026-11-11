import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ARENAS, EVENTS, STAT_ICONS, STAT_LABELS } from '../data/arenas';
import { resetProfile } from '../storage';
import { C } from '../theme';
import type { StatKey } from '../types';
import { Btn, Card, H1, P, Section } from '../ui';
import { Screen } from './common';

export default function InfoScreen() {
  return (
    <Screen>
      <H1>So funktioniert’s</H1>
      <P>
        Eine Zeitmaschine holt zwei Persönlichkeiten in eine neutrale Arena. Technik und Epoche werden ausgeglichen – es
        zählt nur, was die Person selbst ausgemacht hat: Talent, Charisma, Kalkül und Vermächtnis.
      </P>

      <Section title="Der Ablauf">
        <Card style={{ gap: 8 }}>
          <Rule n="1" text="Beide starten mit 100 Machtpunkten (MP)." />
          <Rule n="2" text="Runde 1 & 2: Jede Seite wählt ihre Heimarena – das Terrain, auf dem sie am stärksten ist." />
          <Rule n="3" text="Runde 3 & 4: Zufällige Arenen. Hier zeigt sich, wer vielseitig ist." />
          <Rule n="4" text="Runde 5: Das Urteil der Geschichte – mit 1,5-fachem Schaden." />
          <Rule n="5" text="Pro Runde: Gewichtete Werte + Würfel + Fähigkeiten + Ereignisse. Der Verlierer der Runde verliert MP." />
          <Rule n="6" text="Fällt jemand auf 0 MP: K.O.! Sonst gewinnt, wer am Ende mehr MP hat." />
        </Card>
      </Section>

      <Section title="Die Arenen">
        <View style={{ gap: 8 }}>
          {Object.values(ARENAS).map((a) => (
            <Card key={a.id} style={{ paddingVertical: 12 }}>
              <Text style={styles.arena}>
                {a.name}
              </Text>
              <P style={{ fontSize: 13 }}>{a.intro}</P>
              <Text style={styles.weights}>
                {(Object.entries(a.weights) as [StatKey, number][])
                  .map(([k, w]) => `${STAT_ICONS[k]} ${STAT_LABELS[k]} ${Math.round(w * 100)}%`)
                  .join('  ·  ')}
              </Text>
            </Card>
          ))}
        </View>
      </Section>

      <Section title="Zufallsereignisse">
        <Card style={{ gap: 10 }}>
          {Object.values(EVENTS).map((e) => (
            <View key={e.id}>
              <Text style={styles.eventName}>
                {e.name}
              </Text>
              <P style={{ fontSize: 13 }}>{e.text}</P>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Fähigkeiten & Schwächen">
        <Card>
          <P>
            Jede Figur hat eine Spezialfähigkeit (z. B. Napoleons „Sonne von Austerlitz“ beim Eröffnungszug) und eine
            Achillesferse (z. B. der „Russische Winter“). Manche kämpfen ganz anders: Gandhi nutzt Charisma statt
            Militär, Sunzi Strategie, Leonardo seine Erfindungen. Einige Figuren haben einen Chaos-Faktor – genial
            oder daneben.
          </P>
        </Card>
      </Section>

      <Section title="Fairness & Hinweise">
        <Card>
          <P>
            Alle Werte sind spielerische, subjektive Einschätzungen und keine historischen Urteile. Die Kampfansagen und
            Siegesreden sind frei erfunden und keine echten Zitate (auch wenn manche an bekannte Aussprüche angelehnt
            sind). Bewusst nicht enthalten sind Religionsstifter und Propheten sowie Verantwortliche von Völkermorden –
            sie gehören nicht in ein Spiel.
          </P>
        </Card>
      </Section>

      <Section title="Daten">
        <Btn label="Meine Statistik zurücksetzen" onPress={resetProfile} variant="dark" />
      </Section>
      <Text style={styles.footer}>Ruler Royale · Mit Liebe zur Geschichte gebaut 👑</Text>
    </Screen>
  );
}

const Rule = ({ n, text }: { n: string; text: string }) => (
  <View style={{ flexDirection: 'row', gap: 10 }}>
    <View style={styles.num}>
      <Text style={{ color: C.onAccent, fontWeight: '800', fontSize: 12 }}>{n}</Text>
    </View>
    <Text style={{ color: C.text, flex: 1, fontSize: 14, lineHeight: 20 }}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  arena: { color: C.text, fontWeight: '600', fontSize: 16 },
  weights: { color: C.text, fontSize: 12, marginTop: 6 },
  eventName: { color: C.text, fontWeight: '600', fontSize: 14 },
  num: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  footer: { color: C.dim, textAlign: 'center', marginTop: 30, fontSize: 12 },
});
