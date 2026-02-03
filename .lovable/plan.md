

# Fix: Supabase-Client Inkonsistenz beheben

## Problem
Die Anwendung zeigt "Supabase nicht konfiguriert", obwohl Supabase korrekt verbunden ist. 

**Ursache:** Es gibt zwei Supabase-Client-Dateien:
- `src/integrations/supabase/client.ts` - Funktioniert (hardcodierte Werte)
- `src/lib/supabase.ts` - Kaputt (sucht nach falscher ENV-Variable)

Der AuthContext verwendet die kaputte Datei.

## Lösung

### Schritt 1: AuthContext auf korrekten Client umstellen
Die Datei `src/contexts/AuthContext.tsx` wird angepasst:
- Import von `@/integrations/supabase/client` statt `@/lib/supabase`
- Die `isSupabaseConfigured` Funktion wird entfernt (nicht mehr nötig)
- `isConfigured` wird auf `true` gesetzt (da hardcodiert immer verfügbar)

### Schritt 2: Weitere Dateien aktualisieren
Alle Dateien, die `@/lib/supabase` importieren, werden auf `@/integrations/supabase/client` umgestellt:
- `src/components/calculator/SaveModal.tsx`
- `src/lib/stripe.ts`

### Schritt 3: Veraltete Datei entfernen (optional)
Die Datei `src/lib/supabase.ts` kann gelöscht werden, da sie nicht mehr benötigt wird.

## Technische Details

```text
VORHER:
┌─────────────────────────┐     ┌──────────────────────┐
│ AuthContext.tsx         │────▶│ lib/supabase.ts      │
│                         │     │ sucht: ANON_KEY      │
└─────────────────────────┘     │ → null (nicht da!)   │
                                └──────────────────────┘

NACHHER:
┌─────────────────────────┐     ┌──────────────────────────┐
│ AuthContext.tsx         │────▶│ integrations/supabase/   │
│                         │     │ client.ts                │
└─────────────────────────┘     │ → hardcodierte Werte ✓   │
                                └──────────────────────────┘
```

## Betroffene Dateien
1. `src/contexts/AuthContext.tsx` - Import ändern
2. `src/components/calculator/SaveModal.tsx` - Import ändern
3. `src/lib/stripe.ts` - Import ändern
4. `src/lib/supabase.ts` - Löschen

## Ergebnis
Nach der Änderung funktioniert die Authentifizierung sofort, ohne dass Einstellungen geändert werden müssen.

