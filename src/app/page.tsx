"use client";

import { useState, useMemo } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Category, Product } from '@/lib/types';
import CategoryList from '@/components/categories/CategoryList';
import { CategoryDialog } from '@/components/categories/CategoryDialog';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useUser } from '@/firebase/provider';

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const categoriesQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'categories'), where('userId', '==', user.uid)) : null
  , [firestore, user]);
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesQuery);

  const productsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'products'), where('userId', '==', user.uid)) : null
  , [firestore, user]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  const categoriesWithProductCount = useMemo(() => {
    if (!categories || !products) return [];
    return categories.map(category => ({
      ...category,
      productCount: products.filter(p => p.categoryId === category.id).length
    }));
  }, [categories, products]);
  
  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };
  
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };
  
  const handleDeleteCategory = async (categoryId: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'categories', categoryId);
    deleteDocumentNonBlocking(docRef);
  };
  
  const handleSaveCategory = (categoryData: Omit<Category, 'id' | 'userId'> & { id?: string }) => {
    if (!firestore || !user) return;
    if (categoryData.id) {
      const docRef = doc(firestore, 'categories', categoryData.id);
      setDocumentNonBlocking(docRef, { ...categoryData, userId: user.uid }, { merge: true });
    } else {
      const newId = doc(collection(firestore, 'categories')).id;
      const newCategory: Category = {
        ...categoryData,
        id: newId,
        userId: user.uid,
      };
      const docRef = doc(firestore, 'categories', newId);
      setDocumentNonBlocking(docRef, newCategory, { merge: true });
    }
    setIsDialogOpen(false);
  };
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-headline font-bold tracking-tight">Your Categories</h1>
        <Button onClick={handleAddCategory} disabled={isUserLoading || !user}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Category
        </Button>
      </div>
      
      <CategoryList 
        categories={categoriesWithProductCount}
        loading={isUserLoading || (!!user && (categoriesLoading || productsLoading))}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        canModify={!!user}
        isLoggedIn={!!user}
      />
      
      <CategoryDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveCategory}
        category={editingCategory}
      />
    </div>
  );
}
