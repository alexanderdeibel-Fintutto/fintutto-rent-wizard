export interface CalculatorInputs {
  // Adresse (Google Maps verifiziert)
  adresse: string;
  adresseVerifiziert: boolean;
  placeId: string;
  latitude: number | null;
  longitude: number | null;

  // Kaufdaten
  kaufpreis: number;
  bundesland: string;
  grunderwerbsteuer: number;
  notarkosten: number;
  maklergebuehr: number;
  grundbuchkosten: number;

  // Mieteinnahmen
  kaltmiete: number;
  nebenkostenVorauszahlung: number;
  mietausfallwagnis: number;

  // Laufende Kosten
  verwaltungskosten: number;
  instandhaltungsruecklage: number;
  wohnflaeche: number;
  nichtUmlagefaehigeNebenkosten: number;

  // Finanzierung
  eigenkapital: number;
  darlehenssumme: number;
  zinssatz: number;
  tilgungssatz: number;
  zinsbindung: number;
  autoBerechnung: boolean;
}

export interface CalculatorResults {
  // Kaufnebenkosten
  grunderwerbsteuerBetrag: number;
  notarkostenBetrag: number;
  maklergebuehrBetrag: number;
  grundbuchkostenBetrag: number;
  kaufnebenkostenGesamt: number;
  gesamtinvestition: number;

  // Renditen
  bruttoMietrendite: number;
  nettoMietrendite: number;
  eigenkapitalRendite: number;

  // Cashflow
  monatlicheEinnahmen: number;
  monatlicheKosten: number;
  monatlicheRate: number;
  monatlicheZinsen: number;
  monatlicheTilgung: number;
  monatlicheInstandhaltung: number;
  monatlicheVerwaltung: number;
  monatlichNichtUmlagefaehig: number;
  monatlichMietausfall: number;
  monatlicheCashflow: number;

  // Jahreszahlen
  jahreskaltmiete: number;
  jahreskosten: number;
  jahreszinsen: number;
  jahresNettoEinkommen: number;

  // Faktor
  kaufpreisFaktor: number;

  // Tilgungsplan
  tilgungsplan: TilgungsplanJahr[];

  // Cashflow-Entwicklung
  cashflowEntwicklung: CashflowJahr[];
}

export interface TilgungsplanJahr {
  jahr: number;
  anfangsschuld: number;
  zinsen: number;
  tilgung: number;
  gesamtrate: number;
  restschuld: number;
}

export interface CashflowJahr {
  jahr: number;
  einnahmen: number;
  kosten: number;
  zinsen: number;
  tilgung: number;
  cashflow: number;
  kumuliert: number;
}

export interface SavedCalculation {
  id: string;
  user_id: string;
  name: string;
  input_data: CalculatorInputs;
  results: CalculatorResults;
  created_at: string;
  updated_at: string;
}

export type YieldRating = 'excellent' | 'good' | 'ok' | 'weak' | 'bad';

export const BUNDESLAENDER: Record<string, number> = {
  'Baden-Württemberg': 5.0,
  'Bayern': 3.5,
  'Berlin': 6.0,
  'Brandenburg': 6.5,
  'Bremen': 5.0,
  'Hamburg': 5.5,
  'Hessen': 6.0,
  'Mecklenburg-Vorpommern': 6.0,
  'Niedersachsen': 5.0,
  'Nordrhein-Westfalen': 6.5,
  'Rheinland-Pfalz': 5.0,
  'Saarland': 6.5,
  'Sachsen': 3.5,
  'Sachsen-Anhalt': 5.0,
  'Schleswig-Holstein': 6.5,
  'Thüringen': 6.5,
};
