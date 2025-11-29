import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Star, Trash2, ImageIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { GradedRanking } from './GradedRanking';
import { Badge } from '@/components/ui/badge';
import type { Product, WithId } from '@/lib/types';
import { useState } from 'react';

interface RankedProduct extends WithId<Product> {
  score: number;
  avgGrade: string;
  wins: number;
  losses: number;
}

interface ProductCardProps {
  product: RankedProduct;
  rank: number;
  onDelete: (productId: string) => void;
  onGrade: (productId:string, rank: number) => void;
  canModify: boolean;
}

export function ProductCard({ product, rank, onDelete, onGrade, canModify }: ProductCardProps) {
  const [isGradePopoverOpen, setGradePopoverOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleGrade = (rank: number) => {
    onGrade(product.id, rank);
    setGradePopoverOpen(false);
  }
  
  return (
    <>
    <Card className="flex flex-col transition-all hover:shadow-lg animate-in fade-in-50 duration-300">
      <CardHeader className="p-0 relative">
        <Badge className="absolute top-2 left-2 z-10 bg-black/50 text-white border-none text-lg font-bold w-10 h-10 flex items-center justify-center rounded-full">
          #{rank}
        </Badge>
        {canModify && (
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white border-none rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        )}
        <div className="aspect-[3/2] w-full rounded-t-lg bg-muted flex items-center justify-center">
        {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={600}
              height={400}
              className="aspect-[3/2] w-full rounded-t-lg object-cover"
            />
          ) : (
            <ImageIcon className="h-16 w-16 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-headline">{product.name}</CardTitle>
        {product.description && <CardDescription className="mt-2 text-sm line-clamp-2">{product.description}</CardDescription>}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col items-start gap-2">
        <div className="flex justify-between w-full text-sm text-muted-foreground">
          <span>Avg. Grade: <span className="font-semibold text-foreground">{product.avgGrade}</span></span>
          <span>W/L: <span className="font-semibold text-green-600">{product.wins}</span>/<span className="font-semibold text-red-600">{product.losses}</span></span>
        </div>
        <Popover open={isGradePopoverOpen} onOpenChange={setGradePopoverOpen}>
          <PopoverTrigger asChild>
            <Button className="w-full" variant="outline" disabled={!canModify}>
              <Star className="mr-2 h-4 w-4 text-accent fill-accent" />
              Grade Product
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <GradedRanking onGrade={handleGrade} />
          </PopoverContent>
        </Popover>
      </CardFooter>
    </Card>

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{product.name}" and all its ranking data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => onDelete(product.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
