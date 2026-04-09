"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"

import SortProducts, { SortOptions } from "./sort-products"

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  "data-testid"?: string
}

const RefinementList = ({
  sortBy,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const [isSortOpen, setIsSortOpen] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  const resetFilters = () => {
    router.push(pathname)
  }

  return (
    <div className="flex flex-col gap-6" data-testid={dataTestId}>
      <div className="storefront-filter-toolbar">
        <div className="flex items-center justify-between">
          <p className="text-blue-900 font-bold uppercase text-[10px] tracking-widest">Filters:</p>
          <button
            type="button"
            onClick={resetFilters}
            className="text-blue text-sm font-medium transition-all hover:text-blue-700 hover:scale-105"
          >
            Clean All
          </button>
        </div>
      </div>

      <div className="storefront-filter-section border-blue/5">
        <div
          onClick={() => setIsSortOpen((prev) => !prev)}
          className="storefront-filter-section-header bg-blue/5 rounded-lg px-4"
        >
          <p className="text-blue font-bold text-sm tracking-wide">Sort By</p>
          <button
            type="button"
            aria-label="Toggle sort filters"
            className={`text-blue transition-transform duration-300 ${
              isSortOpen ? "rotate-180" : ""
            }`}
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              />
            </svg>
          </button>
        </div>

        <div className={isSortOpen ? "storefront-filter-section-body" : "hidden"}>
          <SortProducts
            sortBy={sortBy}
            setQueryParams={setQueryParams}
            data-testid={dataTestId}
            compact
          />
        </div>
      </div>
    </div>
  )
}

export default RefinementList
