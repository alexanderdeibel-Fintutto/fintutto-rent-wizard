import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { AuthModal } from '@/components/AuthModal';
import { CalculatorInputsSection } from '@/components/calculator/CalculatorInputs';
import { ResultsCards } from '@/components/calculator/ResultsCards';
import { ResultsCharts } from '@/components/calculator/ResultsCharts';
import { ResultsTables } from '@/components/calculator/ResultsTables';
import { SaveModal } from '@/components/calculator/SaveModal';
import { CrossSellBanner } from '@/components/CrossSellBanner';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw } from 'lucide-react';
import { useCalculator, getDefaultInputs } from '@/hooks/useCalculator';
import type { CalculatorInputs } from '@/types/calculator';

const Index = () => {
  // Check for loaded calculation from sessionStorage
  const getInitialInputs = (): CalculatorInputs => {
    const loaded = sessionStorage.getItem('loadedCalculation');
    if (loaded) {
      sessionStorage.removeItem('loadedCalculation');
      try {
        return JSON.parse(loaded);
      } catch {
        return getDefaultInputs();
      }
    }
    return getDefaultInputs();
  };
  const [inputs, setInputs] = useState<CalculatorInputs>(getInitialInputs());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const results = useCalculator(inputs);

  const handleReset = () => {
    setInputs(getDefaultInputs());
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={() => setShowAuthModal(true)} />

      {/* Hero Section */}
      <div className="gradient-primary text-white py-8 px-4">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Rendite-Rechner</h1>
          <p className="text-white/80 text-lg">
            Berechne die Rendite deiner Immobilien-Investition – live und kostenlos
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-6">
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-4">
            <CalculatorInputsSection inputs={inputs} onChange={setInputs} />
            
            <div className="flex gap-2">
              <Button onClick={() => setShowSaveModal(true)} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Berechnung speichern
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Zurücksetzen
              </Button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div>
              <h2 className="text-xl font-semibold mb-4">Ergebnisse</h2>
              <ResultsCards results={results} />
            </div>
            
            <ResultsCharts results={results} />
            
            <ResultsTables results={results} />
            
            {/* Cross-Sell Banner */}
            <CrossSellBanner />
          </div>
        </div>
      </main>

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Monatlicher Cashflow</div>
            <div className={`font-mono text-xl font-bold ${results.monatlicheCashflow >= 0 ? 'text-success' : 'text-destructive'}`}>
              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(results.monatlicheCashflow)}
            </div>
          </div>
          <Button onClick={() => setShowSaveModal(true)} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Speichern
          </Button>
        </div>
      </div>

      {/* Add padding for mobile sticky footer */}
      <div className="lg:hidden h-20" />

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        inputs={inputs}
        results={results}
        onLoginRequired={() => {
          setShowSaveModal(false);
          setShowAuthModal(true);
        }}
      />
    </div>
  );
};

export default Index;
