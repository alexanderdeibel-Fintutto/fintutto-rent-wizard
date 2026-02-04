import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface CrossSellTrigger {
  id: string;
  from_app_id: string;
  to_app_id: string;
  trigger_keywords: string[];
  message_template: string;
  priority: number;
}

export interface AppInfo {
  id: string;
  name: string;
  slug: string;
  app_url: string | null;
}

interface UseCrossSellReturn {
  triggers: CrossSellTrigger[];
  userApps: string[];
  availableApps: AppInfo[];
  loading: boolean;
  getRelevantBanners: () => { trigger: CrossSellTrigger; app: AppInfo }[];
}

const CURRENT_APP_ID = 'fintutto';
const FINTUTTO_APPS = ['renditerechner', 'fintutto'];

export const useCrossSell = (): UseCrossSellReturn => {
  const { user } = useAuth();
  const [triggers, setTriggers] = useState<CrossSellTrigger[]>([]);
  const [userApps, setUserApps] = useState<string[]>([]);
  const [availableApps, setAvailableApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch cross-sell triggers for current app and related apps
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: triggersData } = await (supabase as any)
          .from('ai_cross_sell_triggers')
          .select('*')
          .in('from_app_id', FINTUTTO_APPS)
          .eq('is_active', true)
          .order('priority', { ascending: false });

        setTriggers(triggersData || []);

        // Fetch available apps
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: appsData } = await (supabase as any)
          .from('apps_registry')
          .select('id, name, slug, app_url')
          .eq('is_active', true);

        setAvailableApps(appsData || []);

        // If user is logged in, fetch their app access
        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: accessData } = await (supabase as any)
            .from('app_access')
            .select('app_id')
            .eq('is_active', true);

          // Also check user_subscriptions for app access
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: subscriptionData } = await (supabase as any)
            .from('user_subscriptions')
            .select('app_id')
            .eq('user_id', user.id)
            .eq('status', 'active');

          const accessApps = (accessData || []).map((a: { app_id: string }) => a.app_id);
          const subApps = (subscriptionData || []).map((s: { app_id: string }) => s.app_id);
          
          setUserApps([...new Set([...accessApps, ...subApps, CURRENT_APP_ID])]);
        } else {
          setUserApps([CURRENT_APP_ID]);
        }
      } catch (err) {
        console.error('Error fetching cross-sell data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getRelevantBanners = () => {
    // Filter triggers where user doesn't have the target app
    const relevantTriggers = triggers.filter(
      trigger => !userApps.includes(trigger.to_app_id)
    );

    // Map triggers to include app info
    return relevantTriggers
      .map(trigger => {
        const app = availableApps.find(a => a.id === trigger.to_app_id);
        if (!app) return null;
        return { trigger, app };
      })
      .filter((item): item is { trigger: CrossSellTrigger; app: AppInfo } => item !== null)
      .slice(0, 3); // Limit to top 3 banners
  };

  return {
    triggers,
    userApps,
    availableApps,
    loading,
    getRelevantBanners
  };
};
