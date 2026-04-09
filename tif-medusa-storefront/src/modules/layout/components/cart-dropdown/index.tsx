"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"
import { updateLineItem, deleteLineItem } from "@lib/data/cart"
import { getDemoItems, DEMO_CART_UPDATED_EVENT, removeDemoItem, getDemoSubtotal, updateDemoItemQuantity } from "@lib/util/cart-demo"
import Spinner from "@modules/common/icons/spinner"

const CartItemQuantity = ({ item }: { item: HttpTypes.StoreCartLineItem }) => {
  const [updating, setUpdating] = useState(false)

  const handleQuantity = async (action: "add" | "reduce") => {
    if (updating) return
    const newQuantity = action === "add" ? item.quantity + 1 : item.quantity - 1

    if (newQuantity < 0) return 
    setUpdating(true)

    try {
      if (newQuantity === 0) {
        await deleteLineItem(item.id)
      } else {
        await updateLineItem({ lineId: item.id, quantity: newQuantity })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-x-2 mt-1 relative">
      <span className="text-xs text-gray-500 font-medium font-[350]">Qty:</span>
      <div className="flex items-center border border-gray-200 rounded-md bg-gray-50 overflow-hidden shadow-sm">
        <button
          onClick={() => handleQuantity("reduce")}
          disabled={updating}
          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors"
        >
          -
        </button>
        <span className="w-6 text-center text-[11px] font-semibold text-gray-800">{item.quantity}</span>
        <button
          onClick={() => handleQuantity("add")}
          disabled={updating}
          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors"
        >
          +
        </button>
      </div>
      {updating && (
        <span className="absolute -right-6 top-1.5 opacity-50">
          <Spinner />
        </span>
      )}
    </div>
  )
}

const DemoCartItemQuantity = ({ item }: { item: any }) => {
  const handleQuantity = (action: "add" | "reduce") => {
    const newQuantity = action === "add" ? item.quantity + 1 : item.quantity - 1
    updateDemoItemQuantity(item.variantId, newQuantity)
  }

  return (
    <div className="flex items-center gap-x-2 mt-1">
      <span className="text-xs text-gray-400 font-[350]">Qty:</span>
      <div className="flex items-center border border-gray-100 rounded bg-white overflow-hidden shadow-sm">
        <button
          onClick={() => handleQuantity("reduce")}
          className="w-5 h-5 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-xs font-bold"
        >
          -
        </button>
        <span className="px-2 text-center text-[10px] font-bold text-blue tracking-tight">{item.quantity}</span>
        <button
          onClick={() => handleQuantity("add")}
          className="w-5 h-5 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-xs font-bold"
        >
          +
        </button>
      </div>
    </div>
  )
}

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(
    undefined
  )
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)
  const [demoItems, setDemoItems] = useState<any[]>([])
 
  useEffect(() => {
    // Initial sync
    setDemoItems(getDemoItems())
 
    // Listen for updates
    const syncDemoCart = () => {
      setDemoItems(getDemoItems())
    }
 
    window.addEventListener(DEMO_CART_UPDATED_EVENT, syncDemoCart)
    return () => window.removeEventListener(DEMO_CART_UPDATED_EVENT, syncDemoCart)
  }, [])

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const totalItems =
    (cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0) + demoItems.reduce((acc, item) => acc + item.quantity, 0)
 
  const subtotal = (cartState?.subtotal ?? 0) + getDemoSubtotal()
  const itemRef = useRef<number>(totalItems || 0)

  const timedOpen = () => {
    open()

    const timer = setTimeout(close, 5000)

    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }

    open()
  }

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <div
      className="h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      <Popover className="relative h-full">
        <PopoverButton className="h-full">
          <LocalizedClientLink
            className="storefront-nav-action-link"
            href="/cart"
            data-testid="nav-cart-link"
          >{`Cart (${totalItems})`}</LocalizedClientLink>
        </PopoverButton>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="storefront-nav-panel hidden small:block absolute top-[calc(100%+1px)] right-0 w-[360px] text-ui-fg-base shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-b-xl"
            data-testid="nav-cart-dropdown"
          >
            <div className="p-4 flex items-center justify-center">
              <h3 className="text-large-semi font-[350]">Cart</h3>
            </div>
            {(cartState?.items?.length || demoItems.length) ? (
              <>
                <div className="overflow-y-scroll max-h-[402px] px-8 grid grid-cols-1 gap-y-8 no-scrollbar p-px">
                  {/* Render Demo Items */}
                  {demoItems.map((item) => (
                    <div
                      className="grid grid-cols-[122px_1fr] gap-x-4"
                      key={item.variantId}
                      data-testid="cart-item"
                    >
                      <LocalizedClientLink
                        href={`/products/${item.handle}`}
                        className="w-24"
                      >
                        <Thumbnail
                          thumbnail={item.thumbnail}
                          images={[]}
                          size="square"
                        />
                      </LocalizedClientLink>
                      <div className="flex flex-col justify-between flex-1">
                        <div className="flex flex-col flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col overflow-ellipsis whitespace-nowrap mr-4 w-[180px]">
                              <h3 className="text-base-regular overflow-hidden text-ellipsis font-[350]">
                                <LocalizedClientLink
                                  href={`/products/${item.handle}`}
                                >
                                  {item.title}
                                </LocalizedClientLink>
                              </h3>
                              <DemoCartItemQuantity item={item} />
                            </div>
                            <div className="flex justify-end font-bold text-blue-950 tracking-tight pr-1">
                               ₹{item.price * item.quantity}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeDemoItem(item.variantId)}
                          className="mt-1 text-xs text-red-400 text-left hover:underline font-[350]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Render Real Items */}
                  {cartState?.items?.sort((a, b) => {
                      return (a.created_at ?? "") > (b.created_at ?? "")
                        ? -1
                        : 1
                    })
                    .map((item) => (
                      <div
                        className="grid grid-cols-[122px_1fr] gap-x-4"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          className="w-24"
                        >
                          <Thumbnail
                            thumbnail={item.thumbnail}
                            images={item.variant?.product?.images}
                            variant={item.variant}
                            size="square"
                          />
                        </LocalizedClientLink>
                        <div className="flex flex-col justify-between flex-1">
                          <div className="flex flex-col flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col overflow-ellipsis whitespace-nowrap mr-4 w-[180px]">
                                <h3 className="text-base-regular overflow-hidden text-ellipsis">
                                  <LocalizedClientLink
                                    href={`/products/${item.product_handle}`}
                                    data-testid="product-link"
                                  >
                                    {item.title}
                                  </LocalizedClientLink>
                                </h3>
                                <LineItemOptions
                                  variant={item.variant}
                                  data-testid="cart-item-variant"
                                  data-value={item.variant}
                                />
                                <CartItemQuantity item={item} />
                              </div>
                              <div className="flex justify-end font-bold text-blue-950 tracking-tight pr-1">
                                <LineItemPrice
                                  item={item}
                                  style="tight"
                                  currencyCode={cartState.currency_code}
                                />
                              </div>
                            </div>
                          </div>
                          <DeleteButton
                            id={item.id}
                            className="mt-1"
                            data-testid="cart-item-remove-button"
                          >
                            Remove
                          </DeleteButton>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="p-8 flex flex-col gap-y-4 text-small-regular border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-ui-fg-base font-semibold">
                      Subtotal{" "}
                      <span className="font-normal">(excl. taxes)</span>
                    </span>
                    <span
                      className="text-large-semi text-blue-950 font-bold tracking-tight pr-1"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cartState?.currency_code || "inr",
                      })}
                    </span>
                  </div>
                  <LocalizedClientLink href="/cart" passHref>
                    <Button
                      className="w-full bg-blue text-white hover:bg-blue-dark border-0 focus:outline-none focus:ring-0 active:outline-none active:ring-0"
                      size="large"
                      data-testid="go-to-cart-button"
                    >
                      Go to cart
                    </Button>
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center bg-white rounded-b-xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-[17px] shadow-sm mb-1 group transition-transform hover:scale-105 duration-300">
                  <span className="transition-all duration-300 ease-in-out group-hover:scale-110">0</span>
                </div>
                <p className="mt-3 text-[17px] font-semibold tracking-wide text-dark">Your shopping bag is empty</p>
                <p className="mt-2 text-[13px] leading-relaxed text-gray-500 max-w-[250px]">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <LocalizedClientLink href="/store" className="mt-6 w-[75%] max-w-[200px] mx-auto block">
                  <span onClick={close} className="flex items-center justify-center h-10 w-full rounded-[4px] bg-blue-600 text-white font-bold tracking-widest text-[11px] uppercase cursor-pointer hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)] transition-all duration-300">
                    Explore Products
                  </span>
                </LocalizedClientLink>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
