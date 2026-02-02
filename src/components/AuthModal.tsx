import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getGenericErrorMessage } from '@/lib/errorHandler';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { signIn, signUp, resetPassword, isConfigured } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose();
      } else if (mode === 'register') {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setSuccess('Registrierung erfolgreich! Bitte bestätige deine E-Mail-Adresse.');
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setSuccess('E-Mail zum Zurücksetzen des Passworts wurde gesendet.');
      }
    } catch (err: unknown) {
      setError(getGenericErrorMessage(err, 'auth'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setSuccess(null);
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  if (!isConfigured) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supabase nicht konfiguriert</DialogTitle>
            <DialogDescription>
              Um die Authentifizierung zu nutzen, muss Supabase in den Projekt-Einstellungen konfiguriert werden.
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Gehe zu Settings → Supabase und verbinde dein Supabase-Projekt.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' && 'Anmelden'}
            {mode === 'register' && 'Registrieren'}
            {mode === 'forgot' && 'Passwort vergessen'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login' && 'Melde dich an, um deine Berechnungen zu speichern.'}
            {mode === 'register' && 'Erstelle ein Konto, um deine Berechnungen zu speichern.'}
            {mode === 'forgot' && 'Gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@beispiel.de"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'login' && 'Anmelden'}
            {mode === 'register' && 'Registrieren'}
            {mode === 'forgot' && 'Link senden'}
          </Button>

          <div className="flex flex-col gap-2 text-sm text-center">
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-primary hover:underline"
                >
                  Passwort vergessen?
                </button>
                <span className="text-muted-foreground">
                  Noch kein Konto?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-primary hover:underline"
                  >
                    Registrieren
                  </button>
                </span>
              </>
            )}
            {mode === 'register' && (
              <span className="text-muted-foreground">
                Bereits ein Konto?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-primary hover:underline"
                >
                  Anmelden
                </button>
              </span>
            )}
            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-primary hover:underline"
              >
                Zurück zur Anmeldung
              </button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
