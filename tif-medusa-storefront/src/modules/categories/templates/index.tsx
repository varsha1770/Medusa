import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  const furnitureLabels = [
    "Living Room",
    "Bedroom",
    "Sofas",
    "Dining",
    "Storage",
    "Decor",
    "Sale",
  ]

  // Mock mapping logic consistent with NavCategorySlider
  const getBoutiqueName = (name: string) => {
    const defaultLabels = ["Shirts", "Sweatshirts", "Pants", "Merch"]
    const index = defaultLabels.indexOf(name)
    return index !== -1 ? furnitureLabels[index] : name
  }

  return (
    <div className="flex flex-col gap-y-12 py-12 small:py-24" data-testid="category-container">
      {/* Cinematic Category Header */}
      <div className="flex flex-col items-center text-center space-y-4 mb-8 px-4 animate-in fade-in slide-in-from-top-4 duration-1000">
        <span className="text-blue-600 font-bold uppercase tracking-[0.3em] text-[10px]">
          {parents.length > 0 ? parents.reverse().map(p => getBoutiqueName(p.name)).join(" / ") : "Explore Collection"}
        </span>
        <h1 className="text-4xl lg:text-6xl text-blue-950 font-[350] tracking-tighter capitalize transition-all duration-700">
          {getBoutiqueName(category.name)} <span className="text-blue-600">.</span>
        </h1>
        {category.description && (
           <p className="max-w-[600px] text-gray-500 text-sm lg:text-base leading-relaxed font-medium">
             {category.description}
           </p>
        )}
      </div>

      <div className="min-w-0 content-container animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        {category.category_children && category.category_children.length > 0 && (
          <div className="mb-12 flex flex-wrap justify-center gap-4">
            {category.category_children.map((c) => (
              <LocalizedClientLink 
                key={c.id} 
                href={`/categories/${c.handle}`}
                className="px-6 py-2 rounded-full border border-blue-100 bg-white text-blue-950 text-xs font-bold uppercase tracking-widest hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm"
              >
                {getBoutiqueName(c.name)}
              </LocalizedClientLink>
            ))}
          </div>
        )}

        <div className="w-full">
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={category.products?.length ?? 8}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              categoryId={category.id}
              countryCode={countryCode}
              enableGridToggle={true}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
