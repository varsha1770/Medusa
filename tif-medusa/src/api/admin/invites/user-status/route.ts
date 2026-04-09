import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Diagnostic endpoint to check invited user status
 * GET /admin/invites/user-status
 * 
 * Returns information about the current user including:
 * - User ID, email, roles
 * - Store associations
 * - Which pages they should be able to access
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const userModuleService = req.scope.resolve(Modules.USER)

    // Get the authenticated user from the request context
    // This is typically available as req.user or similar depending on Medusa version
    const authUser = (req as any).user || (req as any).auth?.user

    if (!authUser) {
      return res.status(401).json({
        error: "Not authenticated",
        message: "No auth user found in request context",
        hint: "Make sure you're logged in and the auth token is valid",
      })
    }

    // Try to get user details
    let userDetails: any
    try {
      userDetails = await userModuleService.retrieveUser(authUser.id || authUser.user_id, {
        select: ["id", "email", "first_name", "last_name", "created_at", "updated_at"],
      })
    } catch (e) {
      userDetails = authUser
    }

    // Get user's roles (if available)
    const roles = (authUser as any)?.roles || []
    const scope = (authUser as any)?.scope || "unknown"

    return res.json({
      status: "authenticated",
      user: {
        id: userDetails?.id || authUser.id,
        email: userDetails?.email || authUser.email,
        first_name: userDetails?.first_name || authUser.first_name,
        last_name: userDetails?.last_name || authUser.last_name,
        roles,
        scope, // e.g., "admin", "merchant"
      },
      accessInfo: {
        scope,
        recommendedLandingPage: getRecommendedLandingPage(scope, roles),
        accessiblePages: getAccessiblePages(scope, roles),
        notes: getAccessNotes(scope, roles),
      },
      debugging: {
        authUserFull: authUser,
        userDetailsFull: userDetails,
      },
      troubleshooting: {
        issue: "404 on /app/merchants or other pages after invite acceptance",
        cause: "Invited users may be redirected to pages that don't exist",
        solution: "Check recommendedLandingPage and ensure Admin UI has that route",
      },
    })
  } catch (error: any) {
    console.error("User status check failed:", error)
    return res.status(500).json({
      error: "Failed to check user status",
      details: error.message,
    })
  }
}

function getRecommendedLandingPage(
  scope: string,
  roles: any[]
): string {
  // Map scopes/roles to recommended landing pages
  if (scope === "admin" || scope === "user") {
    return "/app"  // Admin dashboard
  }

  if (scope === "merchant" || roles.includes("merchant")) {
    return "/app/stores"  // Merchant dashboard (if exists)
  }

  if (roles.includes("seller")) {
    return "/app/seller"  // Seller portal (if exists)
  }

  return "/app"  // Default fallback
}

function getAccessiblePages(scope: string, roles: any[]): string[] {
  const pages: Set<string> = new Set()

  // Everyone gets access to:
  pages.add("/app")  // Dashboard
  pages.add("/app/logout")

  if (scope === "admin" || scope === "user") {
    // Admin/User pages
    pages.add("/app/orders")
    pages.add("/app/products")
    pages.add("/app/customers")
    pages.add("/app/settings")
    pages.add("/app/users")
  }

  if (scope === "merchant" || roles.includes("merchant")) {
    // Merchant pages (if they exist in your setup)
    pages.add("/app/stores")  // List of stores they manage
    pages.add("/app/products")  // Their products
    pages.add("/app/orders")  // Their orders
  }

  if (roles.includes("seller")) {
    // Seller-specific pages
    pages.add("/app/seller/dashboard")
    pages.add("/app/seller/inventory")
  }

  return Array.from(pages)
}

function getAccessNotes(scope: string, roles: any[]): string[] {
  const notes: string[] = []

  if (scope === "merchant" || roles.includes("merchant")) {
    notes.push(
      "You are a MERCHANT. You may have access to limited pages (stores, products, orders)."
    )
    notes.push(
      "If you're getting 404 on /app/merchants, that page may not exist in this Admin UI version."
    )
    notes.push("Try accessing: /app/stores or /app/products instead")
  }

  if (scope === "admin" || scope === "user") {
    notes.push("You are an ADMIN. You should have access to most pages.")
    notes.push("If pages are returning 404, check Admin UI routing configuration.")
  }

  notes.push("")
  notes.push("⚠️  If you see 304 (Not Modified) status codes:")
  notes.push("  - Clear browser cache: Ctrl+Shift+Delete")
  notes.push("  - Hard refresh the page: Ctrl+F5")
  notes.push("  - Log out and log back in")

  return notes
}
