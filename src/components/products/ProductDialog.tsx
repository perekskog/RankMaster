import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ImageUp, X } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, { message: "Product name is required." }).max(50),
  description: z.string().max(200).optional(),
  imageFile: z.instanceof(File).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;
type ProductSaveData = Omit<Product, 'id' | 'categoryId' | 'userId' | 'imageUrl'> & { id?: string; imageFile?: File; imageUrl?: string };

interface ProductDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: ProductSaveData) => void;
}

export function ProductDialog({ isOpen, onOpenChange, onSave }: ProductDialogProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', description: '', imageFile: undefined },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
      setImagePreview(null);
    }
  }, [isOpen, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('imageFile', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    form.setValue('imageFile', undefined);
    setImagePreview(null);
    // Also reset the file input element
    const fileInput = document.getElementById('imageFile-input') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }

  const onSubmit = (data: ProductFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Enter the details for the new product to be ranked.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., Pixel 8 Pro" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="A short description of the product" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <FormField
              control={form.control}
              name="imageFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <div>
                      {imagePreview ? (
                        <div className="relative group">
                          <Image src={imagePreview} alt="Preview" width={400} height={400} className="w-full h-auto rounded-md object-cover aspect-video" />
                           <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={clearImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                        </div>
                      ) : (
                        <label htmlFor="imageFile-input" className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-muted hover:bg-muted/80">
                          <ImageUp className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to upload image</span>
                        </label>
                      )}
                      <Input id="imageFile-input" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter><Button type="submit" disabled={form.formState.isSubmitting}>Save Product</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
