"use client";

import { useState, useMemo } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Category, Product } from '@/lib/types';
import { categories as initialCategories, products as initialProducts } from '@/lib/data';
import CategoryList from '@/components/categories/CategoryList';
import { CategoryDialog } from '@/components/categories/CategoryDialog';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const categoriesWithProductCount = useMemo(() => {
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
  
  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };
  
  const handleSaveCategory = (categoryData: Omit<Category, 'id'> & { id?: string }) => {
    if (categoryData.id) {
      setCategories(prev => prev.map(c => c.id === categoryData.id ? { ...c, ...categoryData } : c));
    } else {
      const newCategory: Category = {
        ...categoryData,
        id: `cat-${Date.now()}`,
      };
      setCategories(prev => [...prev, newCategory]);
    }
    setIsDialogOpen(false);
  };
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-headline font-bold tracking-tight">Your Categories</h1>
        <Button onClick={handleAddCategory}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Category
        </Button>
      </div>
      
      <CategoryList 
        categories={categoriesWithProductCount} 
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
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
