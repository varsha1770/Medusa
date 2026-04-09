import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

type TestNotificationBody = {
  email?: string
  subject?: string
  message?: string
}

/**
 * TEST TRIGGER ENDPOINT: Send Test Notification via SendGrid
 * This endpoint is used for testing/verifying that the SendGrid Notification Provider
 * is properly configured and functional.
 *
 * Usage:
 * POST http://localhost:9000/admin/test-notification
 * Body: {
 *   "email": "test@example.com",
 *   "subject": "Test Email",
 *   "message": "This is a test email"
 * }
 */
export async function POST(req: MedusaRequest<TestNotificationBody>, res: MedusaResponse) {
  const payload = req.body || {}
  const {
    email,
    subject = "Test Notification",
    message = "This is a test email from Medusa",
  } = payload

  if (!email) {
    return res.status(400).json({
      error: "Missing required field: email",
    })
  }

  try {
    const notificationModuleService = req.scope.resolve(
      Modules.NOTIFICATION
    )

    // Send test notification with inline HTML content
    const result = await notificationModuleService.createNotifications([
      {
        to: email,
        channel: "email",
        content: {
          subject: subject,
          html: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>${subject}</h2>
                <p>${message}</p>
                <hr />
                <p style="color: #666; font-size: 12px;">
                  This is a test notification from Medusa SendGrid Notification Provider.
                  <br />
                  Sent at: ${new Date().toISOString()}
                </p>
              </body>
            </html>
          `,
        },
      },
    ])

    return res.status(200).json({
      success: true,
      message: `Test notification sent to ${email}`,
      result,
    })
  } catch (error: any) {
    console.error("Error sending test notification:", error)
    return res.status(500).json({
      success: false,
      error: "Failed to send test notification",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
}

/**
 * GET endpoint to verify SendGrid configuration status
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const notificationModuleService = req.scope.resolve(
      Modules.NOTIFICATION
    )

    // Check if notification module is available
    const isAvailable = !!notificationModuleService

    return res.status(200).json({
      success: true,
      message: "Notification service is available",
      notificationModuleAvailable: isAvailable,
      sendgridConfigured: !!process.env.SENDGRID_API_KEY && !!process.env.SENDGRID_FROM,
      sendgridFrom: process.env.SENDGRID_FROM || "NOT SET",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to check notification service",
      details: error.message,
    })
  }
}
