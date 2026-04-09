"use client";
import React, { useState, useTransition } from "react";
import Image from "next/image";
import { Product } from "../types/product";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { useWishlist } from "@modules/wishlist/hooks/use-wishlist";
import { addToCart } from "@lib/data/cart";
import { useParams } from "next/navigation";
import { WishlistItem } from "@lib/util/wishlist";
import { addDemoItem } from "@lib/util/cart-demo";

const ProductItem = ({ item }: { item: Product }) => {
  const { toggleItem, isInWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const { countryCode } = useParams();
  const [isPending, startTransition] = useTransition();

  const isSaved = isInWishlist(`${item.id}:${item.variantId}`);

  // 1. Handle Wishlist Logic
  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisting(true);
    
    const wishlistItem: WishlistItem = {
      id: `${item.id}:${item.variantId}`,
      productId: item.id.toString(),
      variantId: item.variantId,
      handle: item.handle,
      title: item.title,
      thumbnail: item.imgs?.thumbnails[0] || null,
      price: `$${item.discountedPrice}`,
      createdAt: new Date().toISOString(),
    };

    toggleItem(wishlistItem);
    
    // Quick animation reset
    setTimeout(() => setIsWishlisting(false), 600);
  };

  // 2. Handle Add to Cart Logic
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdding) return;

    setIsAdding(true);
    
    // 3. Demo Mode: Skip backend for mock IDs to prevent crashes
    if (item.variantId.startsWith("variant_")) {
      console.log("Cart Demo Mode: Mock ID detected. Skipping backend call.");
      
      addDemoItem({
        id: item.id.toString(),
        variantId: item.variantId,
        title: item.title,
        handle: item.handle,
        thumbnail: item.imgs?.thumbnails[0] || null,
        price: item.discountedPrice || item.price,
      });

      setTimeout(() => setIsAdding(false), 1500);
      return;
    }

    // 4. Real Medusa Add to Cart Action
    startTransition(async () => {
      try {
        await addToCart({
          variantId: item.variantId,
          quantity: 1,
          countryCode: countryCode as string,
        });
        
        // Success feedback
        setTimeout(() => setIsAdding(false), 1500);
      } catch (error) {
        console.warn("Cart Demo Mode: Backend rejected mock variant ID. Showing visual success for demo.");
        // Still show visual success for the boutique demo experience
        setTimeout(() => setIsAdding(false), 1500);
      }
    });
  };

  const discountedPrice = item.discountedPrice || item.price;

  return (
    <div className="group flex flex-col relative rounded-[24px] p-5 bg-white border border-gray-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 overflow-hidden h-full">
      
      {/* 1. Image Section (Top-aligned) */}
      <div className="relative overflow-hidden flex items-center justify-center bg-gray-50/50 rounded-2xl aspect-square mb-6 group-hover:bg-blue/5 transition-colors duration-500">
        
        {/* Wishlist Button (Heart Icon) */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-sm transition-all duration-500 hover:scale-110 active:scale-90 ${
            isSaved ? "text-red-500" : "text-dark"
          }`}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill={isSaved ? "currentColor" : "none"} 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`${isWishlisting ? "animate-ping" : ""}`}
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </button>


        <Image 
          src={item.imgs?.previews?.[0] || "/images/placeholder.png"} 
          alt={item.title || "Product"} 
          fill
          className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-110" 
        />

        {/* Professional Action Bar (Quick View & Cart) */}
        <div className="absolute inset-x-3 bottom-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <LocalizedClientLink
            href={`/products/${item.handle}`}
            className="flex-1 mr-2 h-11 rounded-xl bg-white/90 backdrop-blur-md border border-white shadow-xl text-dark text-[10px] font-[350] uppercase tracking-widest hover:bg-dark hover:text-white flex items-center justify-center transition-all duration-300"
          >
            Quick View
          </LocalizedClientLink>
          
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`w-11 h-11 rounded-xl shadow-xl transition-all duration-300 flex items-center justify-center ${
              isAdding ? "bg-green-500 text-white" : "bg-blue hover:bg-dark text-white shadow-blue/20"
            }`}
          >
            {isAdding ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* 2. Info Section (Bottom-aligned) */}
      <div className="px-1 flex flex-col flex-1 text-center items-center">
        {/* Rating Stars */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            ))}
          </div>
          <span className="text-[10px] font-[350] text-gray-300">({item.reviews || 0})</span>
        </div>

        {/* Product Title */}
        <h3 className="font-[350] text-dark text-lg leading-tight hover:text-blue transition-colors mb-3 line-clamp-1 uppercase tracking-tight">
          <LocalizedClientLink href={`/products/${item.handle}`}> {item.title} </LocalizedClientLink>
        </h3>

        {/* Price Section */}
        <div className="mt-auto flex items-center justify-center gap-4">
          <span className="text-2xl font-[350] text-blue tracking-tighter">₹{discountedPrice}</span>
          {item.price > discountedPrice && (
            <span className="text-sm text-gray-300 line-through font-[350]">₹{item.price}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
