/**
 * Medusa Notification Module - SendGrid Integration Guide
 * 
 * This document explains how the SendGrid notification provider is integrated
 * with Medusa's Notification Module and how to use it throughout your backend.
 */

# SendGrid Notification Provider for Medusa

## Overview

This implementation provides a complete SendGrid notification provider for the Medusa Notification Module, enabling email delivery across your ecommerce backend for:

- **User Invitations**: Send invite links to new users/merchants
- **Export Files**: Send exported CSV and data files
- **Order Notifications**: Send order confirmations, updates, and receipts 
- **General Notifications**: Any email communication needed

## Files Structure

```
src/modules/sendgrid-notification/
├── services/
│   ├── sendgrid.ts          # SendGrid provider service implementation
│   └── index.ts             # Services export
└── index.ts                 # Module provider export

src/api/admin/
├── invites/send/route.ts    # Endpoint: Send invite emails
├── exports/send/route.ts    # Endpoint: Send export files
└── test-notification/route.ts  # Endpoint: Test/verify SendGrid config

src/subscribers/
└── order-notification.ts    # Example: Order event notification subscriber
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM=noreply@yourdomain.com
SENDGRID_INVITE_TEMPLATE_ID=your_invite_template_id  # Optional
SENDGRID_EXPORT_TEMPLATE_ID=your_export_template_id  # Optional
SENDGRID_ORDER_CONFIRMATION_TEMPLATE_ID=your_template_id  # Optional
```

### Medusa Config

The `medusa-config.ts` is pre-configured with the SendGrid notification provider:

```typescript
modules: [
  {
    resolve: "./src/modules/sendgrid-notification",
    options: {
      providers: [
        {
          resolve: "./src/modules/sendgrid-notification",
          id: "sendgrid",
          options: {
            api_key: process.env.SENDGRID_API_KEY,
            from: process.env.SENDGRID_FROM,
            channels: ["email"],
          },
        },
      ],
    },
  },
]
```

## Usage Examples

### 1. Send Invite Email

**Endpoint**: `POST /admin/invites/send`

```bash
curl -X POST http://localhost:9000/admin/invites/send \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "inviteLink": "https://yourdomain.com/invite/abc123xyz",
    "senderName": "Your Company Name"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Invite sent to newuser@example.com"
}
```

### 2. Send Export File

**Endpoint**: `POST /admin/exports/send`

```bash
curl -X POST http://localhost:9000/admin/exports/send \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "exportName": "product-exports",
    "fileContent": "id,name,sku\n1,Product1,SKU001\n2,Product2,SKU002",
    "fileType": "text/csv"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Export file sent to user@example.com"
}
```

### 3. In Subscribers/Workflows

```typescript
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function mySubscriber({ event, container }) {
  const notificationModuleService = container.resolve(
    ContainerRegistrationKeys.NOTIFICATION
  )

  // Send notification via Notification Module
  await notificationModuleService.createNotifications([
    {
      to: "customer@example.com",
      channel: "email",
      template: "my-template-id",
      data: {
        customerName: "John Doe",
        orderNumber: "12345",
      },
    },
  ])
}
```

### 4. Test/Verify Configuration

**Endpoint**: `GET /admin/test-notification`

Check if SendGrid is properly configured:

```bash
curl http://localhost:9000/admin/test-notification
```

**Response**:
```json
{
  "success": true,
  "message": "Notification service is available",
  "notificationModuleAvailable": true,
  "sendgridConfigured": true,
  "sendgridFrom": "noreply@yourdomain.com",
  "timestamp": "2026-03-20T16:30:00.000Z"
}
```

**Endpoint**: `POST /admin/test-notification`

Send a test email:

```bash
curl -X POST http://localhost:9000/admin/test-notification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "subject": "Test Email",
    "message": "This is a test to verify SendGrid integration"
  }'
```

## Notification DTO Structure

### ProviderSendNotificationDTO

```typescript
{
  // Required
  to: string                           // Recipient email address
  channel: "email"                     // Channel type (always "email" for SendGrid)
  
  // Optional: Use either content OR template
  content?: {
    subject: string                    // Email subject
    html: string                       // HTML email body
  }
  template?: string                    // SendGrid template ID
  
  // Optional
  from?: string                        // Override sender email
  data?: Record<string, any>          // Template variables for dynamic templates
  attachments?: Array<{
    filename: string                   // File name
    content: string                    // Base64 encoded content
    content_type: string               // MIME type (e.g., "application/pdf")
    disposition?: "attachment" | "inline"
    id?: string                        // ID for inline attachments
  }>
}
```

## Error Handling

The SendGrid provider throws `MedusaError` with appropriate codes on failures:

- **INVALID_DATA**: Missing or invalid notification data
- **UNEXPECTED_STATE**: SendGrid API errors (network, invalid API key, etc.)

Always wrap notification calls in try-catch:

```typescript
try {
  await notificationModuleService.createNotifications([notification])
} catch (error) {
  console.error("Failed to send notification:", error.message)
  // Handle error appropriately
}
```

## SendGrid Templates

For dynamic templates, use SendGrid's dynamic template feature:

1. Create a template in SendGrid dashboard
2. Get the template ID
3. Pass template ID and provide data that matches template variables:

```typescript
{
  to: "user@example.com",
  channel: "email",
  template: "d-abc123xyz",  // SendGrid template ID
  data: {
    customer_name: "Jane Doe",
    order_total: "$99.99",
  }
}
```

## Testing

### 1. Verify Environment Variables

```bash
# In medusa terminal
console.log(process.env.SENDGRID_API_KEY)  // Should show your API key
console.log(process.env.SENDGRID_FROM)     // Should show sender email
```

### 2. Test via API Endpoint

Use the test endpoint to verify configuration is working:

```bash
# Check status
curl http://localhost:9000/admin/test-notification

# Send test email
curl -X POST http://localhost:9000/admin/test-notification \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test@example.com"}'
```

### 3. Check SendGrid Activity

Log into your SendGrid dashboard and check "Activity" feed to see delivery status.

## Troubleshooting

### Issue: "API key is invalid"
- Verify `SENDGRID_API_KEY` in `.env` is correct
- Check it has email sending permissions
- Restart Medusa server after changing .env

### Issue: "From email is not authorized"
- Verify `SENDGRID_FROM` is a verified sender in SendGrid
- Add and verify the sender email in SendGrid dashboard

### Issue: "No notification information provided"
- Ensure `to` and `channel` fields are present in notification DTO
- Ensure either `content` or `template` is provided

### Issue: Emails not appearing
- Check SendGrid Activity log for delivery status
- Verify recipient email is not in spam folder
- Review SendGrid documentation for bounce codes

## Best Practices

1. **always use try-catch** around notification calls to prevent order/request failures
2. **Use templates for consistency** - Define reusable SendGrid templates for common emails
3. **Include metadata** - Add email metadata to track notification intent
4. **Log notifications** - Log when important notifications are sent for auditing
5. **Test before launch** - Use test endpoint before deploying to production
6. **Monitor delivery** - Regularly check SendGrid Activity for bounce/complaint rates

## Integration Points

The SendGrid provider can be integrated at:

- **API Routes**: Handle direct notification requests
- **Subscribers**: React to Medusa events (orders, customers, etc.)
- **Workflows**: Send notifications as workflow steps
- **Jobs**: Send bulk notifications on schedule

Example workflow integration:

```typescript
import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const sendNotificationStep = createStep(
  "send-notification",
  async (input, { container }) => {
    const notificationModuleService = container.resolve(
      ContainerRegistrationKeys.NOTIFICATION
    )
    return await notificationModuleService.createNotifications([input])
  }
)

export const myWorkflow = createWorkflow("my-workflow", (input) => {
  return sendNotificationStep(input)
})
```

## Module Service API

### notificationModuleService.createNotifications()

Create and queue notifications for delivery:

```typescript
// Single notification
const result = await notificationModuleService.createNotifications(notification)

// Multiple notifications
const results = await notificationModuleService.createNotifications([
  notification1,
  notification2,
])
```

**Returns**: `NotificationDTO[]` - Created notification records

## Support & Customization

For custom notification scenarios:

1. Extend the `SendgridNotificationService` class
2. Override the `send()` method to customize behavior
3. Register custom service in your module provider

Example:

```typescript
export class CustomSendgridService extends SendgridNotificationService {
  async send(notification) {
    // Custom pre-processing
    const enriched = enrichNotification(notification)
    // Use parent send
    return super.send(enriched)
  }
}
```
