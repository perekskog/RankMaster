export interface Category {
  id: string;
  name: string;
  description?: string;
  userId: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name:string;
  description?: string;
  imageUrl?: string;
  imageHint?: string;
  userId: string;
}

export interface GradedRank {
  id: string;
  productId: string;
  categoryId: string;
  rank: number;
  userId: string;
}

export interface ComparativeRank {
  id: string;
  categoryId: string;
  winnerProductId: string;
  loserProductId: string;
  userId: string;
}

// Helper type for data from Firestore
export type WithId<T> = T & { id: string };
