import { useMemo } from 'react';
import type { CalculatorInputs, CalculatorResults, TilgungsplanJahr, CashflowJahr, YieldRating } from '@/types/calculator';

export const getDefaultInputs = (): CalculatorInputs => ({
  // Adresse
  adresse: '',
  adresseVerifiziert: false,
  placeId: '',
  latitude: null,
  longitude: null,
  // Kaufdaten
  kaufpreis: 250000,
  bundesland: 'Bayern',
  grunderwerbsteuer: 3.5,
  notarkosten: 1.5,
  maklergebuehr: 3.57,
  grundbuchkosten: 0.5,
  kaltmiete: 800,
  nebenkostenVorauszahlung: 150,
  mietausfallwagnis: 2,
  verwaltungskosten: 25,
  instandhaltungsruecklage: 10,
  wohnflaeche: 60,
  nichtUmlagefaehigeNebenkosten: 300,
  eigenkapital: 50000,
  darlehenssumme: 0,
  zinssatz: 3.5,
  tilgungssatz: 2,
  zinsbindung: 10,
  autoBerechnung: true,
});

export const calculateResults = (inputs: CalculatorInputs): CalculatorResults => {
  // Kaufnebenkosten berechnen
  const grunderwerbsteuerBetrag = inputs.kaufpreis * (inputs.grunderwerbsteuer / 100);
  const notarkostenBetrag = inputs.kaufpreis * (inputs.notarkosten / 100);
  const maklergebuehrBetrag = inputs.kaufpreis * (inputs.maklergebuehr / 100);
  const grundbuchkostenBetrag = inputs.kaufpreis * (inputs.grundbuchkosten / 100);
  const kaufnebenkostenGesamt = grunderwerbsteuerBetrag + notarkostenBetrag + maklergebuehrBetrag + grundbuchkostenBetrag;
  const gesamtinvestition = inputs.kaufpreis + kaufnebenkostenGesamt;

  // Darlehenssumme berechnen
  const darlehenssumme = inputs.autoBerechnung
    ? gesamtinvestition - inputs.eigenkapital
    : inputs.darlehenssumme;

  // Jahreszahlen
  const jahreskaltmiete = inputs.kaltmiete * 12;
  const mietausfallBetrag = jahreskaltmiete * (inputs.mietausfallwagnis / 100);
  const effektiveJahreskaltmiete = jahreskaltmiete - mietausfallBetrag;

  // Jährliche Kosten
  const jahresVerwaltung = inputs.verwaltungskosten * 12;
  const jahresInstandhaltung = inputs.instandhaltungsruecklage * inputs.wohnflaeche;
  const jahreskosten = jahresVerwaltung + jahresInstandhaltung + inputs.nichtUmlagefaehigeNebenkosten;

  // Finanzierung
  const jahreszinsen = darlehenssumme * (inputs.zinssatz / 100);
  const jahresannuitaet = darlehenssumme * ((inputs.zinssatz + inputs.tilgungssatz) / 100);
  const monatlicheRate = jahresannuitaet / 12;

  // Monatliche Werte
  const monatlicheZinsen = jahreszinsen / 12;
  const monatlicheTilgung = monatlicheRate - monatlicheZinsen;
  const monatlicheInstandhaltung = jahresInstandhaltung / 12;
  const monatlicheVerwaltung = inputs.verwaltungskosten;
  const monatlichNichtUmlagefaehig = inputs.nichtUmlagefaehigeNebenkosten / 12;
  const monatlichMietausfall = mietausfallBetrag / 12;

  const monatlicheEinnahmen = inputs.kaltmiete;
  const monatlicheKosten = monatlicheVerwaltung + monatlicheInstandhaltung + monatlichNichtUmlagefaehig + monatlichMietausfall;
  const monatlicheCashflow = monatlicheEinnahmen - monatlicheKosten - monatlicheRate;

  // Renditen berechnen
  const bruttoMietrendite = inputs.kaufpreis > 0 ? (jahreskaltmiete / inputs.kaufpreis) * 100 : 0;
  const nettoMietrendite = gesamtinvestition > 0 
    ? ((effektiveJahreskaltmiete - jahreskosten) / gesamtinvestition) * 100 
    : 0;
  const eigenkapitalRendite = inputs.eigenkapital > 0
    ? ((effektiveJahreskaltmiete - jahreskosten - jahreszinsen) / inputs.eigenkapital) * 100
    : 0;

  // Kaufpreis-Faktor
  const kaufpreisFaktor = jahreskaltmiete > 0 ? inputs.kaufpreis / jahreskaltmiete : 0;

  // Jahres-Netto
  const jahresNettoEinkommen = effektiveJahreskaltmiete - jahreskosten - jahreszinsen;

  // Tilgungsplan berechnen (10 Jahre)
  const tilgungsplan: TilgungsplanJahr[] = [];
  let restschuld = darlehenssumme;

  for (let jahr = 1; jahr <= 10; jahr++) {
    const zinsen = restschuld * (inputs.zinssatz / 100);
    const tilgung = Math.min(jahresannuitaet - zinsen, restschuld);
    const gesamtrate = zinsen + tilgung;
    const neueRestschuld = restschuld - tilgung;

    tilgungsplan.push({
      jahr,
      anfangsschuld: restschuld,
      zinsen,
      tilgung,
      gesamtrate,
      restschuld: neueRestschuld,
    });

    restschuld = neueRestschuld;
  }

  // Cashflow-Entwicklung berechnen (10 Jahre mit 2% Mietsteigerung)
  const cashflowEntwicklung: CashflowJahr[] = [];
  let kumuliertCashflow = 0;
  let aktuelleJahreskaltmiete = jahreskaltmiete;

  for (let jahr = 1; jahr <= 10; jahr++) {
    const mietsteigerung = jahr > 1 ? 1.02 : 1;
    aktuelleJahreskaltmiete = jahreskaltmiete * Math.pow(1.02, jahr - 1);
    const aktuelleMietausfall = aktuelleJahreskaltmiete * (inputs.mietausfallwagnis / 100);
    const effektiveMiete = aktuelleJahreskaltmiete - aktuelleMietausfall;
    
    const planJahr = tilgungsplan[jahr - 1];
    const jahresCashflow = effektiveMiete - jahreskosten - planJahr.gesamtrate;
    kumuliertCashflow += jahresCashflow;

    cashflowEntwicklung.push({
      jahr,
      einnahmen: aktuelleJahreskaltmiete,
      kosten: jahreskosten,
      zinsen: planJahr.zinsen,
      tilgung: planJahr.tilgung,
      cashflow: jahresCashflow,
      kumuliert: kumuliertCashflow,
    });
  }

  return {
    grunderwerbsteuerBetrag,
    notarkostenBetrag,
    maklergebuehrBetrag,
    grundbuchkostenBetrag,
    kaufnebenkostenGesamt,
    gesamtinvestition,
    bruttoMietrendite,
    nettoMietrendite,
    eigenkapitalRendite,
    monatlicheEinnahmen,
    monatlicheKosten,
    monatlicheRate,
    monatlicheZinsen,
    monatlicheTilgung,
    monatlicheInstandhaltung,
    monatlicheVerwaltung,
    monatlichNichtUmlagefaehig,
    monatlichMietausfall,
    monatlicheCashflow,
    jahreskaltmiete,
    jahreskosten,
    jahreszinsen,
    jahresNettoEinkommen,
    kaufpreisFaktor,
    tilgungsplan,
    cashflowEntwicklung,
  };
};

export const getYieldRating = (value: number): YieldRating => {
  if (value > 6) return 'excellent';
  if (value >= 4) return 'good';
  if (value >= 3) return 'ok';
  if (value >= 2) return 'weak';
  return 'bad';
};

export const getYieldLabel = (rating: YieldRating): string => {
  const labels: Record<YieldRating, string> = {
    excellent: 'Hervorragend',
    good: 'Gut',
    ok: 'OK',
    weak: 'Schwach',
    bad: 'Schlecht',
  };
  return labels[rating];
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const useCalculator = (inputs: CalculatorInputs) => {
  const results = useMemo(() => calculateResults(inputs), [inputs]);
  return results;
};
