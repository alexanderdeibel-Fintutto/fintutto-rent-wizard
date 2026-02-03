import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Percent, Calculator, Clock, PiggyBank } from 'lucide-react';
import type { CalculatorResults, YieldRating } from '@/types/calculator';
import { getYieldRating, getYieldLabel, formatCurrency, formatNumber } from '@/hooks/useCalculator';

interface ResultsCardsProps {
  results: CalculatorResults;
}

const getYieldColorClass = (rating: YieldRating): string => {
  const classes: Record<YieldRating, string> = {
    excellent: 'bg-yield-excellent text-white',
    good: 'bg-yield-good text-white',
    ok: 'bg-yield-ok text-black',
    weak: 'bg-yield-weak text-black',
    bad: 'bg-yield-bad text-white',
  };
  return classes[rating];
};

export const ResultsCards = ({ results }: ResultsCardsProps) => {
  const bruttoRating = getYieldRating(results.bruttoMietrendite);
  const nettoRating = getYieldRating(results.nettoMietrendite);
  const ekRating = getYieldRating(results.eigenkapitalRendite);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Brutto-Mietrendite */}
      <Card className={`${getYieldColorClass(bruttoRating)} border-0`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-4 w-4" />
            <span className="text-xs font-medium">Brutto-Rendite</span>
          </div>
          <div className="font-mono text-2xl font-bold">
            {formatNumber(results.bruttoMietrendite)}%
          </div>
          <div className="text-xs mt-1">{getYieldLabel(bruttoRating)}</div>
        </CardContent>
      </Card>

      {/* Netto-Mietrendite */}
      <Card className={`${getYieldColorClass(nettoRating)} border-0`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-4 w-4" />
            <span className="text-xs font-medium">Netto-Rendite</span>
          </div>
          <div className="font-mono text-2xl font-bold">
            {formatNumber(results.nettoMietrendite)}%
          </div>
          <div className="text-xs mt-1">{getYieldLabel(nettoRating)}</div>
        </CardContent>
      </Card>

      {/* Eigenkapital-Rendite */}
      <Card className={`${getYieldColorClass(ekRating)} border-0`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">EK-Rendite</span>
          </div>
          <div className="font-mono text-2xl font-bold">
            {formatNumber(results.eigenkapitalRendite)}%
          </div>
          <div className="text-xs mt-1">{getYieldLabel(ekRating)}</div>
        </CardContent>
      </Card>

      {/* Monatlicher Cashflow */}
      <Card className={`${results.monatlicheCashflow >= 0 ? 'bg-success' : 'bg-destructive'} text-white border-0`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {results.monatlicheCashflow >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="text-xs font-medium">Cashflow/Monat</span>
          </div>
          <div className="font-mono text-2xl font-bold">
            {formatCurrency(results.monatlicheCashflow)}
          </div>
          <div className="text-xs mt-1">
            {results.monatlicheCashflow >= 0 ? 'Positiv' : 'Negativ'}
          </div>
        </CardContent>
      </Card>

      {/* Kaufpreis-Faktor */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Kaufpreis-Faktor</span>
          </div>
          <div className="font-mono text-2xl font-bold text-foreground">
            {formatNumber(results.kaufpreisFaktor, 1)}x
          </div>
          <div className="text-xs mt-1 text-muted-foreground">Jahre bis Amortisation</div>
        </CardContent>
      </Card>

      {/* Gesamtinvestition */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <PiggyBank className="h-4 w-4" />
            <span className="text-xs font-medium">Gesamtinvestition</span>
          </div>
          <div className="font-mono text-2xl font-bold text-foreground">
            {formatCurrency(results.gesamtinvestition)}
          </div>
          <div className="text-xs mt-1 text-muted-foreground">
            inkl. {formatCurrency(results.kaufnebenkostenGesamt)} Nebenkosten
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
