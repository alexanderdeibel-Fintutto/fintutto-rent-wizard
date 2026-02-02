import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { AuthModal } from '@/components/AuthModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2, Trash2, Copy, ArrowRight, FolderOpen } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/hooks/useCalculator';
import type { SavedCalculation } from '@/types/calculator';
import { useToast } from '@/hooks/use-toast';
import { getGenericErrorMessage, CALCULATION_NAME_MAX_LENGTH } from '@/lib/errorHandler';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Berechnungen = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchCalculations = async () => {
      if (!user || !supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('calculations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCalculations(data || []);
      } catch (error: unknown) {
        toast({
          title: 'Fehler',
          description: getGenericErrorMessage(error, 'load'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCalculations();
    }
  }, [user, toast]);

  const handleLoad = (calculation: SavedCalculation) => {
    // Store in sessionStorage and navigate
    sessionStorage.setItem('loadedCalculation', JSON.stringify(calculation.input_data));
    navigate('/');
    toast({
      title: 'Geladen',
      description: `"${calculation.name}" wurde geladen.`,
    });
  };

  const handleDuplicate = async (calculation: SavedCalculation) => {
    if (!user || !supabase) return;

    try {
      const { error } = await supabase.from('calculations').insert({
        user_id: user.id,
        name: `${calculation.name} (Kopie)`,
        input_data: calculation.input_data,
        results: calculation.results,
      });

      if (error) throw error;

      // Refresh list
      const { data } = await supabase
        .from('calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setCalculations(data || []);
      toast({
        title: 'Dupliziert',
        description: `"${calculation.name}" wurde kopiert.`,
      });
    } catch (error: unknown) {
      toast({
        title: 'Fehler',
        description: getGenericErrorMessage(error, 'duplicate'),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !supabase) return;

    try {
      const { error } = await supabase
        .from('calculations')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      setCalculations(calculations.filter((c) => c.id !== deleteId));
      toast({
        title: 'Gelöscht',
        description: 'Berechnung wurde gelöscht.',
      });
    } catch (error: unknown) {
      toast({
        title: 'Fehler',
        description: getGenericErrorMessage(error, 'delete'),
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onLoginClick={() => setShowAuthModal(true)} />
        <div className="container py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={() => setShowAuthModal(true)} />

      <main className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Meine Berechnungen</h1>
          <p className="text-muted-foreground">
            Alle deine gespeicherten Immobilien-Berechnungen
          </p>
        </div>

        {calculations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Noch keine Berechnungen</h3>
              <p className="text-muted-foreground mb-4">
                Du hast noch keine Berechnungen gespeichert.
              </p>
              <Button onClick={() => navigate('/')}>
                Neue Berechnung starten
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {calculations.map((calculation) => (
              <Card key={calculation.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1" title={calculation.name}>
                    {calculation.name.slice(0, CALCULATION_NAME_MAX_LENGTH)}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(calculation.created_at)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Kaufpreis</span>
                      <span className="font-mono font-medium">
                        {formatCurrency(calculation.input_data.kaufpreis)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Brutto-Rendite</span>
                      <span className="font-mono font-medium">
                        {formatNumber(calculation.results.bruttoMietrendite)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cashflow/Monat</span>
                      <span className={`font-mono font-medium ${
                        calculation.results.monatlicheCashflow >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {formatCurrency(calculation.results.monatlicheCashflow)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleLoad(calculation)}
                    >
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Laden
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(calculation)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(calculation.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Berechnung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Berechnungen;
