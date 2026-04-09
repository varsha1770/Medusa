"use client"

import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import { useMemo, useEffect, useState } from "react"
import { getDemoItems, DEMO_CART_UPDATED_EVENT } from "@lib/util/cart-demo"

const CartTemplate = ({
  cart: serverCart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
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

  // Merge Medusa Cart with Demo Cart
  const cart = useMemo(() => {
    if (!serverCart && demoItems.length === 0) return null

    const baseCart = serverCart || {
      id: "demo-cart",
      items: [],
      region_id: "",
      currency_code: "inr",
      subtotal: 0,
      total: 0,
      region: { id: "demo-region", currency_code: "inr" }
    }

    const formattedDemoItems = demoItems.map((item) => ({
      id: `demo-${item.variantId}`,
      variant_id: item.variantId,
      title: item.title,
      quantity: item.quantity,
      unit_price: item.price,
      total: item.price * item.quantity,
      thumbnail: item.thumbnail,
      product_handle: item.handle,
      variant: { 
        id: item.variantId,
        title: "Default",
        product: {
          handle: item.handle,
          images: item.thumbnail ? [{ url: item.thumbnail }] : []
        }
      }
    }))

    const combinedItems = [...(serverCart?.items || []), ...formattedDemoItems]
    
    return {
      ...baseCart,
      items: combinedItems,
      subtotal: combinedItems.reduce((acc, item) => acc + (item.total || 0), 0),
    } as any
  }, [serverCart, demoItems])
  return (
    <div className="py-12 font-euclid-circular-a text-dark bg-white">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-40">
            <div className="flex flex-col bg-gray-1 rounded-lg py-6 px-6 gap-y-6 border border-gray-3">
              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}
              <ItemsTemplate cart={cart} />
            </div>
            <div className="relative">
              <div className="flex flex-col gap-y-8 sticky top-12">
                {cart && cart.region && (
                  <>
                    <div className="bg-gray-1 rounded-lg py-6 px-6 border border-gray-3">
                      <Summary cart={cart as any} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
