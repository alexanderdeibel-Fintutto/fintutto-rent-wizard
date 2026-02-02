import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { CalculatorInputs, CalculatorResults } from '@/types/calculator';
import { useToast } from '@/hooks/use-toast';
import { getGenericErrorMessage, validateCalculationName, CALCULATION_NAME_MAX_LENGTH } from '@/lib/errorHandler';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: CalculatorInputs;
  results: CalculatorResults;
  onLoginRequired: () => void;
}

export const SaveModal = ({ isOpen, onClose, inputs, results, onLoginRequired }: SaveModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) {
      onLoginRequired();
      return;
    }

    // Validate calculation name
    const validation = validateCalculationName(name);
    if (!validation.isValid) {
      toast({
        title: 'Fehler',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    if (!supabase) {
      toast({
        title: 'Fehler',
        description: 'Backend ist nicht konfiguriert.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const sanitizedName = name.trim().slice(0, CALCULATION_NAME_MAX_LENGTH);
      
      const { error } = await supabase.from('calculations').insert({
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
            <p className="text-xs text-muted-foreground">
              {name.length}/{CALCULATION_NAME_MAX_LENGTH} Zeichen
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
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
