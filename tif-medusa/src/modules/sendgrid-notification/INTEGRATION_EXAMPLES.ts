/**
 * Complete Integration Examples for SendGrid Notification Provider
 * 
 * This file shows real-world usage patterns for:
 * - Copy Invite Templates
 * - Sending Invite Links
 * - Sending Export Files
 * - All other email scenarios in your backend
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// ============================================================================
// 1. INVITE SCENARIOS
// ============================================================================

/**
 * Send Copy Invite to Collaborators
 * When copying a template/resource, invite other users to collaborate
 */
export async function sendCopyInvite(req: MedusaRequest, res: MedusaResponse) {
  const { resourceName, collaboratorEmails, resourceLink } = req.body

  const notificationService = req.scope.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  try {
    // Send invite to each collaborator
    const notifications = collaboratorEmails.map((email: string) => ({
      to: email,
      channel: "email" as const,
      content: {
        subject: `You're invited to collaborate on: ${resourceName}`,
        html: `
          <html>
            <body style="font-family: Arial, sans-serif;">
              <h2>Collaboration Invitation</h2>
              <p>You've been invited to collaborate on: <strong>${resourceName}</strong></p>
              <p>
                <a href="${resourceLink}" style="
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #007bff;
                  color: white;
                  text-decoration: none;
                  border-radius: 4px;
                ">
                  Accept Invitation
                </a>
              </p>
              <p>This invitation will expire in 7 days.</p>
            </body>
          </html>
        `,
      },
    }))

    await notificationService.createNotifications(notifications)

    res.json({
      success: true,
      message: `Invite sent to ${collaboratorEmails.length} collaborators`,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Send Invite Link (Generic)
 * General purpose invite link sender
 */
export async function sendInviteLink(req: MedusaRequest, res: MedusaResponse) {
  const { emails, inviteLink, inviteType, expiryDays = 7 } = req.body

  const notificationService = req.scope.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  try {
    const notifications = Array.isArray(emails) ? emails : [emails]

    await notificationService.createNotifications(
      notifications.map((email: string) => ({
        to: email,
        channel: "email" as const,
        template: "invite-user",
        data: {
          inviteLink,
          inviteType: inviteType || "platform",
          expiryDays,
          inviteExpiresAt: new Date(
            Date.now() + expiryDays * 24 * 60 * 60 * 1000
          ).toLocaleDateString(),
        },
      }))
    )

    res.json({
      success: true,
      message: `Invite${Array.isArray(emails) ? "s" : ""} sent successfully`,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// ============================================================================
// 2. EXPORT FILE SCENARIOS
// ============================================================================

/**
 * Send Product Export (CSV)
 * When user exports products list
 */
export async function sendProductExport(req: MedusaRequest, res: MedusaResponse) {
  const { email, csvContent, exportFilters } = req.body

  const notificationService = req.scope.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  try {
    await notificationService.createNotifications([
      {
        to: email,
        channel: "email" as const,
        content: {
          subject: "Your Product Export is Ready",
          html: `
            <html>
              <body style="font-family: Arial, sans-serif;">
                <h2>Product Export Complete</h2>
                <p>Your product export is attached below.</p>
                <p><strong>Export Details:</strong></p>
                <ul>
                  <li>Total Products: ${csvContent.split("\n").length - 1}</li>
                  <li>Format: CSV</li>
                  <li>Generated: ${new Date().toLocaleString()}</li>
                </ul>
                <p>The attachment contains all products matching your filters.</p>
              </body>
            </html>
          `,
        },
        attachments: [
          {
            filename: `products-export-${Date.now()}.csv`,
            content: Buffer.from(csvContent).toString("base64"),
            content_type: "text/csv",
            disposition: "attachment",
          },
        ],
      },
    ])

    res.json({
      success: true,
      message: "Export sent to your email",
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Send Order Export (CSV)
 * When user exports orders list
 */
export async function sendOrderExport(req: MedusaRequest, res: MedusaResponse) {
  const { email, csvContent, dateRange } = req.body

  const notificationService = req.scope.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  try {
    await notificationService.createNotifications([
      {
        to: email,
        channel: "email" as const,
        content: {
          subject: "Your Order Export is Ready",
          html: `
            <html>
              <body style="font-family: Arial, sans-serif;">
                <h2>Order Export Complete</h2>
                <p>Your order export is ready for download.</p>
                <p><strong>Export Details:</strong></p>
                <ul>
                  <li>Total Orders: ${csvContent.split("\n").length - 1}</li>
                  <li>Date Range: ${dateRange?.from} to ${dateRange?.to}</li>
                  <li>Format: CSV</li>
                </ul>
              </body>
            </html>
          `,
        },
        attachments: [
          {
            filename: `orders-export-${Date.now()}.csv`,
            content: Buffer.from(csvContent).toString("base64"),
            content_type: "text/csv",
            disposition: "attachment",
          },
        ],
      },
    ])

    res.json({
      success: true,
      message: "Order export sent to your email",
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Send Generic File Export
 * Reusable for any CSV/data export
 */
export async function sendFileExport(req: MedusaRequest, res: MedusaResponse) {
  const {
    email,
    fileContent,
    fileName,
    fileType = "text/csv",
    description,
  } = req.body

  const notificationService = req.scope.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  try {
    await notificationService.createNotifications([
      {
        to: email,
        channel: "email" as const,
        content: {
          subject: `Your ${fileName} Export is Ready`,
          html: `
            <html>
              <body style="font-family: Arial, sans-serif;">
                <h2>Export Ready</h2>
                <p>Your <strong>${fileName}</strong> export is attached below.</p>
                ${description ? `<p>${description}</p>` : ""}
                <p style="color: #666; font-size: 12px;">
                  Generated: ${new Date().toLocaleString()}
                </p>
              </body>
            </html>
          `,
        },
        attachments: [
          {
            filename: `${fileName}-${Date.now()}.${fileType === "text/csv" ? "csv" : "txt"}`,
            content: Buffer.from(fileContent).toString("base64"),
            content_type: fileType,
            disposition: "attachment",
          },
        ],
      },
    ])

    res.json({
      success: true,
      message: `${fileName} sent to your email`,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// ============================================================================
// 3. ORDER NOTIFICATIONS
// ============================================================================

/**
 * Send Order Confirmation
 * Called when order is placed
 */
export async function sendOrderConfirmation(
  container: any,
  order: any
) {
  const notificationService = container.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  return await notificationService.createNotifications([
    {
      to: order.email,
      channel: "email" as const,
      template: "order-confirmation",
      data: {
        orderId: order.id,
        orderNumber: order.display_id,
        customerName: order.customer?.first_name,
        orderTotal: order.total,
        orderDate: new Date(order.created_at).toLocaleDateString(),
      },
    },
  ])
}

/**
 * Send Shipment Notification
 * Called when order is shipped
 */
export async function sendShipmentNotification(
  container: any,
  fulfillment: any,
  order: any
) {
  const notificationService = container.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  return await notificationService.createNotifications([
    {
      to: order.email,
      channel: "email" as const,
      template: "order-shipment",
      data: {
        orderNumber: order.display_id,
        trackingNumber: fulfillment.tracking_numbers?.[0]?.tracking_number,
        shippingCarrier: fulfillment.provider_id,
        estimatedDelivery: fulfillment.metadata?.estimated_delivery,
      },
    },
  ])
}

/**
 * Send Delivery Notification
 * Called when order is delivered
 */
export async function sendDeliveryNotification(
  container: any,
  order: any
) {
  const notificationService = container.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  return await notificationService.createNotifications([
    {
      to: order.email,
      channel: "email" as const,
      template: "order-delivered",
      data: {
        orderNumber: order.display_id,
        deliveredDate: new Date().toLocaleDateString(),
        customerName: order.customer?.first_name,
      },
    },
  ])
}

// ============================================================================
// 4. USER NOTIFICATIONS
// ============================================================================

/**
 * Send Welcome Email to New User
 */
export async function sendWelcomeEmail(
  container: any,
  user: any
) {
  const notificationService = container.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  return await notificationService.createNotifications([
    {
      to: user.email,
      channel: "email" as const,
      content: {
        subject: "Welcome to TIF Labs!",
        html: `
          <html>
            <body style="font-family: Arial, sans-serif;">
              <h2>Welcome, ${user.first_name}!</h2>
              <p>Thanks for joining our platform.</p>
              <p>You can now start exploring all our features.</p>
            </body>
          </html>
        `,
      },
    },
  ])
}

/**
 * Send Password Reset Email
 */
export async function sendPasswordResetEmail(
  container: any,
  email: string,
  resetLink: string
) {
  const notificationService = container.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  return await notificationService.createNotifications([
    {
      to: email,
      channel: "email" as const,
      template: "password-reset",
      data: {
        resetLink,
        expiryMinutes: 60,
      },
    },
  ])
}

// ============================================================================
// 5. UTILITY FUNCTIONS
// ============================================================================

/**
 * Send bulk notifications efficiently
 */
export async function sendBulkNotifications(
  container: any,
  notifications: any[]
) {
  const notificationService = container.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  try {
    const results = await notificationService.createNotifications(notifications)
    return {
      success: true,
      sent: results.length,
      results,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Wrapper with error handling and logging
 */
export async function sendNotificationSafe(
  container: any,
  notification: any,
  label: string = "notification"
) {
  const notificationService = container.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  try {
    const result = await notificationService.createNotifications([notification])
    console.log(`✓ ${label} sent to ${notification.to}`)
    return { success: true, result }
  } catch (error: any) {
    console.error(`✗ Failed to send ${label}:`, error.message)
    return {
      success: false,
      error: error.message,
      retryable: !error.message.includes("INVALID_DATA"),
    }
  }
}

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export const NotificationHandlers = {
  // Invites
  sendCopyInvite,
  sendInviteLink,

  // Exports
  sendProductExport,
  sendOrderExport,
  sendFileExport,

  // Orders
  sendOrderConfirmation,
  sendShipmentNotification,
  sendDeliveryNotification,

  // Users
  sendWelcomeEmail,
  sendPasswordResetEmail,

  // Utilities
  sendBulkNotifications,
  sendNotificationSafe,
}

export default NotificationHandlers
