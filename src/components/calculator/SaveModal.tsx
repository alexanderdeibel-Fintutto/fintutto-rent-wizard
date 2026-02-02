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

    if (!name.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte gib einen Namen für die Berechnung ein.',
        variant: 'destructive',
      });
      return;
    }

    if (!supabase) {
      toast({
        title: 'Fehler',
        description: 'Supabase ist nicht konfiguriert.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('calculations').insert({
        user_id: user.id,
        name: name.trim(),
        input_data: inputs,
        results: results,
      });

      if (error) throw error;

      toast({
        title: 'Gespeichert!',
        description: `"${name}" wurde erfolgreich gespeichert.`,
      });
      setName('');
      onClose();
    } catch (error: any) {
      toast({
        title: 'Fehler beim Speichern',
        description: error.message || 'Ein unbekannter Fehler ist aufgetreten.',
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
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. 3-Zimmer Berlin Mitte"
              autoFocus
            />
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
