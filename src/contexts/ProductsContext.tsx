import { createContext, useContext, ReactNode } from 'react';
import { useProducts, Product } from '@/hooks/useProducts';

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const { products, loading, error, refetch } = useProducts();

  const getProductBySlug = (slug: string) => products.find(p => p.slug === slug);
  const getProductById = (id: string) => products.find(p => p.id === id);

  return (
    <ProductsContext.Provider value={{ 
      products, 
      loading, 
      error, 
      refetch,
      getProductBySlug,
      getProductById
    }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProductsContext = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProductsContext must be used within a ProductsProvider');
  }
  return context;
};
