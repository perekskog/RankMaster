"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Scale, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductList } from '@/components/products/ProductList';
import { ProductDialog } from '@/components/products/ProductDialog';
import { ComparativeRankingDialog } from '@/components/products/ComparativeRankingDialog';
import type { Category, Product, GradedRank, ComparativeRank, WithId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser, useStorage } from '@/firebase';
import { collection, doc, query, where, writeBatch } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { uploadFile } from '@/firebase/storage';

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
  const { categoryId } = params;
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();
  const { user, isUserLoading } = useUser();

  const [isProductDialogOpen, setProductDialogOpen] = useState(false);
  const [isCompareDialogOpen, setCompareDialogOpen] = useState(false);
  
  const categoryRef = useMemoFirebase(() => 
    user ? doc(firestore, 'categories', categoryId) : null, 
  [firestore, categoryId, user]);
  const { data: category, isLoading: categoryLoading } = useDoc<Category>(categoryRef);

  const productsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'products'), where('categoryId', '==', categoryId), where('userId', '==', user.uid)) : null,
  [firestore, categoryId, user]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);
  
  const gradedRanksQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'gradedRankings'), where('categoryId', '==', categoryId), where('userId', '==', user.uid)) : null,
  [firestore, categoryId, user]);
  const { data: gradedRanks, isLoading: gradedRanksLoading } = useCollection<GradedRank>(gradedRanksQuery);
  
  const comparativeRanksQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'comparativeRankings'), where('categoryId', '==', categoryId), where('userId', '==', user.uid)) : null,
  [firestore, categoryId, user]);
  const { data: comparativeRanks, isLoading: comparativeRanksLoading } = useCollection<ComparativeRank>(comparativeRanksQuery);

  const rankedProducts = useMemo(() => {
    if (!user) return [];
    return calculateScores(products || [], gradedRanks || [], comparativeRanks || []);
  }, [products, gradedRanks, comparativeRanks, user]);

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'categoryId' | 'userId' | 'imageUrl'> & { id?: string; imageFile?: File }) => {
    if (!user) return;
    
    setProductDialogOpen(false);
    toast({ title: "Adding Product...", description: `Adding "${productData.name}".` });

    let imageUrl: string | undefined = undefined;
    if (productData.imageFile) {
        try {
            const filePath = `products/${user.uid}/${Date.now()}_${productData.imageFile.name}`;
            imageUrl = await uploadFile(storage, productData.imageFile, filePath);
        } catch (error) {
            console.error("Image upload failed:", error);
            toast({ title: "Image Upload Failed", description: "Could not upload the product image.", variant: "destructive" });
            return;
        }
    }

    const newId = doc(collection(firestore, 'products')).id;
    const newProduct: Product = {
      name: productData.name,
      description: productData.description,
      id: newId,
      categoryId: categoryId,
      userId: user.uid,
      imageUrl,
    };
    const docRef = doc(firestore, 'products', newId);
    setDocumentNonBlocking(docRef, newProduct, { merge: true });
    toast({ title: "Product Added", description: `"${newProduct.name}" has been added.` });
  };
  
  const handleDeleteProduct = async (productId: string) => {
    const batch = writeBatch(firestore);

    const productDocRef = doc(firestore, 'products', productId);
    batch.delete(productDocRef);
    
    const productName = products?.find(p => p.id === productId)?.name;
    toast({ title: "Product Deletion Initiated", description: `"${productName}" is being removed.`, variant: 'destructive' });

    deleteDocumentNonBlocking(productDocRef);
  };

  const handleGradeProduct = (productId: string, rank: number) => {
    if (!user) return;
    const newId = doc(collection(firestore, 'gradedRankings')).id;
    const newGrade: GradedRank = {
        id: newId,
        productId,
        categoryId: categoryId,
        rank,
        userId: user.uid
    };
    const docRef = doc(firestore, 'gradedRankings', newId);
    setDocumentNonBlocking(docRef, newGrade, { merge: true });
    
    const productName = products?.find(p => p.id === productId)?.name;
    toast({ title: "Product Graded", description: `"${productName}" was graded ${rank}.` });
  };
  
  const handleCompareProducts = (winnerId: string, loserId: string) => {
    if (!user) return;
    const newId = doc(collection(firestore, 'comparativeRankings')).id;
    const newComparison: ComparativeRank = {
        id: newId,
        categoryId: categoryId,
        winnerProductId: winnerId,
        loserProductId: loserId,
        userId: user.uid,
    };
    const docRef = doc(firestore, 'comparativeRankings', newId);
    setDocumentNonBlocking(docRef, newComparison, { merge: true });

    const winnerName = products?.find(p => p.id === winnerId)?.name;
    const loserName = products?.find(p => p.id === loserId)?.name;
    toast({ title: "Comparison Added", description: `Ranked "${winnerName}" over "${loserName}".` });
    setCompareDialogOpen(false);
  };

  const isLoading = isUserLoading || (!!user && (categoryLoading || productsLoading || gradedRanksLoading || comparativeRanksLoading));

  if (isLoading && !category) {
    return (
        <div className="container text-center py-10">
            <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
    )
  }
  
  if (!isUserLoading && !user) {
    return (
       <div className="container text-center py-10">
          <LogIn className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold mt-4">Please Sign In</h2>
          <p className="text-muted-foreground mt-2 mb-4">Sign in to view and rank products.</p>
           <Button asChild variant="link">
            <Link href="/">Back to Categories</Link>
          </Button>
      </div>
    )
  }

  if (!category && !categoryLoading) {
    return (
      <div className="container text-center py-10">
        <h2 className="text-2xl font-bold">Category not found</h2>
        <p className="text-muted-foreground mt-1">This category may not exist or you may not have permission to view it.</p>
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
        isLoggedIn={!!user}
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
