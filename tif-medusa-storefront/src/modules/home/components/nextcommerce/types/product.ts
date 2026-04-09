export type Product = {
  id: number;
  variantId: string;
  handle: string;
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
