import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number | null;
  price_monthly_cents: number | null;
  price_yearly_cents: number | null;
  stripe_price_monthly: string | null;
  stripe_price_yearly: string | null;
  is_active: boolean;
  features: Record<string, unknown> | null;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: fetchError } = await (supabase as any)
        .from('products')
        .select('id, name, slug, description, price_cents, price_monthly_cents, price_yearly_cents, stripe_price_monthly, stripe_price_yearly, is_active, features')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (fetchError) {
        console.error('Error fetching products:', fetchError);
        setError('Produkte konnten nicht geladen werden');
        return;
      }

      setProducts(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Produkte konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
};
