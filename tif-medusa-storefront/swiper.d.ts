declare module "swiper/react" {
  import type { ComponentType, ReactNode } from "react"

  export const Swiper: ComponentType<Record<string, unknown> & { children?: ReactNode }>
  export const SwiperSlide: ComponentType<Record<string, unknown> & { children?: ReactNode }>
}

declare module "swiper/modules" {
  export const FreeMode: unknown
  export const Navigation: unknown
  export const Autoplay: unknown
  export const Pagination: unknown
}

declare module "swiper/css"
declare module "swiper/css/free-mode"
declare module "swiper/css/navigation"
declare module "swiper/css/pagination"
