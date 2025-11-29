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
  productId: string;
  rank: number;
}

export interface ComparativeRank {
  winnerProductId: string;
  loserProductId: string;
}
