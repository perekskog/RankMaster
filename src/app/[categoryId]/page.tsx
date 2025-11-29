"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductList } from '@/components/products/ProductList';
import { ProductDialog } from '@/components/products/ProductDialog';
import { ComparativeRankingDialog } from '@/components/products/ComparativeRankingDialog';
import {
  categories as initialCategories,
  products as initialProducts,
  gradedRanks as initialGradedRanks,
  comparativeRanks as initialComparativeRanks
} from '@/lib/data';
import type { Category, Product, GradedRank, ComparativeRank } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const calculateScores = (products: Product[], gradedRanks: GradedRank[], comparativeRanks: ComparativeRank[]) => {
  return products.map(product => {
    const grades = gradedRanks.filter(r => r.productId === product.id);
    const avgGrade = grades.length > 0 ? grades.reduce((acc, r) => acc + r.rank, 0) / grades.length : 0;
    const gradedScore = avgGrade > 0 ? ((avgGrade - 1) / (7 - 1)) * 100 : 0;
    
    const wins = comparativeRanks.filter(r => r.winnerProductId === product.id).length;
    const losses = comparativeRanks.filter(r => r.loserProductId === product.id).length;
    const comparativeScore = (wins - losses) * 5;

    const combinedScore = gradedScore + comparativeScore;
    
    return {
      ...product,
      score: Math.round(combinedScore),
      avgGrade: grades.length > 0 ? (avgGrade).toFixed(1) : 'N/A',
      wins,
      losses
    };
  }).sort((a, b) => b.score - a.score);
};

export default function CategoryPage({ params }: { params: { categoryId: string } }) {
  const { toast } = useToast();
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [gradedRanks, setGradedRanks] = useState<GradedRank[]>(initialGradedRanks);
  const [comparativeRanks, setComparativeRanks] = useState<ComparativeRank[]>(initialComparativeRanks);

  const [isProductDialogOpen, setProductDialogOpen] = useState(false);
  const [isCompareDialogOpen, setCompareDialogOpen] = useState(false);
  
  useEffect(() => {
    const foundCategory = initialCategories.find(c => c.id === params.categoryId);
    setCategory(foundCategory);
    if (foundCategory) {
      const categoryProducts = initialProducts.filter(p => p.categoryId === params.categoryId);
      setProducts(categoryProducts);
    }
  }, [params.categoryId]);

  const rankedProducts = useMemo(() => {
    return calculateScores(products, gradedRanks, comparativeRanks);
  }, [products, gradedRanks, comparativeRanks]);

  const handleSaveProduct = (productData: Omit<Product, 'id' | 'categoryId'> & { id?: string }) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      categoryId: params.categoryId
    };
    setProducts(prev => [...prev, newProduct]);
    setProductDialogOpen(false);
    toast({ title: "Product Added", description: `"${newProduct.name}" has been added.` });
  };
  
  const handleDeleteProduct = (productId: string) => {
    const productName = products.find(p => p.id === productId)?.name;
    setProducts(prev => prev.filter(p => p.id !== productId));
    setGradedRanks(prev => prev.filter(r => r.productId !== productId));
    setComparativeRanks(prev => prev.filter(r => r.winnerProductId !== productId && r.loserProductId !== productId));
    toast({ title: "Product Deleted", description: `"${productName}" has been removed.`, variant: 'destructive' });
  };

  const handleGradeProduct = (productId: string, rank: number) => {
    setGradedRanks(prev => [...prev.filter(r => r.productId !== productId), { productId, rank }]);
    const productName = products.find(p => p.id === productId)?.name;
    toast({ title: "Product Graded", description: `"${productName}" was graded ${rank}.` });
  };
  
  const handleCompareProducts = (winnerId: string, loserId: string) => {
    setComparativeRanks(prev => [...prev, { winnerProductId: winnerId, loserProductId: loserId }]);
    const winnerName = products.find(p => p.id === winnerId)?.name;
    const loserName = products.find(p => p.id === loserId)?.name;
    toast({ title: "Comparison Added", description: `Ranked "${winnerName}" over "${loserName}".` });
    setCompareDialogOpen(false);
  };

  if (!category) {
    return (
      <div className="container text-center py-10">
        <h2 className="text-2xl font-bold">Category not found</h2>
        <Button asChild variant="link" className="mt-4">
          <Link href="/">Go back to categories</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4 pl-0">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">{category.name}</h1>
            <p className="text-muted-foreground mt-1">{category.description}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button onClick={() => setCompareDialogOpen(true)} variant="outline" disabled={products.length < 2}>
              <Scale className="mr-2 h-4 w-4" /> Compare
            </Button>
            <Button onClick={() => setProductDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>
      </div>
      
      <ProductList
        products={rankedProducts}
        onDelete={handleDeleteProduct}
        onGrade={handleGradeProduct}
      />
      
      <ProductDialog
        isOpen={isProductDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSave={handleSaveProduct}
      />
      
      <ComparativeRankingDialog
        isOpen={isCompareDialogOpen}
        onOpenChange={setCompareDialogOpen}
        products={products}
        onCompare={handleCompareProducts}
      />
    </div>
  );
}
