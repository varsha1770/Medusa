"use client"

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react"
import { Fragment, useState } from "react"
import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import HeartIcon from "@modules/wishlist/components/heart-icon"
import { useWishlist } from "@modules/wishlist/hooks/use-wishlist"
import { convertToLocale } from "@lib/util/money"

const WishlistDropdown = () => {
  const { items, count, removeItem, updateQuantity } = useWishlist()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative h-full z-50" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Popover className="relative h-full">
        <PopoverButton className="h-full">
          <LocalizedClientLink
            className="storefront-nav-action-link h-full"
            href="/wishlist"
            data-testid="nav-wishlist-link"
          >
            <HeartIcon className="h-4 w-4" filled={count > 0} />
            <span>{`Wishlist (${count})`}</span>
          </LocalizedClientLink>
        </PopoverButton>
        <Transition
          show={open}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel static className="storefront-nav-panel hidden small:block absolute top-[calc(100%+1px)] right-0 w-[420px] text-dark" data-testid="nav-wishlist-dropdown">
            <div className="flex items-center justify-between border-b border-gray-3 px-5 py-4">
              <h3 className="text-lg font-semibold">Wishlist</h3>
              <span className="text-sm text-dark-4">{count} saved</span>
            </div>
            {count > 0 ? (
              <>
                <div className="grid max-h-[380px] gap-4 overflow-y-auto px-5 py-5 no-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-[84px_1fr] gap-4">
                      <LocalizedClientLink href={`/products/${item.handle}`} className="block">
                        <Thumbnail thumbnail={item.thumbnail ?? null} images={[]} size="square" />
                      </LocalizedClientLink>
                      <div className="min-w-0 flex flex-col">
                        <LocalizedClientLink href={`/products/${item.handle}`} className="block">
                          <h4 className="truncate text-sm font-semibold text-dark">{item.title}</h4>
                        </LocalizedClientLink>
                        {item.variantTitle && (
                          <p className="mt-0.5 text-xs text-gray-500 font-[350]">
                            Size: <span className="font-semibold text-blue">{item.variantTitle}</span>
                          </p>
                        )}
                        <div className="flex items-center gap-x-2 mt-2">
                           <div className="flex items-center border border-gray-100 rounded bg-white overflow-hidden shadow-sm">
                              <button
                                onClick={() => updateQuantity(item.id, (item.quantity ?? 1) - 1)}
                                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors text-xs"
                              >
                                -
                              </button>
                              <span className="px-2 text-center text-[10px] font-bold text-blue tracking-tight">{item.quantity ?? 1}</span>
                              <button
                                onClick={() => updateQuantity(item.id, (item.quantity ?? 1) + 1)}
                                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors text-xs"
                              >
                                +
                              </button>
                           </div>
                           {item.amount && item.currency_code ? (
                             <span className="text-[12px] font-bold text-blue tracking-tight ml-auto">
                               {convertToLocale({
                                 amount: item.amount * (item.quantity ?? 1),
                                 currency_code: item.currency_code,
                               })}
                             </span>
                           ) : (
                             item.price && <span className="text-[12px] font-bold text-blue tracking-tight ml-auto">{item.price}</span>
                           )}
                        </div>
                        <button type="button" onClick={() => removeItem(item.id)} className="mt-3 text-[10px] uppercase font-bold text-red-400 text-left hover:underline tracking-widest inline-block w-fit">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-3 px-5 py-4">
                  <LocalizedClientLink href="/wishlist" className="block">
                    <Button className="h-11 w-full rounded-lg bg-blue text-white hover:bg-blue-dark border-0 focus:outline-none focus:ring-0">
                      View wishlist
                    </Button>
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue/10 text-blue">
                  <HeartIcon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-base font-semibold text-dark">No saved items yet</p>
                <p className="mt-2 text-sm leading-6 text-body">Save products from the storefront and they will appear here.</p>
                <LocalizedClientLink href="/store" className="mt-5 inline-flex">
                  <Button className="h-10 rounded-lg bg-blue px-5 text-white hover:bg-blue-dark border-0 focus:outline-none focus:ring-0">
                    Browse store
                  </Button>
                </LocalizedClientLink>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default WishlistDropdown
