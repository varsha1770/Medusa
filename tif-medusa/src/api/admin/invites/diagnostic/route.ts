import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Diagnostic endpoint to debug invite system
 * GET /admin/invites/diagnostic - Returns info about recent invites and their tokens
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const userModuleService = req.scope.resolve(Modules.USER)
    
    // Get list of recent invites
    const [invites, count] = await userModuleService.listInvites(
      {},
      {
        select: ["id", "email", "token", "expires_at", "accepted_at", "created_at"],
        limit: 10,
        order: { created_at: "DESC" }
      }
    )

    if (!invites || invites.length === 0) {
      return res.json({
        status: "info",
        message: "No invites found in system",
        inviteCount: 0,
      })
    }

    const inviteUrls = invites.map(invite => ({
      id: invite.id,
      email: invite.email,
      url: `http://localhost:9000/app/invite?token=${invite.token}`,
      token: invite.token ? `${invite.token.substring(0, 20)}...` : "missing",
      expiresAt: invite.expires_at,
      acceptedAt: invite.accepted_at,
      createdAt: invite.created_at,
      isExpired: new Date(invite.expires_at) < new Date(),
      isAccepted: !!invite.accepted_at,
    }))

    return res.json({
      status: "success",
      message: `Found ${count} invite(s)`,
      inviteCount: count,
      invites: inviteUrls,
      totalInvites: count,
      instructions: {
        step1: "Copy one of the URLs above",
        step2: "Visit it in your Admin UI browser session",
        step3: "If you get 404, the Admin UI /app/invite page may not exist",
        step4: "If you get 'already authenticated', log out and try the link again",
        step5: "If you get 'token invalid/expired', check the token and expiry date above"
      }
    })
  } catch (error: any) {
    return res.status(500).json({
      error: "Diagnostic failed",
      details: error.message,
      hint: "Make sure USER module is properly initialized"
    })
  }
}
