export type PlanId = 'free' | 'pro' | 'business';

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete';

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  app_id: string;
  plan_id: PlanId;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricingPlan {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  priceIdMonthly: string;
  priceIdYearly: string;
  features: string[];
  highlighted?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfekt zum Ausprobieren',
    monthlyPrice: 0,
    yearlyPrice: 0,
    priceIdMonthly: '',
    priceIdYearly: '',
    features: [
      '3 Berechnungen pro Monat',
      'Basis-Funktionen',
      'Export als PDF'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Für aktive Investoren',
    monthlyPrice: 9.99,
    yearlyPrice: 95.90,
    priceIdMonthly: 'price_pro_monthly', // Replace with actual Stripe Price ID
    priceIdYearly: 'price_pro_yearly',   // Replace with actual Stripe Price ID
    features: [
      'Unbegrenzte Berechnungen',
      'Alle Basis-Funktionen',
      'Erweiterte Charts',
      'Excel-Export',
      'Berechnungen speichern',
      'Prioritäts-Support'
    ],
    highlighted: true
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Für professionelle Anwender',
    monthlyPrice: 29.99,
    yearlyPrice: 287.90,
    priceIdMonthly: 'price_business_monthly', // Replace with actual Stripe Price ID
    priceIdYearly: 'price_business_yearly',   // Replace with actual Stripe Price ID
    features: [
      'Alles aus Pro',
      'Team-Funktionen',
      'API-Zugang',
      'White-Label Berichte',
      'Dedizierter Support',
      'Custom Branding'
    ]
  }
];
