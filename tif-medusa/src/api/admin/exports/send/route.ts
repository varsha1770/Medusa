import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

type SendExportBody = {
  email?: string
  exportName?: string
  fileContent?: string
  fileType?: string
}

/**
 * Send Export File via Notification Module
 * Used when sending exported CSV or data files to users
 * Endpoint: POST /exports/send
 */
export async function POST(req: MedusaRequest<SendExportBody>, res: MedusaResponse) {
  const payload = req.body || {}
  const { email, exportName, fileContent, fileType = "text/csv" } = payload

  if (!email || !fileContent) {
    return res.status(400).json({
      error: "Missing required fields: email, fileContent",
    })
  }

  try {
    const notificationModuleService = req.scope.resolve(
      Modules.NOTIFICATION
    )

    // Create attachment from file content
    const attachment = {
      filename: `${exportName || "export"}.csv`,
      content: Buffer.from(fileContent).toString("base64"),
      content_type: fileType,
      disposition: "attachment",
    }

    // Create and send notification with attachment via Notification Module
    await notificationModuleService.createNotifications([
      {
        to: email,
        channel: "email",
        template: process.env.SENDGRID_EXPORT_TEMPLATE_ID || "export-file",
        data: {
          exportName: exportName || "Your Export",
          timestamp: new Date().toISOString(),
        },
        attachments: [attachment],
      },
    ])

    return res.status(200).json({
      success: true,
      message: `Export file sent to ${email}`,
    })
  } catch (error: any) {
    console.error("Error sending export file:", error)
    return res.status(500).json({
      error: "Failed to send export file",
      details: error.message,
    })
  }
}
