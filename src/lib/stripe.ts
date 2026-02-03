import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = 'https://aaefocdqgdgexkcrjhks.supabase.co';

export const createCheckoutSession = async (
  priceId: string,
  userId: string,
  userEmail: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string } | { error: string }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        priceId,
        userId,
        userEmail,
        successUrl,
        cancelUrl
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { error: result.error || 'Fehler beim Erstellen der Checkout-Session' };
    }

    return { url: result.url };
  } catch (error) {
    console.error('Checkout session error:', error);
    return { error: 'Verbindungsfehler' };
  }
};

export const createPortalSession = async (
  returnUrl: string
): Promise<{ url: string } | { error: string }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ returnUrl })
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { error: result.error || 'Fehler beim Erstellen der Portal-Session' };
    }

    return { url: result.url };
  } catch (error) {
    console.error('Portal session error:', error);
    return { error: 'Verbindungsfehler' };
  }
};

export const formatPrice = (price: number, interval?: 'month' | 'year'): string => {
  const formatted = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
  
  if (interval) {
    return `${formatted}/${interval === 'month' ? 'Monat' : 'Jahr'}`;
  }
  
  return formatted;
};
