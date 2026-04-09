import Image from "next/image"
import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import NavSearch from "@modules/layout/components/nav-search"
import SideMenu from "@modules/layout/components/side-menu"
import { listCategories } from "@lib/data/categories"
import NavCategorySlider from "@modules/layout/components/nav-category-slider"
import WishlistButton from "@modules/layout/components/wishlist-button"

export default async function Nav() {
  const [regions, locales, currentLocale, categories] = await Promise.all([
    listRegions().catch(() => []), 
    listLocales().catch(() => []),
    getLocale().catch(() => "en-US"),
    listCategories().catch(() => []),
  ])

  const topLevelCategories = categories?.filter(
    (c) => !c.parent_category
  )

  return (
    <div className="sticky top-0 inset-x-0 z-50 group bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <header className="storefront-nav-shell relative mx-auto duration-200">
        <nav className="storefront-nav-top content-container w-full py-4 flex items-center justify-between">
          <div className="flex items-center h-full min-w-0">
            <LocalizedClientLink
              href="/"
              className="font-[650] text-xl tracking-tighter text-dark hover:text-blue transition-all duration-300 flex items-center gap-2"
              data-testid="nav-store-link"
            >
              <Image
                src="/images/logo/TIFLabs-Logo-only.png"
                alt="Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
              Tif Medusa <span className="text-blue">.</span>
            </LocalizedClientLink>
          </div>

          <div className="flex-grow max-w-md mx-8 hidden md:block">
            <NavSearch />
          </div>

          <div className="storefront-nav-actions flex items-center gap-x-6 h-full font-[650] text-sm">
            <WishlistButton />
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-blue"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
            <div className="hidden small:flex items-center h-full">
              <LocalizedClientLink
                className="hover:text-blue transition-all"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
          </div>
        </nav>

        <div className="storefront-nav-secondary border-t border-gray-50 h-12 flex items-center">
          <div className="storefront-nav-secondary-inner content-container flex items-center h-full">
            <div className="small:hidden h-full flex items-center mr-2 shrink-0">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>
            <NavCategorySlider categories={topLevelCategories ?? []} />
          </div>
        </div>
      </header>
    </div>
  )
}
