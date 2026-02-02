import { Moon, Sun, LogIn, LogOut, Calculator, FolderOpen, CreditCard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createPortalSession } from '@/lib/stripe';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  onLoginClick: () => void;
}

export const Header = ({ onLoginClick }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { subscription, plan } = useSubscription();
  const { toast } = useToast();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const handleManageSubscription = async () => {
    const result = await createPortalSession(window.location.href);
    if ('error' in result) {
      toast({
        title: 'Fehler',
        description: result.error,
        variant: 'destructive'
      });
      return;
    }
    window.location.href = result.url;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold gradient-text">Fintutto</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Calculator className="h-4 w-4" />
            Rechner
          </Link>
          {user && (
            <Link
              to="/berechnungen"
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/berechnungen' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              Meine Berechnungen
            </Link>
          )}
          <Link
            to="/pricing"
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === '/pricing' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Preise
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline max-w-32 truncate">
                    {user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  Plan: {plan === 'business' ? 'Business' : plan === 'pro' ? 'Pro' : 'Free'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {subscription?.stripe_subscription_id && (
                  <DropdownMenuItem onClick={handleManageSubscription}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Abo verwalten
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/pricing">
                    <CreditCard className="h-4 w-4 mr-2" />
                    {plan === 'free' ? 'Upgrade' : 'Pläne ansehen'}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onLoginClick} size="sm">
              <LogIn className="h-4 w-4 mr-2" />
              Anmelden
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
