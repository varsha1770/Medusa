"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, useRouter } from "next/navigation"
import { FormEvent, useEffect, useMemo, useRef, useState } from "react"

type SearchSuggestion = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
}

const MIN_QUERY_LENGTH = 2

export default function NavSearch() {
  const { countryCode } = useParams<{ countryCode: string }>()
  const router = useRouter()
  const rootRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const trimmedQuery = useMemo(() => query.trim(), [query])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", onPointerDown)

    return () => {
      document.removeEventListener("mousedown", onPointerDown)
    }
  }, [])

  useEffect(() => {
    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setResults([])
      setIsLoading(false)
      setIsOpen(false)
      return
    }

    const controller = new AbortController()

    const timer = setTimeout(async () => {
      setIsLoading(true)

      try {
        const searchParams = new URLSearchParams({ q: trimmedQuery })

        if (countryCode) {
          searchParams.set("countryCode", countryCode)
        }

        const response = await fetch(`/api/products/search?${searchParams.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error("Failed to fetch product suggestions")
        }

        const payload = (await response.json()) as { products?: SearchSuggestion[] }
        setResults(payload.products ?? [])
        setIsOpen(true)
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([])
          setIsOpen(true)
        }
      } finally {
        setIsLoading(false)
      }
    }, 220)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [trimmedQuery, countryCode])

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      return
    }

    setIsOpen(false)
    router.push(`/${countryCode}/store?q=${encodeURIComponent(trimmedQuery)}`)
  }

  return (
    <div
      ref={rootRef}
      className="hidden small:flex items-center w-full max-w-[520px] justify-self-center relative"
    >
      <form className="w-full" onSubmit={onSubmit}>
        <div className="storefront-nav-search-shell">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-ui-fg-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            type="search"
            name="search"
            placeholder="Search products"
            className="storefront-nav-search-input"
            value={query}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => {
              if (trimmedQuery.length >= MIN_QUERY_LENGTH) {
                setIsOpen(true)
              }
            }}
            aria-label="Search products"
          />

          <button type="submit" className="storefront-nav-search-submit" aria-label="Submit search">
            Search
          </button>
        </div>
      </form>

      {isOpen && (
        <div className="storefront-nav-search-dropdown">
          {isLoading ? (
            <p className="storefront-nav-search-state">Searching...</p>
          ) : results.length > 0 ? (
            <ul className="storefront-nav-search-list">
              {results.map((result) => (
                <li key={result.id}>
                  <LocalizedClientLink
                    href={`/products/${result.handle}`}
                    className="storefront-nav-search-item"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="storefront-nav-search-thumb" aria-hidden="true">
                      {result.thumbnail ? (
                        <img src={result.thumbnail} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] uppercase tracking-[0.14em] text-ui-fg-muted">No image</span>
                      )}
                    </span>
                    <span className="storefront-nav-search-title">{result.title}</span>
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="storefront-nav-search-state">No products found.</p>
          )}

          {!isLoading && trimmedQuery.length >= MIN_QUERY_LENGTH && (
            <div className="storefront-nav-search-footer">
              <LocalizedClientLink
                href={`/store?q=${encodeURIComponent(trimmedQuery)}`}
                className="storefront-nav-search-all-link"
                onClick={() => setIsOpen(false)}
              >
                View all results
              </LocalizedClientLink>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
