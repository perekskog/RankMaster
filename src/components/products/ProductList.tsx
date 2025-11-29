import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/types';

interface RankedProduct extends Product {
  score: number;
  avgGrade: string;
  wins: number;
  losses: number;
}

interface ProductListProps {
  products: RankedProduct[];
  onDelete: (productId: string) => void;
  onGrade: (productId: string, rank: number) => void;
}

export function ProductList({ products, onDelete, onGrade }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg bg-card">
        <h2 className="text-xl font-semibold">No Products Yet</h2>
        <p className="text-muted-foreground mt-2">Click "Add Product" to populate this category.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          rank={index + 1}
          onDelete={onDelete}
          onGrade={onGrade}
        />
      ))}
    </div>
  );
}
