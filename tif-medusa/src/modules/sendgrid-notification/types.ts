/**
 * Type Definitions for Medusa Notification Module
 * These types are exported from @medusajs/framework/types
 * This file documents them for reference
 */

/**
 * Notification DTO for creating notifications
 */
export interface CreateNotificationDTO {
  // Recipient email address (required)
  to: string

  // Channel type - "email" for SendGrid provider
  channel: "email"

  // Either content OR template must be provided, not both

  // HTML email content (alternative to template)
  content?: {
    subject: string // Email subject line
    html: string // HTML body content
  }

  // SendGrid template ID (alternative to content)
  template?: string

  // Sender email (optional, defaults to SENDGRID_FROM env var)
  from?: string

  // Template variables for dynamic content
  data?: Record<string, any>

  // File attachments (optional)
  attachments?: Array<{
    filename: string // File name (e.g., "export.csv")
    content: string // Base64 encoded file content
    content_type: string // MIME type (e.g., "text/csv", "application/pdf")
    disposition?: "attachment" | "inline" // How to display attachment
    id?: string // For inline image references
  }>
}

/**
 * Notification returned from service
 */
export interface NotificationDTO {
  id: string
  to: string
  channel: string
  template?: string
  data?: Record<string, any>
  content?: {
    subject: string
    html: string
  }
  provider_id: string
  created_at: Date
  updated_at: Date
}

/**
 * Provider notification DTO sent to SendGrid
 */
export interface ProviderSendNotificationDTO {
  to: string
  channel: "email"
  content?: {
    subject: string
    html: string
  }
  template?: string
  from?: string
  data?: Record<string, any>
  attachments?: Array<{
    filename: string
    content: string
    content_type: string
    disposition?: string
    id?: string
  }>
}

/**
 * Result from provider send operation
 */
export interface ProviderSendNotificationResultsDTO {
  [key: string]: any
}

/**
 * SendGrid options from config
 */
export interface SendgridNotificationServiceOptions {
  api_key: string // SendGrid API key
  from: string // From email address
}

/**
 * Medusa Notification Module Service
 * Used to create and send notifications
 */
export interface INotificationModuleService {
  /**
   * Create single notification
   */
  createNotifications(
    data: CreateNotificationDTO,
    sharedContext?: any
  ): Promise<NotificationDTO>

  /**
   * Create multiple notifications
   */
  createNotifications(
    data: CreateNotificationDTO[],
    sharedContext?: any
  ): Promise<NotificationDTO[]>

  /**
   * Retrieve notification by ID
   */
  retrieve(
    id: string,
    config?: any,
    sharedContext?: any
  ): Promise<NotificationDTO>

  /**
   * List notifications with filters
   */
  list(
    filters?: any,
    config?: any,
    sharedContext?: any
  ): Promise<NotificationDTO[]>

  /**
   * Update notification
   */
  update(
    id: string,
    data: Partial<CreateNotificationDTO>,
    sharedContext?: any
  ): Promise<NotificationDTO>

  /**
   * Delete notification
   */
  delete(id: string, sharedContext?: any): Promise<void>
}

/**
 * Usage in container
 */
export const ContainerKeys = {
  NOTIFICATION_MODULE_SERVICE: "notificationModuleService",
  // Or use standard key:
  // ContainerRegistrationKeys.NOTIFICATION
}

/**
 * Common templates (examples)
 * Create these in your SendGrid dashboard and reference by ID
 */
export const CommonTemplates = {
  INVITE_USER: "invite-user",
  ORDER_CONFIRMATION: "order-confirmation",
  ORDER_SHIPMENT: "order-shipment",
  ORDER_DELIVERED: "order-delivered",
  EXPORT_READY: "export-file",
  PASSWORD_RESET: "password-reset",
  CUSTOMER_WELCOME: "customer-welcome",
  MERCHANT_WELCOME: "merchant-welcome",
}

/**
 * Common channels
 */
export const NotificationChannels = {
  EMAIL: "email",
  SMS: "sms", // Not yet supported
  PUSH: "push", // Not yet supported
}
