import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-ui-bg-subtle animate-pulse rounded" />
  }

  return (
    <div className="flex flex-col text-dark font-sans">
      <div className="flex items-baseline gap-x-3">
        <span
          className={clx("text-2xl font-bold", {
            "text-dark": true,
          })}
        >
          {!variant && <span className="font-normal text-gray-600 mr-1 text-xl">From</span>}
          <span
            data-testid="product-price"
            data-value={selectedPrice.calculated_price_number}
          >
            {selectedPrice.calculated_price}
          </span>
        </span>
        
        {selectedPrice.price_type === "sale" && (
          <>
            <span
              className="line-through text-gray-500 text-lg font-normal mb-0.5"
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              {selectedPrice.original_price}
            </span>
            <span className="text-[#FF905A] text-lg font-bold tracking-wide mb-0.5">
              ({selectedPrice.percentage_diff}% OFF)
            </span>
          </>
        )}
      </div>
      
      <span className="text-[13px] text-green-700 font-semibold mt-1">
        inclusive of all taxes
      </span>
    </div>
  )
}
