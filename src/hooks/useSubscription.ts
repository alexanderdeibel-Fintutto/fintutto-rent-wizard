import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserSubscription, PlanId } from '@/types/subscription';

interface UseSubscriptionReturn {
  subscription: UserSubscription | null;
  plan: PlanId;
  isPro: boolean;
  isBusiness: boolean;
  isActive: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

const APP_ID = 'fintutto';

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('app_id', APP_ID)
          .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(null);
      } else {
        setSubscription(data as UserSubscription | null);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const plan: PlanId = subscription?.plan_id || 'free';
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isPro = isActive && ['pro', 'business'].includes(plan);
  const isBusiness = isActive && plan === 'business';

  return {
    subscription,
    plan,
    isPro,
    isBusiness,
    isActive,
    loading,
    refetch: fetchSubscription
  };
};
