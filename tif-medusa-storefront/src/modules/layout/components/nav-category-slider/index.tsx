"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Navigation, Autoplay } from "swiper/modules"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"

import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/navigation"

type Category = {
  id: string
  handle: string
  name: string
}

type NavCategorySliderProps = {
  categories: Category[]
}

const NavCategorySlider = ({ categories }: NavCategorySliderProps) => {
  const pathname = usePathname()

  const furnitureLabels = [
    "Living Room",
    "Bedroom",
    "Sofas",
    "Dining",
    "Storage",
    "Decor",
    "Sale",
  ]

  const links = [
    { href: "/", label: "Home" },
    { href: "/store", label: "Store" },
    ...categories.map((c: Category, i: number) => ({
      href: `/categories/${c.handle}`,
      label: furnitureLabels[i] || c.name,
    })),
  ]

  return (
    <div className="relative flex items-center h-full w-full nav-category-slider">
      <Swiper
        modules={[FreeMode, Navigation, Autoplay]}
        slidesPerView="auto"
        freeMode
        navigation
        spaceBetween={0}
        className="!w-full !h-full"
      >
        {links.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/" || pathname.endsWith("/")
              : pathname.includes(link.href)

          return (
            <SwiperSlide key={link.href} className="!w-auto">
              <LocalizedClientLink
                href={link.href}
                className={`
                  nav-cat-link
                  flex items-center h-14 px-5 text-sm font-medium whitespace-nowrap transition-colors
                  ${isActive
                    ? "text-blue border-b-2 border-blue"
                    : "text-dark-4 hover:text-dark border-b-2 border-transparent"
                  }
                `}
              >
                {link.label}
              </LocalizedClientLink>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}

export default NavCategorySlider
