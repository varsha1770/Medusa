import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { buildWishlistItem } from "@lib/util/wishlist"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WishlistToggle from "@modules/wishlist/components/wishlist-toggle"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })

  const wishlistItem = buildWishlistItem({
    product,
  })

  return (
    <div className="group relative" data-testid="product-wrapper">
      <WishlistToggle
        item={wishlistItem}
        className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/90 text-dark shadow-[0_10px_28px_-18px_rgba(28,39,76,0.65)] backdrop-blur transition-colors hover:border-blue hover:text-blue"
        iconClassName="h-5 w-5"
      />
      <LocalizedClientLink href={`/products/${product.handle}`} className="block">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="mt-4 flex justify-between txt-compact-medium">
          <Text className="text-ui-fg-subtle" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </LocalizedClientLink>
    </div>
  )
}
