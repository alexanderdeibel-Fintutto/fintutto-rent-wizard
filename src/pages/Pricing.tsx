import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BillingToggle } from '@/components/pricing/BillingToggle';
import { PricingCard } from '@/components/pricing/PricingCard';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { PRICING_PLANS, PricingPlan } from '@/types/subscription';
import { createCheckoutSession, createPortalSession } from '@/lib/stripe';
import { useToast } from '@/hooks/use-toast';
import { AuthModal } from '@/components/AuthModal';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan: currentPlan, subscription } = useSubscription();
  const { toast } = useToast();
  
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSelectPlan = async (plan: PricingPlan) => {
    // Not logged in -> show auth modal
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Free plan -> no action needed
    if (plan.id === 'free') {
      toast({
        title: 'Free Plan',
        description: 'Du nutzt bereits den kostenlosen Plan.'
      });
      return;
    }

    // Current plan -> no action
    if (plan.id === currentPlan) {
      return;
    }

    // Has existing subscription -> open portal for changes
    if (subscription?.stripe_subscription_id) {
      setLoading(plan.id);
      const result = await createPortalSession(window.location.href);
      setLoading(null);
      
      if ('error' in result) {
        toast({
          title: 'Fehler',
          description: result.error,
          variant: 'destructive'
        });
        return;
      }
      
      window.location.href = result.url;
      return;
    }

    // New subscription -> create checkout session
    setLoading(plan.id);
    const priceId = isYearly ? plan.priceIdYearly : plan.priceIdMonthly;
    
    const result = await createCheckoutSession(
      priceId,
      user.id,
      user.email || '',
      `${window.location.origin}/success`,
      `${window.location.origin}/pricing`
    );
    
    setLoading(null);

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
    <div className="min-h-screen flex flex-col bg-background">
      <Header onLoginClick={() => setShowAuthModal(true)} />
      
      <main className="flex-1 container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Wählen Sie Ihren <span className="gradient-text">Plan</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Starten Sie kostenlos und upgraden Sie, wenn Sie mehr Funktionen benötigen.
            Alle Pläne können jederzeit gekündigt werden.
          </p>
          
          <BillingToggle isYearly={isYearly} onToggle={setIsYearly} />
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isYearly={isYearly}
              currentPlan={currentPlan}
              isLoggedIn={!!user}
              onSelect={handleSelectPlan}
              loading={loading === plan.id}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Alle Preise verstehen sich inklusive MwSt. • Sichere Zahlung via Stripe
          </p>
        </div>
      </main>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default Pricing;
