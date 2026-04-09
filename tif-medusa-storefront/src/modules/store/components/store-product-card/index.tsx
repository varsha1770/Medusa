"use client"

import React, { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { Swiper, SwiperSlide } from "swiper/react"

import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { useWishlist } from "@modules/wishlist/hooks/use-wishlist"
import { addDemoItem } from "@lib/util/cart-demo"
import { WishlistItem } from "@lib/util/wishlist"

import "swiper/css"

type StoreProductCardProps = {
  product: HttpTypes.StoreProduct
}

const StoreProductCard = ({ product }: StoreProductCardProps) => {
  const { toggleItem, isInWishlist } = useWishlist()
  const [isAdding, setIsAdding] = useState(false)
  const [isWishlisting, setIsWishlisting] = useState(false)

  const { cheapestPrice } = getProductPrice({ product })
  const variantCount = product.variants?.length ?? 0
  
  const variant = product.variants?.[0] 
  const isSaved = isInWishlist(`${product.id}:${variant?.id}`)

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisting(true)
    
    const wishlistItem: WishlistItem = {
      id: `${product.id}:${variant?.id}`,
      productId: product.id,
      variantId: variant?.id,
      handle: product.handle ?? "",
      title: product.title,
      thumbnail: product.thumbnail ?? null,
      price: cheapestPrice?.calculated_price ?? null,
      amount: cheapestPrice?.calculated_price_number || 0,
      currency_code: cheapestPrice?.currency_code || null,
      quantity: 1,
      createdAt: new Date().toISOString(),
    }

    toggleItem(wishlistItem)
    setTimeout(() => setIsWishlisting(false), 600)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAdding || !variant) return

    setIsAdding(true)
    
    addDemoItem({
      id: product.id,
      variantId: variant.id,
      title: product.title,
      handle: product.handle ?? "",
      thumbnail: product.thumbnail ?? null,
      price: cheapestPrice?.calculated_price_number || 0,
    })

    setTimeout(() => setIsAdding(false), 1500)
  }

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : product.thumbnail
        ? [{ id: `${product.id}-thumb`, url: product.thumbnail }]
        : []

  return (
    <div className="group relative flex flex-col overflow-hidden bg-white rounded-xl transition-all duration-500 hover:shadow-[0_25px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 border border-transparent hover:border-blue/5">
      <article className="h-full flex flex-col" data-testid="product-wrapper">
        {/* 1. Image Container (3:4 Aspect Ratio) */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50 text-center">
          
          {/* Wishlist Button (Top-Right) */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 active:scale-90 ${
              isSaved ? "text-red-500" : "text-blue-950 hover:text-blue"
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
              className={`${isWishlisting ? "animate-ping" : "group-hover:scale-110 transition-transform"}`}
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </button>

          {/* Option Badge (Floating Top-Left) */}
          {variantCount > 0 && (
            <div className="absolute left-3 top-3 z-30 rounded-full bg-white/80 backdrop-blur-md px-3 py-1 text-[9px] font-black uppercase tracking-wider text-blue-950/60 border border-white shadow-sm">
               {variantCount > 1 ? `${variantCount} Options` : "1 Option"}
            </div>
          )}

          {/* Image Hover Swap & View Details */}
          <LocalizedClientLink href={`/products/${product.handle}`} className="block w-full h-full relative cursor-pointer">
            {/* Primary Image */}
            <div className={`relative w-full h-full z-10 transition-all duration-700 ease-out ${productImages.length > 1 ? 'group-hover:opacity-0' : 'group-hover:scale-110'}`}>
              <Thumbnail
                thumbnail={productImages[0]?.url || product.thumbnail}
                images={product.images}
                size="full"
                className="w-full h-full object-cover rounded-none border-0 bg-transparent p-0 shadow-none !aspect-[3/4]"
              />
            </div>

            {/* Secondary Image (Fades in on hover) */}
            {productImages.length > 1 && (
              <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out group-hover:scale-110">
                <Thumbnail
                  thumbnail={productImages[1].url}
                  images={product.images}
                  size="full"
                  className="w-full h-full object-cover rounded-none border-0 bg-transparent p-0 shadow-none !aspect-[3/4]"
                />
              </div>
            )}

            {/* Action Overlay (Bottom actions) */}
            <div className="absolute bottom-4 inset-x-4 z-40 flex items-center gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
               <div className="flex-1 bg-white/95 backdrop-blur-sm py-3 text-blue-950 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all text-center rounded-xl shadow-xl border border-white">
                  Discover Piece
               </div>
               
               <button
                 onClick={handleAddToCart}
                 disabled={isAdding}
                 className={`w-11 h-11 shrink-0 rounded-xl shadow-xl transition-all duration-300 flex items-center justify-center border border-white bg-white/95 backdrop-blur-sm ${
                   isAdding ? "text-green-500" : "text-blue-950 hover:bg-black hover:text-white"
                 }`}
               >
                 {isAdding ? (
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce"><polyline points="20 6 9 17 4 12"></polyline></svg>
                 ) : (
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                 )}
               </button>
            </div>
          </LocalizedClientLink>
        </div>

        {/* 2. Info Area */}
        <div className="p-5 flex flex-col flex-1 bg-white">
          <div className="flex flex-col space-y-1 mb-3 text-center items-center">
            {product.subtitle && (
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600 truncate opacity-80 mb-1">
                 {product.subtitle}
              </span>
            )}
            <h3 className="text-base text-blue-950 truncate font-[350] tracking-tight group-hover:text-blue-600 transition-colors duration-300">
              <LocalizedClientLink href={`/products/${product.handle}`}>
                {product.title}
              </LocalizedClientLink>
            </h3>
          </div>

          <div className="flex items-baseline justify-center gap-2 mt-auto pt-2 border-t border-gray-50">
            {cheapestPrice?.price_type === "sale" ? (
              <>
                <span className="text-base font-bold text-blue-600 tracking-tight">{cheapestPrice.calculated_price}</span>
                <span className="text-[11px] text-gray-400 line-through font-[350]">{cheapestPrice.original_price}</span>
              </>
            ) : cheapestPrice ? (
              <span className="text-base font-bold text-blue-950 tracking-tight">{cheapestPrice.calculated_price}</span>
            ) : (
              <span className="text-xs text-blue-600/60 italic font-[350]">Price upon request</span>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}

export default StoreProductCard
