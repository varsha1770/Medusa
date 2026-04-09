import { sdk } from "@lib/config"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

type SearchSuggestion = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim()

  if (q.length < 2) {
    return NextResponse.json({ products: [] })
  }

  const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? "6")
  const limit = clamp(Number.isNaN(limitParam) ? 6 : limitParam, 1, 8)
  const countryCode = (request.nextUrl.searchParams.get("countryCode") ?? "us").toLowerCase()

  try {
    const region = await getRegion(countryCode)

    const query: HttpTypes.StoreProductListParams = {
      q,
      limit,
    }

    if (region?.id) {
      query.region_id = region.id
    }

    const { products } = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
      "/store/products",
      {
        method: "GET",
        query,
        cache: "no-store",
      }
    )

    const payload: SearchSuggestion[] = products
      .filter((product) => !!product.handle)
      .map((product) => ({
        id: product.id,
        handle: product.handle as string,
        title: product.title,
        thumbnail: product.thumbnail ?? null,
      }))

    return NextResponse.json({ products: payload })
  } catch {
    return NextResponse.json({ products: [] })
  }
}