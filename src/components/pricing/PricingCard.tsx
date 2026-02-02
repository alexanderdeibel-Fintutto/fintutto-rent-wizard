import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PricingPlan, PlanId } from '@/types/subscription';
import { formatPrice } from '@/lib/stripe';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  plan: PricingPlan;
  isYearly: boolean;
  currentPlan: PlanId;
  isLoggedIn: boolean;
  onSelect: (plan: PricingPlan) => void;
  loading?: boolean;
}

export const PricingCard = ({
  plan,
  isYearly,
  currentPlan,
  isLoggedIn,
  onSelect,
  loading = false
}: PricingCardProps) => {
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  const monthlyEquivalent = isYearly ? plan.yearlyPrice / 12 : plan.monthlyPrice;
  const isCurrentPlan = currentPlan === plan.id;
  const isFree = plan.id === 'free';
  
  const planOrder: Record<PlanId, number> = { free: 0, pro: 1, business: 2 };
  const isDowngrade = planOrder[plan.id] < planOrder[currentPlan];
  const isUpgrade = planOrder[plan.id] > planOrder[currentPlan];

  const getButtonText = () => {
    if (!isLoggedIn) return 'Registrieren';
    if (isCurrentPlan) return 'Aktueller Plan';
    if (isFree) return 'Kostenlos nutzen';
    if (isDowngrade) return 'Downgrade';
    return 'Jetzt upgraden';
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) return 'outline' as const;
    if (plan.highlighted) return 'default' as const;
    return 'outline' as const;
  };

  return (
    <Card className={cn(
      'relative flex flex-col transition-all duration-200',
      plan.highlighted && 'border-primary shadow-lg scale-105',
      isCurrentPlan && 'border-primary/50'
    )}>
      {plan.highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary">
          Beliebteste Wahl
        </Badge>
      )}
      
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-6">
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">
              {formatPrice(monthlyEquivalent)}
            </span>
            {!isFree && <span className="text-muted-foreground">/Monat</span>}
          </div>
          
          {isYearly && !isFree && (
            <div className="mt-1 space-y-1">
              <p className="text-sm text-muted-foreground">
                <span className="line-through">{formatPrice(plan.monthlyPrice * 12)}</span>
                {' '}
                <span className="text-primary font-medium">{formatPrice(price)}/Jahr</span>
              </p>
              <Badge variant="secondary" className="text-xs">
                Spare {formatPrice(plan.monthlyPrice * 12 - price)}
              </Badge>
            </div>
          )}
        </div>

        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className={cn(
            'w-full',
            plan.highlighted && !isCurrentPlan && 'gradient-primary'
          )}
          variant={getButtonVariant()}
          disabled={isCurrentPlan || loading}
          onClick={() => onSelect(plan)}
        >
          {loading ? 'Wird geladen...' : getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
};
