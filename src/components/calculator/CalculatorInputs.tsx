import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Home, Wallet, CreditCard, PiggyBank } from 'lucide-react';
import type { CalculatorInputs } from '@/types/calculator';
import { BUNDESLAENDER } from '@/types/calculator';
import { AddressAutocomplete } from './AddressAutocomplete';
import type { AddressComponents } from '@/hooks/useGoogleMapsAutocomplete';

interface CalculatorInputsProps {
  inputs: CalculatorInputs;
  onChange: (inputs: CalculatorInputs) => void;
}

export const CalculatorInputsSection = ({ inputs, onChange }: CalculatorInputsProps) => {
  const handleChange = (field: keyof CalculatorInputs, value: number | string | boolean | null) => {
    const newInputs = { ...inputs, [field]: value };
    
    // Auto-update Grunderwerbsteuer bei Bundesland-Wechsel
    if (field === 'bundesland' && typeof value === 'string') {
      newInputs.grunderwerbsteuer = BUNDESLAENDER[value] || 5.0;
    }
    
    onChange(newInputs);
  };

  const handleNumberChange = (field: keyof CalculatorInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    handleChange(field, numValue);
  };

  const handleAddressSelect = (address: AddressComponents) => {
    // Map German state names to the bundesland selector
    const stateMapping: Record<string, string> = {
      'Baden-Württemberg': 'Baden-Württemberg',
      'Bayern': 'Bayern',
      'Berlin': 'Berlin',
      'Brandenburg': 'Brandenburg',
      'Bremen': 'Bremen',
      'Hamburg': 'Hamburg',
      'Hessen': 'Hessen',
      'Mecklenburg-Vorpommern': 'Mecklenburg-Vorpommern',
      'Niedersachsen': 'Niedersachsen',
      'Nordrhein-Westfalen': 'Nordrhein-Westfalen',
      'Rheinland-Pfalz': 'Rheinland-Pfalz',
      'Saarland': 'Saarland',
      'Sachsen': 'Sachsen',
      'Sachsen-Anhalt': 'Sachsen-Anhalt',
      'Schleswig-Holstein': 'Schleswig-Holstein',
      'Thüringen': 'Thüringen',
    };

    const bundesland = stateMapping[address.state] || inputs.bundesland;
    
    onChange({
      ...inputs,
      adresse: address.formattedAddress,
      adresseVerifiziert: true,
      placeId: address.placeId,
      latitude: address.latitude,
      longitude: address.longitude,
      bundesland,
      grunderwerbsteuer: BUNDESLAENDER[bundesland] || inputs.grunderwerbsteuer,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Eingaben</h2>
      
      <Accordion type="multiple" defaultValue={['kaufdaten', 'mieteinnahmen', 'kosten', 'finanzierung']} className="space-y-2">
        {/* Sektion 1: Kaufdaten */}
        <AccordionItem value="kaufdaten" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <span className="font-medium">Kaufdaten</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            {/* Google Maps Adress-Autocomplete */}
            <AddressAutocomplete
              value={inputs.adresse}
              onAddressSelect={handleAddressSelect}
              onInputChange={(value) => {
                // Reset verification if user types manually
                if (inputs.adresseVerifiziert && value !== inputs.adresse) {
                  onChange({
                    ...inputs,
                    adresse: value,
                    adresseVerifiziert: false,
                    placeId: '',
                    latitude: null,
                    longitude: null,
                  });
                } else {
                  handleChange('adresse', value);
                }
              }}
              isVerified={inputs.adresseVerifiziert}
              verifiedAddress={inputs.adresseVerifiziert ? inputs.adresse : undefined}
            />

            <div className="space-y-2">
              <Label htmlFor="kaufpreis">Kaufpreis (€)</Label>
              <Input
                id="kaufpreis"
                type="number"
                value={inputs.kaufpreis || ''}
                onChange={(e) => handleNumberChange('kaufpreis', e.target.value)}
                placeholder="250.000"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bundesland">Bundesland</Label>
              <Select value={inputs.bundesland} onValueChange={(v) => handleChange('bundesland', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Bundesland wählen" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(BUNDESLAENDER).map((land) => (
                    <SelectItem key={land} value={land}>
                      {land} ({BUNDESLAENDER[land]}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grunderwerbsteuer">Grunderwerbsteuer (%)</Label>
                <Input
                  id="grunderwerbsteuer"
                  type="number"
                  step="0.1"
                  value={inputs.grunderwerbsteuer || ''}
                  onChange={(e) => handleNumberChange('grunderwerbsteuer', e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notarkosten">Notarkosten (%)</Label>
                <Input
                  id="notarkosten"
                  type="number"
                  step="0.1"
                  value={inputs.notarkosten || ''}
                  onChange={(e) => handleNumberChange('notarkosten', e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maklergebuehr">Maklergebühr (%)</Label>
                <Input
                  id="maklergebuehr"
                  type="number"
                  step="0.01"
                  value={inputs.maklergebuehr || ''}
                  onChange={(e) => handleNumberChange('maklergebuehr', e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grundbuchkosten">Grundbuchkosten (%)</Label>
                <Input
                  id="grundbuchkosten"
                  type="number"
                  step="0.1"
                  value={inputs.grundbuchkosten || ''}
                  onChange={(e) => handleNumberChange('grundbuchkosten', e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Sektion 2: Mieteinnahmen */}
        <AccordionItem value="mieteinnahmen" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="font-medium">Mieteinnahmen</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="kaltmiete">Monatliche Kaltmiete (€)</Label>
              <Input
                id="kaltmiete"
                type="number"
                value={inputs.kaltmiete || ''}
                onChange={(e) => handleNumberChange('kaltmiete', e.target.value)}
                placeholder="800"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nebenkostenVorauszahlung">Nebenkosten-Vorauszahlung (€)</Label>
              <Input
                id="nebenkostenVorauszahlung"
                type="number"
                value={inputs.nebenkostenVorauszahlung || ''}
                onChange={(e) => handleNumberChange('nebenkostenVorauszahlung', e.target.value)}
                placeholder="150"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mietausfallwagnis">Mietausfallwagnis (%)</Label>
              <Input
                id="mietausfallwagnis"
                type="number"
                step="0.1"
                value={inputs.mietausfallwagnis || ''}
                onChange={(e) => handleNumberChange('mietausfallwagnis', e.target.value)}
                placeholder="2"
                className="font-mono"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Sektion 3: Laufende Kosten */}
        <AccordionItem value="kosten" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="font-medium">Laufende Kosten</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="verwaltungskosten">Verwaltungskosten (€/Monat)</Label>
              <Input
                id="verwaltungskosten"
                type="number"
                value={inputs.verwaltungskosten || ''}
                onChange={(e) => handleNumberChange('verwaltungskosten', e.target.value)}
                placeholder="25"
                className="font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instandhaltungsruecklage">Instandhaltung (€/m²/Jahr)</Label>
                <Input
                  id="instandhaltungsruecklage"
                  type="number"
                  step="0.5"
                  value={inputs.instandhaltungsruecklage || ''}
                  onChange={(e) => handleNumberChange('instandhaltungsruecklage', e.target.value)}
                  placeholder="10"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wohnflaeche">Wohnfläche (m²)</Label>
                <Input
                  id="wohnflaeche"
                  type="number"
                  value={inputs.wohnflaeche || ''}
                  onChange={(e) => handleNumberChange('wohnflaeche', e.target.value)}
                  placeholder="60"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nichtUmlagefaehigeNebenkosten">Nicht umlagefähige NK (€/Jahr)</Label>
              <Input
                id="nichtUmlagefaehigeNebenkosten"
                type="number"
                value={inputs.nichtUmlagefaehigeNebenkosten || ''}
                onChange={(e) => handleNumberChange('nichtUmlagefaehigeNebenkosten', e.target.value)}
                placeholder="300"
                className="font-mono"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Sektion 4: Finanzierung */}
        <AccordionItem value="finanzierung" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-primary" />
              <span className="font-medium">Finanzierung</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="eigenkapital">Eigenkapital (€)</Label>
              <Input
                id="eigenkapital"
                type="number"
                value={inputs.eigenkapital || ''}
                onChange={(e) => handleNumberChange('eigenkapital', e.target.value)}
                placeholder="50.000"
                className="font-mono"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoBerechnung">Darlehenssumme automatisch berechnen</Label>
              <Switch
                id="autoBerechnung"
                checked={inputs.autoBerechnung}
                onCheckedChange={(v) => handleChange('autoBerechnung', v)}
              />
            </div>

            {!inputs.autoBerechnung && (
              <div className="space-y-2">
                <Label htmlFor="darlehenssumme">Darlehenssumme (€)</Label>
                <Input
                  id="darlehenssumme"
                  type="number"
                  value={inputs.darlehenssumme || ''}
                  onChange={(e) => handleNumberChange('darlehenssumme', e.target.value)}
                  placeholder="200.000"
                  className="font-mono"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zinssatz">Zinssatz (% p.a.)</Label>
                <Input
                  id="zinssatz"
                  type="number"
                  step="0.1"
                  value={inputs.zinssatz || ''}
                  onChange={(e) => handleNumberChange('zinssatz', e.target.value)}
                  placeholder="3.5"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tilgungssatz">Tilgungssatz (% p.a.)</Label>
                <Input
                  id="tilgungssatz"
                  type="number"
                  step="0.1"
                  value={inputs.tilgungssatz || ''}
                  onChange={(e) => handleNumberChange('tilgungssatz', e.target.value)}
                  placeholder="2"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zinsbindung">Zinsbindung (Jahre)</Label>
              <Input
                id="zinsbindung"
                type="number"
                value={inputs.zinsbindung || ''}
                onChange={(e) => handleNumberChange('zinsbindung', e.target.value)}
                placeholder="10"
                className="font-mono"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
