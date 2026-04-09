import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

const buildInviteUrl = (token: string) => {
  const template = process.env.ADMIN_INVITE_URL_TEMPLATE
  if (template && template.includes("{token}")) {
    return template.replace("{token}", encodeURIComponent(token))
  }

  const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.VITE_BACKEND_URL || "http://localhost:9000"
  return `${backendUrl.replace(/\/$/, "")}/app/invite?token=${encodeURIComponent(token)}`
}

export default async function inviteNotificationHandler({
  event,
  container,
}: SubscriberArgs<{ id?: string } | Array<{ id?: string }>>) {
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const userModuleService = container.resolve(Modules.USER)

  const payload = Array.isArray(event.data) ? event.data : [event.data]

  for (const entry of payload) {
    const inviteId = entry?.id
    if (!inviteId) {
      continue
    }

    try {
      const invite = await userModuleService.retrieveInvite(inviteId)
      if (!invite?.email || !invite?.token) {
        continue
      }

      const inviteUrl = buildInviteUrl(invite.token)
      const expiresAt = new Date(invite.expires_at).toLocaleString()
      const subject = event.name === "invite.resent"
        ? "Your Medusa admin invite was renewed"
        : "You are invited to Medusa Admin"

      await notificationModuleService.createNotifications([
        {
          to: invite.email,
          channel: "email",
          content: {
            subject,
            html: `
              <p>Hello,</p>
              <p>You have been invited to join Medusa Admin.</p>
              <p><a href="${inviteUrl}">Accept Invite</a></p>
              <p>If the button does not work, copy this URL:</p>
              <p>${inviteUrl}</p>
              <p>This invite expires at: ${expiresAt}</p>
            `,
          },
          data: {
            invite_id: invite.id,
            invite_link: inviteUrl,
            expires_at: invite.expires_at,
          },
        },
      ])
    } catch (error: any) {
      console.error(`Failed sending invite notification for ${inviteId}:`, error?.message || error)
    }
  }
}

export const config: SubscriberConfig = {
  event: ["invite.created", "invite.resent"],
}
