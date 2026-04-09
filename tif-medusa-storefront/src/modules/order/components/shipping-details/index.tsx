import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  return (
    <div className="flex flex-col gap-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="flex flex-col"
          data-testid="shipping-address-summary"
        >
          <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2">Shipping Address</Text>
          <div className="text-blue-950 font-[350] leading-relaxed">
            <p>{order.shipping_address?.first_name} {order.shipping_address?.last_name}</p>
            <p>{order.shipping_address?.address_1} {order.shipping_address?.address_2}</p>
            <p>{order.shipping_address?.postal_code}, {order.shipping_address?.city}</p>
            <p>{order.shipping_address?.country_code?.toUpperCase()}</p>
          </div>
        </div>

        <div
          className="flex flex-col"
          data-testid="shipping-contact-summary"
        >
          <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2">Contact Info</Text>
          <div className="text-blue-950 font-[350] leading-relaxed">
            <p>{order.shipping_address?.phone}</p>
            <p className="text-blue-600 font-bold">{order.email}</p>
          </div>
        </div>

        <div
          className="flex flex-col"
          data-testid="shipping-method-summary"
        >
          <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2">Delivery Method</Text>
          <div className="text-blue-950 font-[350] leading-relaxed italic">
            {(order as any).shipping_methods[0]?.name}
            <span className="ml-1 text-gray-500 not-italic">
              ({convertToLocale({
                amount: order.shipping_methods?.[0].total ?? 0,
                currency_code: order.currency_code,
              })})
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShippingDetails
