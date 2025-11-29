import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import type { Category } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryWithCount extends Category {
  productCount: number;
}

interface CategoryListProps {
  categories: CategoryWithCount[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  canModify: boolean;
}

export default function CategoryList({ categories, loading, onEdit, onDelete, canModify }: CategoryListProps) {
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithCount | null>(null);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg bg-card">
        <h2 className="text-xl font-semibold">No Categories Yet</h2>
        <p className="text-muted-foreground mt-2">Click "New Category" to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="flex flex-col transition-all hover:shadow-lg">
            <CardHeader className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-headline">{category.name}</CardTitle>
                  {category.description && <CardDescription className="mt-2">{category.description}</CardDescription>}
                </div>
                {canModify && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(category)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => { if(category.productCount === 0) setDeletingCategory(category) }}
                      disabled={category.productCount > 0}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardFooter className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link href={`/${category.id}`}>View Rankings</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {deletingCategory && (
        <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete "{deletingCategory.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. You can only delete empty categories.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  onDelete(deletingCategory.id);
                  setDeletingCategory(null);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
