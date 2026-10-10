export type Product = {
  title: string;
  reviews: number;
  rating?: number;
  price: number;
  discountedPrice: number;
  id: number;
  slug?: string;
  currency?: string;
  available?: boolean;
  stock?: number | null;
  hasVariants?: boolean;
  reviewCount?: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
