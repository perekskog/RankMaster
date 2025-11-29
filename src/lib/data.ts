import type { Category, Product, GradedRank, ComparativeRank } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

export const categories: Category[] = [
  { id: 'cat-1', name: 'Smartphones', description: 'The latest and greatest mobile phones.' },
  { id: 'cat-2', name: 'Laptops', description: 'Portable computers for work and play.' },
  { id: 'cat-3', name: 'Coffee Beans', description: 'Rating different roasts and origins.' },
];

export const products: Product[] = [
  { id: 'prod-1', categoryId: 'cat-1', name: 'Pixel 9 Pro', description: 'Googles flagship phone.', imageUrl: getImage('p9p')?.imageUrl, imageHint: getImage('p9p')?.imageHint },
  { id: 'prod-2', categoryId: 'cat-1', name: 'iPhone 16 Pro', description: 'Apples premium offering.', imageUrl: getImage('i16p')?.imageUrl, imageHint: getImage('i16p')?.imageHint },
  { id: 'prod-3', categoryId: 'cat-1', name: 'Galaxy S25 Ultra', description: 'Samsungs top-tier device.', imageUrl: getImage('s25u')?.imageUrl, imageHint: getImage('s25u')?.imageHint },
  { id: 'prod-4', categoryId: 'cat-2', name: 'MacBook Pro M4', description: 'Powerful and efficient laptop for professionals.', imageUrl: getImage('mbp4')?.imageUrl, imageHint: getImage('mbp4')?.imageHint },
  { id: 'prod-5', categoryId: 'cat-2', name: 'Dell XPS 15', description: 'A Windows powerhouse with a stunning display.', imageUrl: getImage('xps15')?.imageUrl, imageHint: getImage('xps15')?.imageHint },
];

export const gradedRanks: GradedRank[] = [
  { productId: 'prod-1', rank: 7 },
  { productId: 'prod-2', rank: 6 },
  { productId: 'prod-3', rank: 5 },
  { productId: 'prod-4', rank: 7 },
  { productId: 'prod-5', rank: 6 },
];

export const comparativeRanks: ComparativeRank[] = [
  { winnerProductId: 'prod-1', loserProductId: 'prod-2' },
  { winnerProductId: 'prod-1', loserProductId: 'prod-3' },
  { winnerProductId: 'prod-2', loserProductId: 'prod-3' },
  { winnerProductId: 'prod-4', loserProductId: 'prod-5' },
];
