/**
 * Quick Start: Using the SendGrid Notification Provider
 * 
 * This file demonstrates how to use the SendGrid notification provider
 * in various scenarios within your Medusa backend.
 */

import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Example 1: In an API Route Handler
 */
export async function exampleApiRoute(req: any, res: any) {
  const notificationModuleService = req.scope.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  try {
    // Send welcome email to new user
    await notificationModuleService.createNotifications([
      {
        to: "newuser@example.com",
        channel: "email",
        content: {
          subject: "Welcome to TIF Labs!",
          html: `
            <h1>Welcome!</h1>
            <p>Thank you for joining our platform.</p>
          `,
        },
      },
    ])

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Example 2: In a Subscriber/Event Handler
 */
export async function exampleSubscriber({ event, container }: any) {
  const notificationModuleService = container.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  const { data } = event

  try {
    // Send order confirmation
    await notificationModuleService.createNotifications([
      {
        to: data.order.email,
        channel: "email",
        template: "order-confirmation", // SendGrid template ID
        data: {
          orderId: data.order.id,
          total: data.order.total,
        },
      },
    ])
  } catch (error) {
    console.error("Failed to send order notification:", error.message)
  }
}

/**
 * Example 3: Sending with Attachments (Export Files)
 */
export async function exampleExportEmail(req: any, res: any) {
  const notificationModuleService = req.scope.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  const csv = "id,name,sku\n1,Product1,SKU001\n2,Product2,SKU002"

  try {
    await notificationModuleService.createNotifications([
      {
        to: "user@example.com",
        channel: "email",
        content: {
          subject: "Your Product Export",
          html: "<p>Your export is attached below.</p>",
        },
        attachments: [
          {
            filename: "products.csv",
            content: Buffer.from(csv).toString("base64"),
            content_type: "text/csv",
            disposition: "attachment",
          },
        ],
      },
    ])

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Example 4: In a Workflow Step
 */
import { createStep } from "@medusajs/framework/workflows-sdk"

export const sendNotificationStep = createStep(
  "send-email-notification",
  async (input: any, { container }) => {
    const notificationModuleService = container.resolve(
      ContainerRegistrationKeys.NOTIFICATION
    )

    return await notificationModuleService.createNotifications([
      {
        to: input.recipientEmail,
        channel: "email",
        template: input.templateId,
        data: input.templateData,
      },
    ])
  }
)

/**
 * Example 5: Utility Function for Common Notifications
 */
export async function sendInviteEmail(
  container: any,
  email: string,
  inviteLink: string
) {
  const notificationModuleService = container.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  return await notificationModuleService.createNotifications([
    {
      to: email,
      channel: "email",
      template: "invite-user",
      data: {
        inviteLink,
        inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  ])
}

export async function sendExportEmail(
  container: any,
  email: string,
  fileName: string,
  fileContent: string
) {
  const notificationModuleService = container.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  return await notificationModuleService.createNotifications([
    {
      to: email,
      channel: "email",
      content: {
        subject: `Your ${fileName} Export is Ready`,
        html: `<p>Your export file <strong>${fileName}</strong> is attached.</p>`,
      },
      attachments: [
        {
          filename: `${fileName}.csv`,
          content: Buffer.from(fileContent).toString("base64"),
          content_type: "text/csv",
          disposition: "attachment",
        },
      ],
    },
  ])
}

/**
 * Example 6: Bulk Notification Sending
 */
export async function sendBulkNotifications(
  container: any,
  recipients: Array<{ email: string; name: string }>
) {
  const notificationModuleService = container.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  const notifications = recipients.map((recipient) => ({
    to: recipient.email,
    channel: "email" as const,
    template: "promotional-email",
    data: {
      recipientName: recipient.name,
    },
  }))

  return await notificationModuleService.createNotifications(notifications)
}

/**
 * Example 7: Error Handling Pattern
 */
export async function sendWithErrorHandling(
  container: any,
  notification: any
) {
  const notificationModuleService = container.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  try {
    const result = await notificationModuleService.createNotifications([
      notification,
    ])

    console.log(`✓ Notification sent to ${notification.to}`)
    return { success: true, result }
  } catch (error: any) {
    if (error.code === "INVALID_DATA") {
      console.error("Invalid notification data:", error.message)
    } else if (error.message.includes("SendGrid")) {
      console.error("SendGrid API error:", error.message)
    } else {
      console.error("Unexpected error:", error.message)
    }

    return {
      success: false,
      error: error.message,
      retryable: !error.message.includes("INVALID_DATA"),
    }
  }
}

/**
 * Export all examples as a namespace
 */
export const NotificationExamples = {
  exampleApiRoute,
  exampleSubscriber,
  exampleExportEmail,
  sendNotificationStep,
  sendInviteEmail,
  sendExportEmail,
  sendBulkNotifications,
  sendWithErrorHandling,
}

export default NotificationExamples
