import { Heading } from "@medusajs/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  return (
    <div className="sticky top-12 flex flex-col-reverse small:flex-col gap-y-8 py-8 small:py-0">
      <div className="w-full bg-blue-50/15 border border-blue-100/50 rounded-[32px] p-8 flex flex-col shadow-[0_20px_60px_-20px_rgba(28,39,76,0.18)] backdrop-blur-sm animate-in fade-in slide-in-from-right-4 duration-700">
        <h2 className="flex flex-row text-2xl font-bold tracking-tight text-blue-950 font-[350]">
          In your Cart
        </h2>
        <div className="mt-8">
          <CartTotals totals={cart} />
        </div>
        <div className="mt-8">
          <ItemsPreviewTemplate cart={cart} />
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
