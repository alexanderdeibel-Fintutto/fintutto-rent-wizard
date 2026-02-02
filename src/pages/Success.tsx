import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { useSubscription } from '@/hooks/useSubscription';

const Success = () => {
  const navigate = useNavigate();
  const { plan, refetch } = useSubscription();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Refetch subscription to get updated plan
    refetch();
    
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [refetch]);

  const planName = plan === 'business' ? 'Business' : plan === 'pro' ? 'Pro' : 'Free';

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Header onLoginClick={() => {}} />
      
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles 
                className="h-4 w-4" 
                style={{ 
                  color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][Math.floor(Math.random() * 5)]
                }} 
              />
            </div>
          ))}
        </div>
      )}

      <main className="flex-1 container flex items-center justify-center py-12">
        <Card className="max-w-md w-full text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              Willkommen bei <span className="gradient-text">{planName}</span>!
            </CardTitle>
            <CardDescription className="text-base">
              Ihre Zahlung war erfolgreich. Vielen Dank für Ihr Vertrauen!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Sie haben jetzt Zugriff auf alle {planName}-Funktionen. 
              Entdecken Sie die erweiterten Möglichkeiten für Ihre Immobilien-Analysen.
            </p>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => navigate('/')}
                className="w-full gradient-primary"
              >
                Zum Rechner
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/berechnungen')}
                className="w-full"
              >
                Meine Berechnungen
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
};

export default Success;
