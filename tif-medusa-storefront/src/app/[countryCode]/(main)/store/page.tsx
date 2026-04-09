import { Metadata } from "next"

export const dynamic = "force-dynamic"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    q?: string
    grid?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page, q, grid } = searchParams
  const gridColumns = grid === "4" ? 4 : 5

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      q={q}
      gridColumns={gridColumns}
      countryCode={params.countryCode}
    />
  )
}
