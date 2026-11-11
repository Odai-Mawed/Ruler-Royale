# 👑 Ruler Royale – Die Arena der Weltgeschichte

**Wer hätte gewonnen?** Napoleon gegen Umar ibn al-Chattab, Churchill gegen Trump, Kleopatra gegen Elisabeth I.,
Einstein gegen Leonardo – in Ruler Royale treten 69 Herrscher, Feldherren, Staatsleute und Genies aus 3.800 Jahren
Geschichte gegeneinander an.

Gebaut mit **Expo / React Native** – läuft im Web, auf iOS und Android. Fokus ist aktuell der Web-Build auf Netlify.

## Features

- ⚔️ **Arena (1 vs 1)** – Kämpfer wählen oder 🎲 Zufallsduell, dazu kuratierte *Traumduelle*
- 📏 **Tale of the Tape** – Werte-Vergleich, Heimarena, Spezialfähigkeit & Achillesferse beider Seiten
- 🔮 **Tippspiel** – Sieger vorhersagen, Trefferquote und Siegesserie sammeln
- 🎬 **Animierter Kampf** in 5 Runden mit Machtpunkte-Leisten, Kommentaren, Zufallsereignissen und K.O.s
- 📖 **Alternative Geschichte** – jeder Sieg erzeugt einen „Was wäre wenn“-Epilog
- 📤 **Teilen** – jeder Kampf ist deterministisch (Seed); geteilte Links (`?a=napoleon&b=omar&s=xyz`) zeigen exakt denselben Kampf
- 📚 **Lexikon** – Steckbrief, Werte, Fun Facts, simulierte Bilanz mit Lieblings- und Angstgegnern
- 🏆 **Turniere** – 4–32 Teilnehmer, Themen wie *Antike Giganten*, *Königinnen & Ikonen*, *Köpfe gegen Kronen*
- 📊 **Weltrangliste** – jeder gegen jeden, tausende simulierte Kämpfe, Podium
- 💾 Lokale Statistik (AsyncStorage / localStorage)

## Spielmechanik

| Runde | Arena |
|---|---|
| 1 | Heimarena von Rot (stärkstes Terrain) |
| 2 | Heimarena von Blau |
| 3–4 | Zufällige Arenen |
| 5 | ⏳ Das Urteil der Geschichte (Schaden ×1,5) |

Rundenwert = gewichtete Werte der Arena + Würfel + Spezialfähigkeit/Achillesferse + Ereignis.
Der Rundenverlierer verliert Machtpunkte; bei 0 MP gibt es ein K.O.

Arenen: Schlachtfeld, Verhandlungstisch, Rede ans Volk, Reichskrise, Hofintrige, Duell der Geister, Belagerung, Urteil der Geschichte.
Ereignisse: Eisiger Winter, Seuche, Verrat, Breaking News, Orakel, Goldrausch, Volksaufstand, Zeitriss, Sturm auf See.

> Alle Werte sind spielerische, subjektive Einschätzungen. Kampfansagen und Siegesreden sind frei erfunden.
> Bewusst nicht enthalten: Religionsstifter/Propheten und Verantwortliche von Völkermorden.

## Entwicklung

```bash
npm install
npm run web          # Dev-Server im Browser
npm run ios          # iOS (Expo Go / Simulator)
npm run android      # Android
npm run typecheck    # TypeScript prüfen
npm run build:web    # Statischer Web-Export nach dist/
```

## Deployment auf Netlify

Die `netlify.toml` ist fertig konfiguriert:

- Build-Befehl: `npm run build:web`
- Publish-Verzeichnis: `dist`
- SPA-Redirect auf `index.html`

Repository in Netlify verbinden → fertig. Alternativ lokal: `npm run build:web && npx netlify deploy --dir dist --prod`.

## Projektstruktur

```
App.tsx                 App-Shell, Tabs, Overlays, Deep-Links
src/data/figures.ts     Alle 69 Persönlichkeiten (Werte, Fähigkeiten, Fakten)
src/data/arenas.ts      Arenen, Ereignisse, Epochen
src/engine/battle.ts    Deterministische Kampf-Engine
src/engine/meta.ts      Weltrangliste, Matchup-Profile, Turniere
src/engine/rng.ts       Seed-basierter Zufall
src/screens/            Arena, Kampf, Lexikon, Detail, Turnier, Rangliste, Regeln
```

Neue Figuren hinzufügen: einfach einen Eintrag in `src/data/figures.ts` ergänzen.
