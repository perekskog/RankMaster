import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trophy } from 'lucide-react';
import type { Product } from '@/lib/types';

interface ComparativeRankingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  products: Product[];
  onCompare: (winnerId: string, loserId: string) => void;
}

export function ComparativeRankingDialog({ isOpen, onOpenChange, products, onCompare }: ComparativeRankingDialogProps) {
  const [productA, setProductA] = useState<string | undefined>(undefined);
  const [productB, setProductB] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) {
      setProductA(undefined);
      setProductB(undefined);
    }
  }, [isOpen]);

  const handleCompare = (winnerId: string) => {
    const loserId = winnerId === productA ? productB : productA;
    if (!winnerId || !loserId) return;

    onCompare(winnerId, loserId);
  };
  
  const availableForB = products.filter(p => p.id !== productA);
  const availableForA = products.filter(p => p.id !== productB);

  const productAData = products.find(p => p.id === productA);
  const productBData = products.find(p => p.id === productB);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compare Products</DialogTitle>
          <DialogDescription>
            Select two products and choose which one is better.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="product-a">Product A</Label>
            <Select onValueChange={setProductA} value={productA}>
              <SelectTrigger id="product-a"><SelectValue placeholder="Select a product" /></SelectTrigger>
              <SelectContent>
                {availableForA.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-b">Product B</Label>
            <Select onValueChange={setProductB} value={productB}>
              <SelectTrigger id="product-b"><SelectValue placeholder="Select a product" /></SelectTrigger>
              <SelectContent>
                {availableForB.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {productA && productB && (
            <div className="flex justify-center items-center gap-4">
              <Button onClick={() => handleCompare(productA)} className="flex-1" variant="outline">
                  <Trophy className="mr-2 h-4 w-4 text-accent" /> {productAData?.name}
              </Button>
              <Button onClick={() => handleCompare(productB)} className="flex-1" variant="outline">
                  <Trophy className="mr-2 h-4 w-4 text-accent" /> {productBData?.name}
              </Button>
            </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
