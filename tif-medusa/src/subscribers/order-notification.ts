import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

/**
 * Subscriber: Send notification when an order is created or status changes
 * This demonstrates how to hook Notification Module into Medusa events
 */
export default async function orderEventHandler({
  event,
  container,
}: SubscriberArgs<Record<string, any>>) {
  const notificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )

  const { data } = event

  try {
    // Example: Order confirmation email
    if (data.order?.email) {
      await notificationModuleService.createNotifications([
        {
          to: data.order.email,
          channel: "email",
          template: process.env.SENDGRID_ORDER_CONFIRMATION_TEMPLATE_ID || "order-confirmation",
          data: {
            orderId: data.order.id,
            orderNumber: data.order.display_id,
            total: data.order.total,
            createdAt: new Date(data.order.created_at).toLocaleDateString(),
          },
        },
      ])

      console.log(`Order confirmation sent to ${data.order.email}`)
    }
  } catch (error: any) {
    console.error("Error sending order notification:", error.message)
    // Log but don't throw to prevent order creation failure
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
