"use client"

import { addToCart } from "@lib/data/cart"
import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { useWishlist } from "@modules/wishlist/hooks/use-wishlist"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { WishlistItem } from "@lib/util/wishlist";
import { addDemoItem } from "@lib/util/cart-demo";
import { convertToLocale } from "@lib/util/money";

type WishlistItemRowProps = {
  item: WishlistItem
}

const WishlistItemRow = ({ item }: WishlistItemRowProps) => {
  const { removeItem, updateQuantity } = useWishlist()
  const router = useRouter()
  const countryCode = useParams().countryCode as string
  const [isMoving, setIsMoving] = useState(false)

  const handleMoveToCart = async () => {
    if (!item.variantId) {
      return
    }

    setIsMoving(true)

    try {
      // Demo Mode Safeguard: Skip backend for mock IDs to prevent crashes during presentation
      if (item.variantId.startsWith("variant_")) {
        addDemoItem({
          id: item.productId,
          variantId: item.variantId,
          title: item.title,
          handle: item.handle,
          thumbnail: item.thumbnail ?? null,
          price: parseFloat((item.price ?? "0").replace(/[^0-9.]/g, "")),
          quantity: item.quantity ?? 1,
        })
        
        // As per user request: Redirect to cart instead of checkout
        router.push(`/${countryCode}/cart`)
        return
      }

      await addToCart({
        variantId: item.variantId,
        quantity: item.quantity ?? 1,
        countryCode,
      })

      // Redirect to cart
      router.push(`/${countryCode}/cart`)
    } finally {
      setIsMoving(false)
    }
  }

  return (
    <article className="grid gap-5 rounded-[24px] border border-gray-3 bg-white p-5 shadow-[0_14px_40px_-32px_rgba(28,39,76,0.45)] small:grid-cols-[140px_minmax(0,1fr)_auto] small:items-center">
      <LocalizedClientLink href={`/products/${item.handle}`} className="block">
        <Thumbnail thumbnail={item.thumbnail ?? null} images={[]} size="square" className="rounded-xl overflow-hidden"/>
      </LocalizedClientLink>
      <div className="min-w-0">
        <LocalizedClientLink href={`/products/${item.handle}`}>
          <h3 className="text-xl font-bold text-blue-950 tracking-tight">{item.title}</h3>
        </LocalizedClientLink>
        {item.variantTitle && (
          <p className="mt-1 text-sm text-gray-500 font-[350]">
            Size: <span className="font-semibold text-blue">{item.variantTitle}</span>
          </p>
        )}
        <div className="flex items-center gap-x-4 mt-4">
           <div className="flex items-center border border-gray-200 rounded-md bg-gray-50 overflow-hidden shadow-sm">
              <button
                onClick={() => updateQuantity(item.id, (item.quantity ?? 1) - 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors text-lg"
              >
                -
              </button>
              <span className="px-3 text-center text-sm font-bold text-blue tracking-tight">{item.quantity ?? 1}</span>
              <button
                onClick={() => updateQuantity(item.id, (item.quantity ?? 1) + 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-200 transition-colors text-lg"
              >
                +
              </button>
           </div>
           {item.amount && item.currency_code ? (
             <p className="text-lg font-bold text-blue-900 tracking-tight">
               {convertToLocale({
                 amount: item.amount * (item.quantity ?? 1),
                 currency_code: item.currency_code,
               })}
             </p>
           ) : (
             item.price && (
               <p className="text-lg font-bold text-blue-900 tracking-tight">{item.price}</p>
             )
           )}
        </div>
      </div>
      <div className="flex flex-col gap-3 small:items-end">
        <Button
          onClick={handleMoveToCart}
          disabled={!item.variantId || isMoving}
          isLoading={isMoving}
          className="h-12 w-full small:w-auto rounded-xl bg-blue px-8 text-white hover:bg-blue-dark border-0 shadow-lg shadow-blue/20 transition-all hover:-translate-y-0.5"
          data-testid="wishlist-move-to-cart"
        >
          {item.variantId ? "Move to Cart" : "Choose variant"}
        </Button>
        <button
          type="button"
          onClick={() => removeItem(item.id)}
          className="text-xs uppercase tracking-widest font-bold text-red-400 text-left hover:underline pr-2"
          data-testid="wishlist-remove-item"
        >
          Remove
        </button>
      </div>
    </article>
  )
}

export default WishlistItemRow
