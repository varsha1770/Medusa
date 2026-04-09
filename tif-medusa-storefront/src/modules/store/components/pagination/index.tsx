"use client"

import { clx } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function Pagination({
  page,
  totalPages,
  "data-testid": dataTestid,
}: {
  page: number
  totalPages: number
  "data-testid"?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const arrayRange = (start: number, stop: number) =>
    Array.from({ length: stop - start + 1 }, (_, index) => start + index)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const renderPageButton = (
    targetPage: number,
    label: string | number,
    isCurrent: boolean
  ) => (
    <button
      key={targetPage}
      className={clx(
        "flex h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors",
        {
          "border-grey-90 bg-grey-90 text-white": isCurrent,
          "border-black/10 bg-white text-ui-fg-muted hover:border-black/20 hover:text-ui-fg-base":
            !isCurrent,
        }
      )}
      disabled={isCurrent}
      aria-current={isCurrent ? "page" : undefined}
      onClick={() => handlePageChange(targetPage)}
    >
      {label}
    </button>
  )

  const renderNavButton = (
    targetPage: number,
    label: string,
    disabled: boolean
  ) => (
    <button
      key={label}
      className={clx(
        "flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium uppercase tracking-[0.18em] transition-colors",
        {
          "border-black/10 bg-white text-ui-fg-base hover:border-black/20":
            !disabled,
          "cursor-not-allowed border-black/5 bg-stone-100 text-ui-fg-muted":
            disabled,
        }
      )}
      disabled={disabled}
      onClick={() => handlePageChange(targetPage)}
    >
      {label}
    </button>
  )

  const renderEllipsis = (key: string) => (
    <span
      key={key}
      className="flex h-11 min-w-11 items-center justify-center text-sm font-medium text-ui-fg-muted"
    >
      ...
    </span>
  )

  const renderPageButtons = () => {
    const buttons = []

    if (totalPages <= 7) {
      buttons.push(
        ...arrayRange(1, totalPages).map((targetPage) =>
          renderPageButton(targetPage, targetPage, targetPage === page)
        )
      )
    } else if (page <= 4) {
      buttons.push(
        ...arrayRange(1, 5).map((targetPage) =>
          renderPageButton(targetPage, targetPage, targetPage === page)
        )
      )
      buttons.push(renderEllipsis("ellipsis1"))
      buttons.push(renderPageButton(totalPages, totalPages, totalPages === page))
    } else if (page >= totalPages - 3) {
      buttons.push(renderPageButton(1, 1, 1 === page))
      buttons.push(renderEllipsis("ellipsis2"))
      buttons.push(
        ...arrayRange(totalPages - 4, totalPages).map((targetPage) =>
          renderPageButton(targetPage, targetPage, targetPage === page)
        )
      )
    } else {
      buttons.push(renderPageButton(1, 1, 1 === page))
      buttons.push(renderEllipsis("ellipsis3"))
      buttons.push(
        ...arrayRange(page - 1, page + 1).map((targetPage) =>
          renderPageButton(targetPage, targetPage, targetPage === page)
        )
      )
      buttons.push(renderEllipsis("ellipsis4"))
      buttons.push(renderPageButton(totalPages, totalPages, totalPages === page))
    }

    return buttons
  }

  return (
    <div className="mt-10 flex w-full justify-center">
      <div
        className="flex flex-wrap items-center justify-center gap-3 rounded-[28px] border border-black/5 bg-white px-4 py-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.45)] small:px-6"
        data-testid={dataTestid}
      >
        {renderNavButton(page - 1, "Prev", page <= 1)}
        {renderPageButtons()}
        {renderNavButton(page + 1, "Next", page >= totalPages)}
      </div>
    </div>
  )
}
