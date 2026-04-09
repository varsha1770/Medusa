import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")

    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Text className="text-gray-600 font-[350]">
        We have sent the order confirmation details to{" "}
        <span
          className="text-blue-600 font-bold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        <div className="flex flex-col p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <Text className="text-gray-400 text-xs uppercase tracking-widest mb-1 font-bold">Order Date</Text>
          <Text className="text-blue-950 font-[350] text-lg" data-testid="order-date">
            {new Date(order.created_at).toDateString()}
          </Text>
        </div>
        <div className="flex flex-col p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <Text className="text-gray-400 text-xs uppercase tracking-widest mb-1 font-bold">Order ID</Text>
          <Text className="text-blue-600 font-[350] text-lg" data-testid="order-id">
            #{order.display_id}
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-x-8 mt-4 p-4 border-t border-gray-100">
        {showStatus && (
          <>
            <div className="flex flex-col">
              <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Order Status</Text>
              <Text className="text-blue-950 font-[350]" data-testid="order-status">
                {formatStatus(order.fulfillment_status)}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Payment Status</Text>
              <Text className="text-blue-950 font-[350]" data-testid="order-payment-status">
                {formatStatus(order.payment_status)}
              </Text>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
