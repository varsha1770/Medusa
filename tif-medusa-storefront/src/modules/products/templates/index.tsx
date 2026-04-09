import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div className="bg-white min-h-screen font-sans text-dark">
        <div
          className="max-w-[1280px] mx-auto px-4 small:px-8 flex flex-col small:flex-row small:items-start py-8 small:py-12 relative z-10 gap-x-8"
          data-testid="product-container"
        >
          {/* LEFT: Image Gallery (55% Split) */}
          <div className="block w-full small:w-[55%] relative">
            <ImageGallery images={images} />
          </div>

          {/* RIGHT: Product Info + Actions (Flat E-commerce Container, 45% Split) */}
          <div className="flex flex-col w-full small:w-[45%] small:sticky small:top-32 small:py-0 py-8 gap-y-4 small:max-w-none pl-4">
            <ProductOnboardingCta />
            <ProductInfo product={product} />

            <div className="mt-2 border-t border-gray-200">
              <Suspense
                fallback={
                  <ProductActions
                    disabled={true}
                    product={product}
                    region={region}
                  />
                }
              >
                <ProductActionsWrapper id={product.id} region={region} />
              </Suspense>
            </div>
            
            <div className="mt-8 border-t border-gray-200 pt-6">
              <ProductTabs product={product} />
            </div>
          </div>
        </div>
      </div>
      <div
        className="content-container my-16 small:my-24 font-euclid-circular-a"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
