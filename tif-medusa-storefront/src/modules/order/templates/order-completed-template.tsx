import { Heading } from "@medusajs/ui"
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { HttpTypes } from "@medusajs/types"
import { CheckCircleSolid } from "@medusajs/icons"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="py-12 min-h-[calc(100vh-64px)] bg-blue-50/10">
      <div className="content-container flex flex-col justify-center items-center gap-y-12 max-w-4xl h-full w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="flex flex-col gap-y-10 max-w-4xl h-full bg-white w-full p-10 rounded-[32px] shadow-[0_20px_50px_-20px_rgba(28,39,76,0.12)] border border-blue-50 animate-in fade-in slide-in-from-bottom-6 duration-700"
          data-testid="order-complete-container"
        >
          <div className="flex flex-col items-center justify-center text-center py-6 border-b border-gray-100">
            <CheckCircleSolid className="text-blue-600 w-20 h-20 mb-6 animate-in zoom-in spin-in-90 duration-700 delay-200" />
            <h1 className="text-4xl font-bold tracking-tight text-blue-950 mb-3 font-[350]">
              Thank you for your order!
            </h1>
            <p className="text-lg text-gray-500 font-[350]">
              We&apos;ve received your request and are preparing your items with care.
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <OrderDetails order={order} />
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
             <h2 className="text-3xl font-bold tracking-tight text-blue-950 mb-6 font-[350]">
              Order Summary
            </h2>
            <Items order={order} />
            <CartTotals totals={order} />
          </div>

          <div className="space-y-12 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <ShippingDetails order={order} />
            <PaymentDetails order={order} />
          </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
            <Help />
          </div>
        </div>
      </div>
    </div>
  )
}
