import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  q,
  gridColumns,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  q?: string
  gridColumns: 4 | 5
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="flex flex-col gap-y-12 py-12 small:py-24" data-testid="category-container">
      {/* Cinematic Boutique Header */}
      <div className="flex flex-col items-center text-center space-y-4 mb-8 px-4 animate-in fade-in slide-in-from-top-4 duration-1000">
        <span className="text-blue-600 font-bold uppercase tracking-[0.3em] text-[10px]">
          Our Curated Collections
        </span>
        <h1 className="text-4xl lg:text-6xl text-blue-950 font-[350] tracking-tighter">
          Boutique Store <span className="text-blue-600">.</span>
        </h1>
        <p className="max-w-[600px] text-gray-500 text-sm lg:text-base leading-relaxed font-medium">
          Elevating modern living through artisanal furniture and timeless design. 
          Experience the art of home with our masterfully crafted pieces.
        </p>
      </div>

      <div className="min-w-0 content-container animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            q={q}
            gridColumns={gridColumns}
            enableGridToggle
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
