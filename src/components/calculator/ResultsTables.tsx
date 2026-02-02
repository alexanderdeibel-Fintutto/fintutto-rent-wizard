import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { CalculatorResults } from '@/types/calculator';
import { formatCurrency } from '@/hooks/useCalculator';

interface ResultsTablesProps {
  results: CalculatorResults;
}

export const ResultsTables = ({ results }: ResultsTablesProps) => {
  const [openKaufnebenkosten, setOpenKaufnebenkosten] = useState(false);
  const [openEinnahmenAusgaben, setOpenEinnahmenAusgaben] = useState(false);
  const [openTilgungsplan, setOpenTilgungsplan] = useState(false);

  return (
    <div className="space-y-3">
      {/* Kaufnebenkosten */}
      <Collapsible open={openKaufnebenkosten} onOpenChange={setOpenKaufnebenkosten}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
          <span className="font-medium">Kaufnebenkosten-Aufstellung</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openKaufnebenkosten ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Grunderwerbsteuer</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(results.grunderwerbsteuerBetrag)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Notarkosten</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(results.notarkostenBetrag)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Maklergebühr</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(results.maklergebuehrBetrag)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Grundbuchkosten</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(results.grundbuchkostenBetrag)}</TableCell>
              </TableRow>
              <TableRow className="font-bold">
                <TableCell>Gesamt Nebenkosten</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(results.kaufnebenkostenGesamt)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CollapsibleContent>
      </Collapsible>

      {/* Jährliche Einnahmen/Ausgaben */}
      <Collapsible open={openEinnahmenAusgaben} onOpenChange={setOpenEinnahmenAusgaben}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
          <span className="font-medium">Jährliche Einnahmen/Ausgaben</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openEinnahmenAusgaben ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <Table>
            <TableBody>
              <TableRow className="text-success">
                <TableCell>Jahreskaltmiete</TableCell>
                <TableCell className="text-right font-mono">+{formatCurrency(results.jahreskaltmiete)}</TableCell>
              </TableRow>
              <TableRow className="text-destructive">
                <TableCell>Mietausfallwagnis</TableCell>
                <TableCell className="text-right font-mono">-{formatCurrency(results.monatlichMietausfall * 12)}</TableCell>
              </TableRow>
              <TableRow className="text-destructive">
                <TableCell>Verwaltungskosten</TableCell>
                <TableCell className="text-right font-mono">-{formatCurrency(results.monatlicheVerwaltung * 12)}</TableCell>
              </TableRow>
              <TableRow className="text-destructive">
                <TableCell>Instandhaltungsrücklage</TableCell>
                <TableCell className="text-right font-mono">-{formatCurrency(results.monatlicheInstandhaltung * 12)}</TableCell>
              </TableRow>
              <TableRow className="text-destructive">
                <TableCell>Nicht umlagef. Nebenkosten</TableCell>
                <TableCell className="text-right font-mono">-{formatCurrency(results.monatlichNichtUmlagefaehig * 12)}</TableCell>
              </TableRow>
              <TableRow className="text-destructive">
                <TableCell>Zinsen (Jahr 1)</TableCell>
                <TableCell className="text-right font-mono">-{formatCurrency(results.jahreszinsen)}</TableCell>
              </TableRow>
              <TableRow className="font-bold border-t">
                <TableCell>Jahres-Netto</TableCell>
                <TableCell className={`text-right font-mono ${results.jahresNettoEinkommen >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(results.jahresNettoEinkommen)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CollapsibleContent>
      </Collapsible>

      {/* Tilgungsplan */}
      <Collapsible open={openTilgungsplan} onOpenChange={setOpenTilgungsplan}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
          <span className="font-medium">Tilgungsplan (5 Jahre)</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openTilgungsplan ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jahr</TableHead>
                  <TableHead className="text-right">Anfangsschuld</TableHead>
                  <TableHead className="text-right">Zinsen</TableHead>
                  <TableHead className="text-right">Tilgung</TableHead>
                  <TableHead className="text-right">Restschuld</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.tilgungsplan.slice(0, 5).map((jahr) => (
                  <TableRow key={jahr.jahr}>
                    <TableCell className="font-medium">{jahr.jahr}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(jahr.anfangsschuld)}</TableCell>
                    <TableCell className="text-right font-mono text-destructive">{formatCurrency(jahr.zinsen)}</TableCell>
                    <TableCell className="text-right font-mono text-success">{formatCurrency(jahr.tilgung)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(jahr.restschuld)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
