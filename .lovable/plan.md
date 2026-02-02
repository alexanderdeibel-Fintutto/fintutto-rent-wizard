

# Fintutto Rendite-Rechner - Implementierungsplan

## Projektübersicht
Eine professionelle Immobilien-Investment-Analyse-App mit Live-Berechnungen, Datenvisualisierung und persönlicher Speicherfunktion. Die App funktioniert im Gastmodus, das Speichern von Berechnungen erfordert einen Account.

---

## Phase 1: Design-System & Grundstruktur

### Farbschema & Typografie
- Indigo (#4F46E5) als Hauptfarbe, Violett (#7C3AED) als Akzent
- Hero-Gradient für Premium-Look
- Inter-Font für UI, JetBrains Mono für Zahlen (bessere Lesbarkeit)
- Ampel-System mit 5 Stufen für Rendite-Bewertung

### Layout
- Responsive Zweispalten-Layout (Desktop: 60/40)
- Mobile: Sticky-Footer für Ergebnisse während des Scrollens
- Dark Mode mit angepassten Farbvarianten

---

## Phase 2: Rechner-Eingabebereich

### Sektion 1: Kaufdaten
- Kaufpreis mit Währungsformatierung
- Bundesland-Dropdown mit automatischer Grunderwerbsteuer (3,5% - 6,5%)
- Vorausgefüllte Nebenkosten (Notar 1,5%, Makler 3,57%, Grundbuch 0,5%)

### Sektion 2: Mieteinnahmen
- Kaltmiete und Nebenkosten-Vorauszahlung
- Mietausfallwagnis (Default 2%)

### Sektion 3: Laufende Kosten
- Verwaltungskosten monatlich
- Instandhaltungsrücklage pro m²/Jahr
- Nicht umlagefähige Nebenkosten

### Sektion 4: Finanzierung
- Eigenkapital-Eingabe
- Automatische oder manuelle Darlehenssummen-Berechnung
- Zinssatz, Tilgungssatz und Zinsbindung

---

## Phase 3: Live-Ergebnis-Bereich

### Kennzahlen-Dashboard
- 6 farbcodierte Karten mit Ampel-System:
  - Brutto-Mietrendite
  - Netto-Mietrendite
  - Eigenkapital-Rendite
  - Monatlicher Cashflow (grün/rot je nach Vorzeichen)
  - Kaufpreis-Faktor
  - Gesamtinvestition

### Visualisierungen (Charts)
- **Cashflow-Entwicklung**: Liniendiagramm über 10 Jahre
- **Tilgungsplan**: Balkendiagramm (Zins vs. Tilgung pro Jahr)
- **Kosten-Aufschlüsselung**: Donut-Chart für Kaufnebenkosten

### Detail-Tabellen (aufklappbar)
- Kaufnebenkosten-Aufstellung
- Jährliche Einnahmen/Ausgaben
- Tilgungsplan der ersten 5 Jahre

---

## Phase 4: Authentifizierung

### Funktionen
- Email/Passwort Registrierung & Login
- "Passwort vergessen" mit Email-Link
- Persistente Session

### User Experience
- Rechner komplett nutzbar ohne Login
- Sanfter Hinweis beim Speichern-Versuch ohne Account
- Schneller Modal-Login ohne Seitenwechsel

---

## Phase 5: Speicher-Funktionalität

### Berechnung speichern
- Modal mit Namenseingabe
- Speichert alle Eingaben + berechnete Ergebnisse
- Zeitstempel für Sortierung

### "Meine Berechnungen" Seite
- Übersichtliche Liste mit Vorschau (Name, Kaufpreis, Rendite)
- Sortierung nach Datum
- Aktionen: Laden, Duplizieren, Löschen
- Nur sichtbar für eingeloggte User

### Datenbank (manuell in Supabase einzurichten)
- `calculations` Tabelle mit JSONB für flexible Datenspeicherung
- Row Level Security: Jeder User sieht nur eigene Berechnungen

---

## Technische Details

### Berechnungsformeln (mathematisch korrekt)
```
Brutto-Rendite = (Jahreskaltmiete / Kaufpreis) × 100
Netto-Rendite = ((Jahreskaltmiete - Jahreskosten) / Gesamtinvestition) × 100
EK-Rendite = ((Jahreskaltmiete - Jahreskosten - Zinskosten) / Eigenkapital) × 100
Cashflow = Monatsmiete - Verwaltung - Instandhaltung - Monatsrate
Faktor = Kaufpreis / Jahreskaltmiete
```

### Grunderwerbsteuer nach Bundesland
- Bayern, Sachsen: 3,5%
- Brandenburg, Schleswig-Holstein, Thüringen, NRW: 6,5%
- Andere Bundesländer: 5,0% - 6,0%

---

## Ergebnis
Eine professionelle, responsive Investment-Analyse-App mit:
- ✅ Intuitivem Rechner mit Live-Updates
- ✅ Übersichtlichen Visualisierungen
- ✅ Persönlicher Speicherfunktion
- ✅ Sicherem Authentifizierungssystem
- ✅ Komplett deutscher Benutzeroberfläche

