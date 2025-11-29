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
import { runInNewSpan } from '@genkit-ai/core';

const UpdateProductInputSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>;

export async function updateProduct(productId: string, data: UpdateProductInput) {
  // This wrapper is for client-side calls, the API will call the flow directly.
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
    authPolicy: async (auth, input) => {
      await runInNewSpan('verify-firebase-auth', async () => {
        const { admin } = getFirebaseAdmin();

        if (!auth) {
          throw new Error('Authentication required.');
        }

        const appCheckToken = auth.appCheckToken;
        if (process.env.NODE_ENV === "production" && !appCheckToken) {
          // If you want to enforce App Check, uncomment the following line
          // throw new Error("App Check token is missing or invalid.");
        }
        
        if (!auth.idToken) {
          throw new Error('Firebase ID token is required.');
        }
        
        const decodedToken = await admin.auth().verifyIdToken(auth.idToken);
        const uid = decodedToken.uid;
        
        // Attach uid to the auth object for use in the main flow logic
        auth.uid = uid;
      });
    },
  },
  async ({ productId, data }, { auth }) => {
    const { db } = getFirebaseAdmin();
    
    if (!productId) {
      return { success: false, message: 'Product ID is required.' };
    }
    
    // The user's UID is attached to the auth object by the authPolicy
    const uid = auth?.uid;
    if (!uid) {
        // This should theoretically not be reached if authPolicy is enforced
        return { success: false, message: 'Authentication failed.' };
    }

    try {
      const productRef = db.collection('products').doc(productId);
      const doc = await productRef.get();

      if (!doc.exists) {
        return { success: false, message: `Product with ID ${productId} not found.` };
      }
      
      const productData = doc.data();
      if (productData?.userId !== uid) {
          return { success: false, message: 'You are not authorized to update this product.' };
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
