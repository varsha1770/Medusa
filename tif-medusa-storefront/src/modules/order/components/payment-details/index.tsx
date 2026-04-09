import { Container, Heading, Text } from "@medusajs/ui"

import { isStripeLike, paymentInfoMap } from "@lib/constants"
import Divider from "@modules/common/components/divider"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0].payments?.[0]

  return (
    <div className="flex flex-col gap-y-4 pt-10 border-t border-gray-100">
      {payment && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2">
              Payment method
            </Text>
            <div className="flex items-center gap-x-2">
              <Container className="flex items-center h-8 w-fit px-3 bg-blue-50 border border-blue-100/50 rounded-lg">
                {paymentInfoMap[payment.provider_id].icon}
              </Container>
              <Text
                className="text-blue-950 font-[350]"
                data-testid="payment-method"
              >
                {paymentInfoMap[payment.provider_id].title}
              </Text>
            </div>
          </div>
          <div className="flex flex-col">
            <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2">
              Payment details
            </Text>
            <div className="flex gap-3 text-blue-950 font-[350] items-center">
              <Text data-testid="payment-amount" className="text-sm">
                {isStripeLike(payment.provider_id) && payment.data?.card_last4
                  ? `**** **** **** ${payment.data.card_last4}`
                  : `${convertToLocale({
                      amount: payment.amount,
                      currency_code: order.currency_code,
                    })} paid at ${new Date(
                      payment.created_at ?? ""
                    ).toLocaleDateString()}`}
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentDetails
