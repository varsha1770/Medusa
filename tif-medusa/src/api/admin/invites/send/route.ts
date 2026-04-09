import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Send Invite Email via Notification Module
 * Used when inviting users to join the platform
 * Endpoint: POST /invites/send
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const payload = (req.body || {}) as {
    email?: string
    inviteLink?: string
    senderName?: string
  }
  const { email, inviteLink, senderName } = payload

  if (!email || !inviteLink) {
    return res.status(400).json({
      error: "Missing required fields: email, inviteLink",
    })
  }

  try {
    const notificationModuleService = req.scope.resolve(
      Modules.NOTIFICATION
    )

    // Create and send notification via Notification Module
    await notificationModuleService.createNotifications([
      {
        to: email,
        channel: "email",
        template: process.env.SENDGRID_INVITE_TEMPLATE_ID || "invite-user",
        data: {
          inviteLink,
          senderName: senderName || "TIF Labs",
          recipientEmail: email,
        },
      },
    ])

    return res.status(200).json({
      success: true,
      message: `Invite sent to ${email}`,
    })
  } catch (error: any) {
    console.error("Error sending invite:", error)
    return res.status(500).json({
      error: "Failed to send invite email",
      details: error.message,
    })
  }
}
