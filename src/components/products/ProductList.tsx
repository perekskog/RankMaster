import { ProductCard } from './ProductCard';
import type { Product, WithId } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { LogIn } from 'lucide-react';


interface RankedProduct extends WithId<Product> {
  score: number;
  avgGrade: string;
  wins: number;
  losses: number;
}

interface ProductListProps {
  products: RankedProduct[];
  loading: boolean;
  onDelete: (productId: string) => void;
  onGrade: (productId: string, rank: number) => void;
  canModify: boolean;
  isLoggedIn: boolean;
}

export function ProductList({ products, loading, onDelete, onGrade, canModify, isLoggedIn }: ProductListProps) {
  if (loading) {
    return (
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }
  
  if (!isLoggedIn) {
     return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg bg-card col-span-full">
        <LogIn className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold mt-4">Please Sign In</h2>
        <p className="text-muted-foreground mt-2">Sign in to see and rank products.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg bg-card col-span-full">
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
          canModify={canModify}
        />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-full rounded-xl" />
      <div className="space-y-2 p-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
       <div className="p-2 pt-0 space-y-2">
         <div className="flex justify-between w-full">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
         </div>
         <Skeleton className="h-9 w-full" />
       </div>
    </div>
  )
}
