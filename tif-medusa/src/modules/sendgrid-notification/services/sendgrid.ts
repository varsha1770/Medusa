import {
  Logger,
  NotificationTypes,
  SendgridNotificationServiceOptions,
} from "@medusajs/framework/types"
import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils"
import sgMail from "@sendgrid/mail"

type InjectedDependencies = {
  logger: Logger
}

interface SendgridServiceConfig {
  apiKey: string
  from: string
}

/**
 * SendGrid Notification Provider Service
 * Extends Medusa's AbstractNotificationProviderService to send emails via SendGrid
 * Supports both HTML content and SendGrid dynamic templates
 */
export class SendgridNotificationService extends AbstractNotificationProviderService {
  static identifier = "sendgrid"

  protected config_: SendgridServiceConfig
  protected logger_: Logger

  constructor(
    { logger }: InjectedDependencies,
    options: SendgridNotificationServiceOptions
  ) {
    super()
    this.config_ = {
      apiKey: options.api_key,
      from: options.from,
    }
    this.logger_ = logger

    // Initialize SendGrid API with the provided API key
    sgMail.setApiKey(this.config_.apiKey)
  }

  /**
   * Send notification via SendGrid
   * @param notification - ProviderSendNotificationDTO with recipient info, content, and metadata
   * @returns ProviderSendNotificationResultsDTO (empty object on success)
   * @throws MedusaError on SendGrid API failure or validation errors
   */
  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (!notification) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No notification information provided"
      )
    }

    // Process attachments if provided
    const attachments = Array.isArray(notification.attachments)
      ? notification.attachments.map((attachment) => ({
          content: attachment.content, // Base64 encoded string
          filename: attachment.filename,
          content_type: attachment.content_type, // MIME type (e.g., 'application/pdf')
          disposition: attachment.disposition ?? "attachment",
          id: attachment.id ?? undefined, // Optional: for inline attachments
        }))
      : undefined

    // Use provided sender or fall back to config sender
    const from = notification.from?.trim() || this.config_.from

    // Build mail content: either HTML content or SendGrid template
    let mailContent: {
      subject?: string
      html?: string
      templateId?: string
    }

    if ("content" in notification && !!notification.content) {
      // HTML email mode
      mailContent = {
        subject: notification.content?.subject,
        html: notification.content?.html,
      }
    } else {
      // SendGrid dynamic template mode
      mailContent = {
        templateId: notification.template,
      }
    }

    // Assemble final message for SendGrid
    const message = {
      to: notification.to,
      from: from,
      dynamicTemplateData:
        notification.data && typeof notification.data === "object"
          ? (notification.data as Record<string, unknown>)
          : undefined,
      attachments: attachments,
      ...mailContent,
    }

    try {
      // Send email via SendGrid
      await sgMail.send(message as any)
      this.logger_.info(
        `SendGrid notification sent successfully to ${notification.to}`
      )
      return {}
    } catch (error: any) {
      const errorCode = error.code || error.status
      const responseError = error.response?.body?.errors?.[0]

      this.logger_.error(
        `Failed to send SendGrid notification to ${notification.to}: ${errorCode} - ${
          responseError?.message ?? error.message ?? "unknown error"
        }`
      )

      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send email via SendGrid: ${errorCode} - ${
          responseError?.message ?? error.message ?? "unknown error"
        }`
      )
    }
  }
}
