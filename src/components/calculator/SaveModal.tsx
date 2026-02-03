import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import type { CalculatorInputs, CalculatorResults } from '@/types/calculator';
import { useToast } from '@/hooks/use-toast';
import { getGenericErrorMessage, validateCalculationName, CALCULATION_NAME_MAX_LENGTH } from '@/lib/errorHandler';
import { canSaveMoreCalculations, getRemainingCalculations, PLAN_LIMITS } from '@/lib/subscriptionLimits';
import { useNavigate } from 'react-router-dom';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: CalculatorInputs;
  results: CalculatorResults;
  onLoginRequired: () => void;
}

export const SaveModal = ({ isOpen, onClose, inputs, results, onLoginRequired }: SaveModalProps) => {
  const { user } = useAuth();
  const { plan, loading: subLoading } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculationCount, setCalculationCount] = useState(0);
  const [countLoading, setCountLoading] = useState(true);

  // Fetch calculation count when modal opens
  useEffect(() => {
    const fetchCount = async () => {
      if (!user || !isOpen) {
        setCountLoading(false);
        return;
      }

      try {
        const { count, error } = await supabase
          .from('calculations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (error) throw error;
        setCalculationCount(count || 0);
      } catch (error) {
        console.error('Error fetching calculation count:', error);
      } finally {
        setCountLoading(false);
      }
    };

    if (isOpen) {
      setCountLoading(true);
      fetchCount();
    }
  }, [user, isOpen]);

  const canSave = canSaveMoreCalculations(plan, calculationCount);
  const remaining = getRemainingCalculations(plan, calculationCount);
  const maxCalcs = PLAN_LIMITS[plan]?.maxCalculations || 3;

  const handleSave = async () => {
    if (!user) {
      onLoginRequired();
      return;
    }

    if (!canSave) {
      toast({
        title: 'Limit erreicht',
        description: 'Upgrade auf Pro für unbegrenzte Berechnungen.',
        variant: 'destructive',
      });
      return;
    }

    const validation = validateCalculationName(name);
    if (!validation.isValid) {
      toast({
        title: 'Fehler',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const sanitizedName = name.trim().slice(0, CALCULATION_NAME_MAX_LENGTH);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('calculations') as any).insert({
        user_id: user.id,
        name: sanitizedName,
        input_data: inputs,
        results: results,
      });

      if (error) throw error;

      toast({
        title: 'Gespeichert!',
        description: `"${sanitizedName}" wurde erfolgreich gespeichert.`,
      });
      setName('');
      setCalculationCount(prev => prev + 1);
      onClose();
    } catch (error: unknown) {
      toast({
        title: 'Fehler beim Speichern',
        description: getGenericErrorMessage(error, 'save'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anmeldung erforderlich</DialogTitle>
            <DialogDescription>
              Um Berechnungen zu speichern, musst du angemeldet sein.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button onClick={onLoginRequired}>
              Jetzt anmelden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Show upgrade prompt when limit reached
  if (!countLoading && !subLoading && !canSave) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center">Speicherlimit erreicht</DialogTitle>
            <DialogDescription className="text-center">
              Du hast bereits {calculationCount} von {maxCalcs} Berechnungen gespeichert.
              Upgrade auf Pro für unbegrenzte Berechnungen.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="font-medium text-sm">Pro-Plan Vorteile:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Unbegrenzte Berechnungen</li>
                <li>✓ Excel-Export</li>
                <li>✓ Erweiterte Charts</li>
                <li>✓ Prioritäts-Support</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Später
            </Button>
            <Button 
              onClick={() => { onClose(); navigate('/pricing'); }} 
              className="w-full sm:w-auto gradient-primary"
            >
              <Crown className="mr-2 h-4 w-4" />
              Jetzt upgraden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Berechnung speichern</DialogTitle>
          <DialogDescription>
            Gib einen Namen für diese Berechnung ein, z.B. "3-Zimmer Berlin Mitte".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="calculation-name">Name der Berechnung</Label>
            <Input
              id="calculation-name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, CALCULATION_NAME_MAX_LENGTH))}
              placeholder="z.B. 3-Zimmer Berlin Mitte"
              maxLength={CALCULATION_NAME_MAX_LENGTH}
              autoFocus
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{name.length}/{CALCULATION_NAME_MAX_LENGTH} Zeichen</span>
              {plan === 'free' && remaining !== Infinity && (
                <span>Noch {remaining} Speicherplätze frei</span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={loading || countLoading || subLoading}>
            {loading || countLoading || subLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
