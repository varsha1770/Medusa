"use client"

import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WishlistItemRow from "@modules/wishlist/components/wishlist-item"
import HeartIcon from "@modules/wishlist/components/heart-icon"
import { useWishlist } from "@modules/wishlist/hooks/use-wishlist"

const WishlistTemplate = () => {
  const { items, count, clearItems } = useWishlist()

  return (
    <div className="content-container py-8 small:py-12 font-euclid-circular-a text-dark">
      <div className="rounded-[28px] border border-gray-3 bg-gray-1/70 p-5 small:p-8">
        <div className="flex flex-col gap-4 small:flex-row small:items-center small:justify-between">
          <h2 className="text-2xl font-semibold text-dark">Your wishlist</h2>
          {count > 0 ? (
            <button
              type="button"
              onClick={clearItems}
              className="text-sm font-semibold text-blue transition-colors hover:text-blue-dark"
            >
              Clear wishlist
            </button>
          ) : null}
        </div>

        {count > 0 ? (
          <div className="mt-6 grid gap-4">
            {items.map((item) => (
              <WishlistItemRow key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center rounded-[28px] border border-dashed border-gray-3 bg-white px-6 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue/10 text-blue">
              <HeartIcon className="h-8 w-8" filled />
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-dark">Your wishlist is empty</h3>
            <p className="mt-3 max-w-md text-base leading-7 text-body">
              Save products from the store or any product page and they will appear here.
            </p>
            <LocalizedClientLink href="/store" className="mt-6 inline-flex">
              <Button className="h-11 rounded-lg bg-blue px-6 text-white hover:bg-blue-dark border-0 focus:outline-none focus:ring-0">
                Explore products
              </Button>
            </LocalizedClientLink>
          </div>
        )}
      </div>
    </div>
  )
}

export default WishlistTemplate
