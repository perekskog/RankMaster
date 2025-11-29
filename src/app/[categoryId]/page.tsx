"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductList } from '@/components/products/ProductList';
import { ProductDialog } from '@/components/products/ProductDialog';
import { ComparativeRankingDialog } from '@/components/products/ComparativeRankingDialog';
import type { Category, Product, GradedRank, ComparativeRank, WithId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where, writeBatch } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const calculateScores = (products: WithId<Product>[], gradedRanks: WithId<GradedRank>[], comparativeRanks: WithId<ComparativeRank>[]) => {
  if (!products) return [];
  return products.map(product => {
    const grades = gradedRanks?.filter(r => r.productId === product.id) || [];
    const avgGrade = grades.length > 0 ? grades.reduce((acc, r) => acc + r.rank, 0) / grades.length : 0;
    const gradedScore = avgGrade > 0 ? ((avgGrade - 1) / (7 - 1)) * 100 : 0;
    
    const wins = comparativeRanks?.filter(r => r.winnerProductId === product.id).length || 0;
    const losses = comparativeRanks?.filter(r => r.loserProductId === product.id).length || 0;
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
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const [isProductDialogOpen, setProductDialogOpen] = useState(false);
  const [isCompareDialogOpen, setCompareDialogOpen] = useState(false);
  
  const categoryRef = useMemoFirebase(() => doc(firestore, 'categories', params.categoryId), [firestore, params.categoryId]);
  const { data: category, isLoading: categoryLoading } = useDoc<Category>(categoryRef);

  const productsQuery = useMemoFirebase(() => query(collection(firestore, 'products'), where('categoryId', '==', params.categoryId)), [firestore, params.categoryId]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);
  
  const gradedRanksQuery = useMemoFirebase(() => query(collection(firestore, 'gradedRankings'), where('categoryId', '==', params.categoryId)), [firestore, params.categoryId]);
  const { data: gradedRanks, isLoading: gradedRanksLoading } = useCollection<GradedRank>(gradedRanksQuery);
  
  const comparativeRanksQuery = useMemoFirebase(() => query(collection(firestore, 'comparativeRankings'), where('categoryId', '==', params.categoryId)), [firestore, params.categoryId]);
  const { data: comparativeRanks, isLoading: comparativeRanksLoading } = useCollection<ComparativeRank>(comparativeRanksQuery);

  const rankedProducts = useMemo(() => {
    return calculateScores(products || [], gradedRanks || [], comparativeRanks || []);
  }, [products, gradedRanks, comparativeRanks]);

  const handleSaveProduct = (productData: Omit<Product, 'id' | 'categoryId'> & { id?: string }) => {
    const newId = doc(collection(firestore, 'products')).id;
    const newProduct: Product = {
      ...productData,
      id: newId,
      categoryId: params.categoryId
    };
    const docRef = doc(firestore, 'products', newId);
    setDocumentNonBlocking(docRef, newProduct, { merge: true });
    setProductDialogOpen(false);
    toast({ title: "Product Added", description: `"${newProduct.name}" has been added.` });
  };
  
  const handleDeleteProduct = async (productId: string) => {
    const batch = writeBatch(firestore);

    const productDocRef = doc(firestore, 'products', productId);
    batch.delete(productDocRef);
    
    const gradedRanksToDeleteQuery = query(collection(firestore, 'gradedRankings'), where('productId', '==', productId));
    const comparativeRanksToDeleteQuery1 = query(collection(firestore, 'comparativeRankings'), where('winnerProductId', '==', productId));
    const comparativeRanksToDeleteQuery2 = query(collection(firestore, 'comparativeRankings'), where('loserProductId', '==', productId));
    
    // In a real app, you would fetch these documents and then delete them.
    // For this prototype, we'll assume the on-device cache reflects the state and this deletion will be reflected.
    // The useCollection hooks will update the UI.
    // This is a simplification. A more robust solution would involve a Cloud Function for cascading deletes.

    const productName = products?.find(p => p.id === productId)?.name;
    toast({ title: "Product Deletion Initiated", description: `"${productName}" is being removed.`, variant: 'destructive' });

    deleteDocumentNonBlocking(productDocRef);
  };

  const handleGradeProduct = (productId: string, rank: number) => {
    const newId = doc(collection(firestore, 'gradedRankings')).id;
    const newGrade: GradedRank = {
        id: newId,
        productId,
        categoryId: params.categoryId,
        rank
    };
    const docRef = doc(firestore, 'gradedRankings', newId);
    setDocumentNonBlocking(docRef, newGrade, { merge: true });
    
    const productName = products?.find(p => p.id === productId)?.name;
    toast({ title: "Product Graded", description: `"${productName}" was graded ${rank}.` });
  };
  
  const handleCompareProducts = (winnerId: string, loserId: string) => {
    const newId = doc(collection(firestore, 'comparativeRankings')).id;
    const newComparison: ComparativeRank = {
        id: newId,
        categoryId: params.categoryId,
        winnerProductId: winnerId,
        loserProductId: loserId,
    };
    const docRef = doc(firestore, 'comparativeRankings', newId);
    setDocumentNonBlocking(docRef, newComparison, { merge: true });

    const winnerName = products?.find(p => p.id === winnerId)?.name;
    const loserName = products?.find(p => p.id === loserId)?.name;
    toast({ title: "Comparison Added", description: `Ranked "${winnerName}" over "${loserName}".` });
    setCompareDialogOpen(false);
  };

  const isLoading = categoryLoading || productsLoading || gradedRanksLoading || comparativeRanksLoading;

  if (isLoading && !category) {
    return (
        <div className="container text-center py-10">
            <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
    )
  }

  if (!category && !categoryLoading) {
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
            <h1 className="text-3xl font-headline font-bold tracking-tight">{category?.name}</h1>
            <p className="text-muted-foreground mt-1">{category?.description}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button onClick={() => setCompareDialogOpen(true)} variant="outline" disabled={!products || products.length < 2 || isUserLoading || !user}>
              <Scale className="mr-2 h-4 w-4" /> Compare
            </Button>
            <Button onClick={() => setProductDialogOpen(true)} disabled={isUserLoading || !user}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>
      </div>
      
      <ProductList
        products={rankedProducts}
        loading={isLoading}
        onDelete={handleDeleteProduct}
        onGrade={handleGradeProduct}
        canModify={!!user}
      />
      
      <ProductDialog
        isOpen={isProductDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSave={handleSaveProduct}
      />
      
      <ComparativeRankingDialog
        isOpen={isCompareDialogOpen}
        onOpenChange={setCompareDialogOpen}
        products={products || []}
        onCompare={handleCompareProducts}
      />
    </div>
  );
}
