import { Product } from "../types/product";

export const shopData: Product[] = [
  {
    id: 1,
    variantId: "variant_sofa_01",
    handle: "luxury-modern-royal-sofa",
    price: 39000,
    discountedPrice: 29000,
    title: "Luxury Modern Royal Sofa Set",
    imgs: {
      thumbnails: ["/images/products/Luxury_Sofa.webp"],
      previews: ["/images/products/Luxury_Sofa.webp"]
    },
    reviews: 124,
  },
  {
    id: 2,
    variantId: "variant_chair_02",
    handle: "dublin-ergonomic-chair",
    price: 18500,
    discountedPrice: 14800,
    title: "Dublin Ergonomic Comfort Chair",
    imgs: {
      thumbnails: ["/images/products/Dublin_Chair.webp"],
      previews: ["/images/products/Dublin_Chair.webp"]
    },
    reviews: 89,
  },
  {
    id: 3,
    variantId: "variant_bear_03",
    handle: "artisanal-happy-bear",
    price: 12000,
    discountedPrice: 9600,
    title: "Artisanal Happy Bear Sculpture",
    imgs: {
      thumbnails: ["/images/products/Happy_Bear.webp"],
      previews: ["/images/products/Happy_Bear.webp"]
    },
    reviews: 56,
  },
  {
    id: 4,
    variantId: "variant_shoes_04",
    handle: "premium-multi-shoes",
    price: 7500,
    discountedPrice: 5900,
    title: "Premium Multi-color Comfort Shoes",
    imgs: {
      thumbnails: ["/images/products/Shoe-Multi_color.webp"],
      previews: ["/images/products/Shoe-Multi_color.webp"]
    },
    reviews: 212,
  },
];

export default shopData;
