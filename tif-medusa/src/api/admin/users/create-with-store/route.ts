import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import path from "path"

/**
 * Create Admin User with Store Association
 * POST /admin/users/create-with-store
 * 
 * Body:
 * {
 *   "email": "admin@example.com",
 *   "password": "securePassword",
 *   "first_name": "John",
 *   "last_name": "Doe",
 *   "store_id": "store_123"    // Required for marketplace plugin
 * }
 * 
 * Returns:
 * {
 *   "success": true,
 *   "user": { id, email, first_name, last_name },
 *   "message": "User created successfully"
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const payload = (req.body || {}) as Record<string, any>
  const { email, password, store_name } = payload

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["email", "password"],
      message: "Email and password are required to create a user",
    })
  }

  try {
    const createStoreWorkflowPath = path.join(
      process.cwd(),
      "node_modules/@techlabi/medusa-marketplace-plugin/.medusa/server/src/workflows/create-store"
    )
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createStoreWorkflow } = require(createStoreWorkflowPath)

    const finalStoreName = store_name || `${email.split("@")[0]}-store`
    const { result } = await createStoreWorkflow(req.scope).run({
      input: {
        email,
        password,
        store_name: finalStoreName,
      },
    })

    const user = result?.user
    const store = result?.store

    if (!user || !store) {
      return res.status(500).json({
        error: "Store workflow did not return user/store",
      })
    }

    return res.status(201).json({
      success: true,
      message: "User and store created successfully",
      user: {
        id: user.id,
        email: user.email,
      },
      store: {
        id: store.id,
        name: store.name,
      },
      nextSteps: {
        step1: "User can now login at /app with email and password",
        step2: `User is associated with store: ${store.id}`,
        step3: "If using API, include token in Authorization header: Authorization: Bearer <token>",
      },
    })
  } catch (error: any) {
    console.error("User creation failed:", error)
    return res.status(500).json({
      error: "Failed to create user",
      details: error.message,
      debugging: {
        errorName: error.name,
        suggestion: "Verify USER and AUTH modules are properly initialized",
      },
    })
  }
}
