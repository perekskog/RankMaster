'use server';
/**
 * @fileOverview A flow for updating a product via a REST API.
 *
 * - updateProduct - A function that handles updating a product in Firestore.
 * - UpdateProductInput - The input type for the updateProduct function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirebaseAdmin } from '@/firebase/admin';

const UpdateProductInputSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>;

export async function updateProduct(productId: string, data: UpdateProductInput) {
  return await updateProductFlow({ productId, data });
}

const updateProductFlow = ai.defineFlow(
  {
    name: 'updateProductFlow',
    inputSchema: z.object({
      productId: z.string(),
      data: UpdateProductInputSchema,
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async ({ productId, data }) => {
    const { db } = getFirebaseAdmin();
    
    if (!productId) {
      return { success: false, message: 'Product ID is required.' };
    }

    try {
      const productRef = db.collection('products').doc(productId);
      const doc = await productRef.get();

      if (!doc.exists) {
        return { success: false, message: `Product with ID ${productId} not found.` };
      }
      
      await productRef.update(data);

      return {
        success: true,
        message: `Product ${productId} updated successfully.`,
      };
    } catch (error: any) {
      console.error('Error updating product:', error);
      return {
        success: false,
        message: error.message || 'An unexpected error occurred.',
      };
    }
  }
);
