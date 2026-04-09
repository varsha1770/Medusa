import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info" className="flex flex-col gap-y-2 font-sans">
      {product.collection && (
        <LocalizedClientLink
          href={`/collections/${product.collection.handle}`}
          className="text-xl font-bold tracking-wide text-dark uppercase mb-1 hover:text-blue transition-colors"
        >
          {product.collection.title}
        </LocalizedClientLink>
      )}
      <Heading
        level="h2"
        className="text-xl font-normal text-gray-500 leading-tight mb-2"
        data-testid="product-title"
      >
        {product.title}
      </Heading>

      <div
        className="text-[15px] text-gray-600 whitespace-pre-line leading-relaxed mb-2"
        data-testid="product-description"
      >
        {product.description}
      </div>
    </div>
  )
}

export default ProductInfo
