import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"

export const WISHLIST_STORAGE_KEY = "storefront:wishlist"
export const WISHLIST_UPDATED_EVENT = "storefront:wishlist-updated"

export type WishlistItem = {
  id: string
  productId: string
  variantId?: string
  handle: string
  title: string
  thumbnail?: string | null
  price?: string | null
  amount?: number | null
  currency_code?: string | null
  variantTitle?: string | null
  quantity: number
  createdAt: string
}

type BuildWishlistItemInput = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}

export const getWishlistItemId = (productId: string, variantId?: string) =>
  `${productId}:${variantId ?? "default"}`

export const buildWishlistItem = ({
  product,
  variant,
}: BuildWishlistItemInput): WishlistItem => {
  const fallbackVariant = variant ?? product.variants?.[0]
  const pricing = getProductPrice({
    product,
    variantId: fallbackVariant?.id,
  })

  return {
    id: getWishlistItemId(product.id, fallbackVariant?.id),
    productId: product.id,
    variantId: fallbackVariant?.id,
    handle: product.handle ?? "",
    title: product.title,
    thumbnail: product.thumbnail ?? product.images?.[0]?.url ?? null,
    price:
      pricing.variantPrice?.calculated_price ??
      pricing.cheapestPrice?.calculated_price ??
      null,
    amount:
      pricing.variantPrice?.calculated_price_number ??
      pricing.cheapestPrice?.calculated_price_number ??
      null,
    currency_code:
      pricing.variantPrice?.currency_code ??
      pricing.cheapestPrice?.currency_code ??
      null,
    variantTitle:
      fallbackVariant?.title && fallbackVariant.title !== "Default Variant"
        ? fallbackVariant.title
        : null,
    quantity: 1,
    createdAt: new Date().toISOString(),
  }
}

export const readWishlist = (): WishlistItem[] => {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const writeWishlist = (items: WishlistItem[]) => {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent(WISHLIST_UPDATED_EVENT))
}
