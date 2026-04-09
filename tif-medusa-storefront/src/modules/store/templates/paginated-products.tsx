import { listProductsWithSort } from "@lib/data/products"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreProductCard from "@modules/store/components/store-product-card"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  q?: string
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  q,
  gridColumns = 5,
  enableGridToggle = false,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  q?: string
  gridColumns?: 4 | 5
  enableGridToggle?: boolean
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (q) {
    queryParams["q"] = q
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)
  const productsGridClass =
    gridColumns === 4
      ? "grid w-full grid-cols-4 gap-4"
      : "grid w-full grid-cols-5 gap-4"

  const isDefaultSort = !sortBy || sortBy === "created_at"

  const buildGridHref = (nextGridColumns: 4 | 5) => {
    const params = new URLSearchParams()

    if (sortBy) {
      params.set("sortBy", sortBy)
    }

    if (page > 1) {
      params.set("page", String(page))
    }

    if (q) {
      params.set("q", q)
    }

    params.set("grid", String(nextGridColumns))

    return `?${params.toString()}`
  }

  const buildSortHref = (nextSort: SortOptions) => {
    const params = new URLSearchParams()

    if (nextSort !== "created_at") {
      params.set("sortBy", nextSort)
    }

    if (q) {
      params.set("q", q)
    }

    params.set("grid", String(gridColumns))

    return `?${params.toString()}`
  }

  const buildClearHref = () => `?grid=${gridColumns}`

  return (
    <>
      {enableGridToggle && (
        <div className="mb-12 flex flex-wrap items-center justify-between gap-6 px-4 py-4 md:px-8 bg-white border border-blue-50 shadow-sm rounded-full" data-testid="grid-toggle">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-900 border-r border-blue-100 pr-4">Refine</span>
            <div className="flex items-center gap-1">
              <a
                href={buildSortHref("created_at")}
                className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all ${
                  isDefaultSort
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "text-gray-400 hover:text-blue-950 hover:bg-blue-50"
                }`}
                data-testid="sort-created-at"
              >
                Latest
              </a>
              <a
                href={buildSortHref("price_asc")}
                className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all ${
                  sortBy === "price_asc"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "text-gray-400 hover:text-blue-950 hover:bg-blue-50"
                }`}
                data-testid="sort-price-asc"
              >
                € Low-High
              </a>
              <a
                href={buildSortHref("price_desc")}
                className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all ${
                  sortBy === "price_desc"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "text-gray-400 hover:text-blue-950 hover:bg-blue-50"
                }`}
                data-testid="sort-price-desc"
              >
                € High-Low
              </a>
            </div>
            
            {(sortBy || q) && (
              <a
                href={buildClearHref()}
                className="text-[10px] uppercase font-[350] tracking-widest text-red-400 hover:text-red-600 transition-colors ml-2 underline underline-offset-4"
                data-testid="clear-filters"
              >
                Clear All
              </a>
            )}
          </div>

          <div className="flex items-center gap-4 bg-gray-50/50 p-1 rounded-full border border-gray-100">
            <a
              href={buildGridHref(4)}
              className={`p-2 rounded-full transition-all ${
                gridColumns === 4
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-400 hover:text-blue-950"
              }`}
              data-testid="grid-toggle-4"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </a>
            <a
              href={buildGridHref(5)}
              className={`p-2 rounded-full transition-all ${
                gridColumns === 5
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-400 hover:text-blue-950"
              }`}
              data-testid="grid-toggle-5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="5" height="5"></rect><rect x="9" y="2" width="5" height="5"></rect><rect x="16" y="2" width="5" height="5"></rect><rect x="2" y="9" width="5" height="5"></rect><rect x="9" y="9" width="5" height="5"></rect><rect x="16" y="9" width="5" height="5"></rect><rect x="2" y="16" width="5" height="5"></rect><rect x="9" y="16" width="5" height="5"></rect><rect x="16" y="16" width="5" height="5"></rect></svg>
            </a>
          </div>
        </div>
      )}
      <ul
        className={productsGridClass}
        data-testid="products-list"
      >
        {products.map((product, index) => {
          return (
            <li 
              key={product.id} 
              className="h-full animate-in fade-in slide-in-from-bottom-8 duration-700 p-px"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            >
              <StoreProductCard product={product} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
