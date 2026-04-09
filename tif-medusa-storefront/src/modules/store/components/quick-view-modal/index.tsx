"use client"

import { addToCart } from "@lib/data/cart"
import { getProductPrice } from "@lib/util/get-product-price"
import { buildWishlistItem } from "@lib/util/wishlist"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WishlistToggle from "@modules/wishlist/components/wishlist-toggle"
import { isEqual } from "lodash"
import { createPortal } from "react-dom"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

type QuickViewModalProps = {
  product: HttpTypes.StoreProduct
  isOpen: boolean
  onClose: () => void
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce(
    (acc: Record<string, string>, varopt: any) => {
      acc[varopt.option_id] = varopt.value
      return acc
    },
    {}
  )
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
}: QuickViewModalProps) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  const [activeImg, setActiveImg] = useState(0)
  const [added, setAdded] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.thumbnail
      ? [{ id: "thumb", url: product.thumbnail }]
      : []

  // Pre-select if single variant
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    } else {
      setOptions({})
    }
    setActiveImg(0)
    setAdded(false)
  }, [product.id, product.variants])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isOpen, onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return undefined
    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const inStock = useMemo(() => {
    if (!selectedVariant) return false
    if (!selectedVariant.manage_inventory) return true
    if (selectedVariant.allow_backorder) return true
    return (selectedVariant.inventory_quantity ?? 0) > 0
  }, [selectedVariant])

  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const { cheapestPrice } = getProductPrice({ product })

  const priceDisplay = useMemo(() => {
    if (selectedVariant) {
      const price = getProductPrice({ product, variantId: selectedVariant.id })
      return price.cheapestPrice
    }
    return cheapestPrice
  }, [selectedVariant, product, cheapestPrice])

  const wishlistItem = buildWishlistItem({
    product,
    variant: selectedVariant ?? product.variants?.[0],
  })

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return
    setIsAdding(true)
    try {
      await addToCart({ variantId: selectedVariant.id, quantity: 1, countryCode })
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } finally {
      setIsAdding(false)
    }
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label={`Quick view: ${product.title}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div
        ref={modalRef}
        className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_32px_80px_-24px_rgba(28,39,76,0.45)] animate-qv-in md:flex-row"
        style={{ maxHeight: "90vh" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute right-4 top-4 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-dark shadow-sm transition-all hover:bg-dark hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* ── Left: Image Gallery ── */}
        <div className="flex flex-col bg-gray-1 md:w-[52%]">
          {/* Main Image */}
          <div className="relative flex h-[320px] items-center justify-center overflow-hidden md:h-[460px]">
            {images.length > 0 ? (
              <img
                key={images[activeImg]?.url}
                src={images[activeImg]?.url ?? ""}
                alt={product.title ?? ""}
                className="h-full w-full object-contain p-6 transition-opacity duration-300"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-5 text-sm">
                No image available
              </div>
            )}

            {/* Prev/Next arrows for images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-dark shadow-sm transition hover:bg-white"
                  aria-label="Previous image"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button
                  onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-dark shadow-sm transition hover:bg-white"
                  aria-label="Next image"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 pb-4 pt-2">
              {images.map((img, idx) => (
                <button
                  key={img.id ?? idx}
                  onClick={() => setActiveImg(idx)}
                  className={clx(
                    "h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150",
                    activeImg === idx
                      ? "border-blue shadow-[0_0_0_2px_rgba(60,80,224,0.2)]"
                      : "border-transparent hover:border-gray-3"
                  )}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img
                    src={img.url ?? ""}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Product Info ── */}
        <div className="flex flex-col gap-5 overflow-y-auto p-6 md:w-[48%] md:p-8">
          {/* Category badge */}
          {product.categories && product.categories.length > 0 && (
            <span className="inline-flex w-fit items-center rounded-full bg-blue-light-5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-blue">
              {product.categories[0].name}
            </span>
          )}

          {/* Title */}
          <div>
            <h2 className="text-2xl font-semibold leading-tight text-dark">
              {product.title}
            </h2>
            {product.subtitle && (
              <p className="mt-1 text-sm text-dark-4">{product.subtitle}</p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            {priceDisplay?.price_type === "sale" ? (
              <>
                <span className="text-2xl font-bold text-dark">
                  {priceDisplay.calculated_price}
                </span>
                <span className="text-base font-medium text-dark-4 line-through">
                  {priceDisplay.original_price}
                </span>
                <span className="rounded-full bg-red-light-5 px-2 py-0.5 text-xs font-semibold text-red">
                  SALE
                </span>
              </>
            ) : priceDisplay ? (
              <span className="text-2xl font-bold text-dark">
                {priceDisplay.calculated_price}
              </span>
            ) : (
              <span className="text-base text-dark-4">Contact for price</span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm leading-relaxed text-dark-3 line-clamp-3">
              {product.description}
            </p>
          )}

          {/* Variant Options */}
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-4">
              {(product.options ?? []).map((option) => (
                <div key={option.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-dark">
                      {option.title}
                    </span>
                    {options[option.id] && (
                      <span className="text-sm text-dark-4">
                        · {options[option.id]}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(option.values ?? []).map((v) => {
                      const isSelected = options[option.id] === v.value
                      return (
                        <button
                          key={v.value}
                          onClick={() =>
                            setOptions((prev) => ({
                              ...prev,
                              [option.id]: v.value,
                            }))
                          }
                          className={clx(
                            "min-w-[52px] rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150 focus:outline-none",
                            isSelected
                              ? "border-blue bg-blue text-white shadow-[0_4px_12px_rgba(60,80,224,0.35)]"
                              : "border-gray-3 bg-white text-dark hover:border-blue hover:text-blue"
                          )}
                          data-testid="qv-option-button"
                        >
                          {v.value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add to Cart + Wishlist */}
          <div className="mt-auto flex items-center gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || !selectedVariant || isAdding || !isValidVariant}
              className={clx(
                "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200",
                added
                  ? "bg-green text-white"
                  : "bg-blue text-white hover:bg-blue-dark disabled:cursor-not-allowed disabled:bg-gray-4"
              )}
              data-testid="qv-add-to-cart"
            >
              {isAdding ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Adding...
                </span>
              ) : added ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                  Added to Cart!
                </span>
              ) : !selectedVariant && (product.variants?.length ?? 0) > 1 ? (
                "Select an option"
              ) : !inStock ? (
                "Out of Stock"
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-9H5.4M7 13L5.4 5M7 13l-2 9m0 0h14m-14 0a1 1 0 100 2 1 1 0 000-2zm14 0a1 1 0 100 2 1 1 0 000-2z"/>
                  </svg>
                  Add to Cart
                </>
              )}
            </button>

            <WishlistToggle
              item={wishlistItem}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-3 bg-white text-dark transition-all hover:border-blue hover:text-blue"
              iconClassName="h-5 w-5"
            />
          </div>

          {/* View Full Details Link */}
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-3 py-2.5 text-sm font-medium text-dark-3 transition-all hover:border-blue hover:text-blue"
            onClick={onClose}
          >
            View Full Details
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </LocalizedClientLink>
        </div>
      </div>

      <style>{`
        @keyframes qv-in {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-qv-in {
          animation: qv-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </div>
  )

  return createPortal(modalContent, document.body)
}
