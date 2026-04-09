import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import path from "path"

type UserEventData = {
  id?: string
  user_id?: string
  email?: string
  invite_id?: string
}

const RETRY_DELAY_MS = 150
const INVITE_RETRY_ATTEMPTS = 2
const DEFAULT_RETRY_ATTEMPTS = 1

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function ensureUserStoreHandler({
  event,
  container,
}: SubscriberArgs<UserEventData>) {
  try {
        const retryAttempts =
          event.name === "invite.accepted"
            ? INVITE_RETRY_ATTEMPTS
            : DEFAULT_RETRY_ATTEMPTS

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const userModuleService = container.resolve(Modules.USER)

    const eventId = event.data?.id
    const idLooksLikeUserId = typeof eventId === "string" && eventId.startsWith("user_")
    let userId = event.data?.user_id || (idLooksLikeUserId ? eventId : undefined)
    let userEmail = event.data?.email

    // invite.accepted may provide invite id instead of user id.
    if (!userEmail && event.name === "invite.accepted" && event.data?.id) {
      try {
        const invite = await userModuleService.retrieveInvite(event.data.id)
        if (invite?.email) {
          userEmail = invite.email
        }
      } catch {
        // Ignore invite lookup errors and continue with remaining strategies.
      }
    }

    if (!userId && userEmail) {
      for (let attempt = 0; attempt < retryAttempts; attempt++) {
        const { data: users } = await query.graph({
          entity: "user",
          fields: ["id", "email"],
          filters: {
            email: [userEmail],
          },
        })

        if (users?.[0]?.id) {
          userId = users[0].id
          break
        }

        await sleep(RETRY_DELAY_MS)
      }
    }

    if (!userId) {
      return
    }

    const { data: links } = await query.graph({
      entity: "user_store",
      fields: ["id", "store_id"],
      filters: {
        user_id: [userId],
      },
    })

    if (links?.length) {
      return
    }

    let users: any[] = []
    for (let attempt = 0; attempt < retryAttempts; attempt++) {
      const result = await query.graph({
        entity: "user",
        fields: ["id", "email"],
        filters: {
          id: [userId],
        },
      })

      users = result.data || []
      if (users[0]) {
        break
      }

      await sleep(RETRY_DELAY_MS)
    }

    const user = users?.[0]
    if (!user) {
      return
    }

    const createStoreWorkflowPath = path.join(
      process.cwd(),
      "node_modules/@techlabi/medusa-marketplace-plugin/.medusa/server/src/workflows/create-store"
    )

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createStoreWorkflow } = require(createStoreWorkflowPath)

    const storeName = `${(user.email || "merchant").split("@")[0]}-store`

    await createStoreWorkflow(container).run({
      input: {
        user_id: userId,
        store_name: storeName,
      },
    })
  } catch (error: any) {
    console.warn("ensure-user-store subscriber warning:", error?.message || error)
  }
}

export const config: SubscriberConfig = {
  event: ["user.created", "invite.accepted"],
}
