export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name:string;
  description?: string;
  imageUrl?: string;
  imageHint?: string;
}

export interface GradedRank {
  id: string;
  productId: string;
  categoryId: string;
  rank: number;
}

export interface ComparativeRank {
  id: string;
  categoryId: string;
  winnerProductId: string;
  loserProductId: string;
}

// Helper type for data from Firestore
export type WithId<T> = T & { id: string };
