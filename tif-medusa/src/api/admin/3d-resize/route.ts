import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const EC2_RESIZE_URL = process.env.EC2_RESIZE_URL

/**
 * POST /admin/3d-resize
 * Resizes a GLB model from S3 with custom dimensions
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    if (!EC2_RESIZE_URL) {
      return res.status(500).json({
        success: false,
        error: "EC2_RESIZE_URL not configured in environment",
      })
    }

    const { s3_key, depth, width, height, unit } = req.body || {}

    console.log("[3d-resize] Received:", { s3_key, depth, width, height, unit })

    if (!s3_key) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: s3_key",
      })
    }

    const ec2Form = new FormData()
    ec2Form.append("s3_key", s3_key)
    if (depth) ec2Form.append("depth", String(depth))
    if (width) ec2Form.append("width", String(width))
    if (height) ec2Form.append("height", String(height))
    if (unit) ec2Form.append("unit", unit)

    console.log("[3d-resize] Forwarding to EC2...")

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 60_000) // 60s timeout

    let ec2Response
    try {
      ec2Response = await fetch(EC2_RESIZE_URL, {
        method: "POST",
        body: ec2Form,
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timer)
    }

    const text = await ec2Response.text()
    console.log(`[3d-resize] EC2 ${ec2Response.status}:`, text.slice(0, 200))

    if (!ec2Response.ok) {
      return res.status(ec2Response.status).json({
        success: false,
        error: `EC2 error (${ec2Response.status}): ${text}`,
      })
    }

    const data = JSON.parse(text)
    return res.status(200).json(data)

  } catch (err: any) {
    console.error("[3d-resize] error:", err)

    if (err.name === "AbortError") {
      return res.status(504).json({
        success: false,
        error: "Resize timed out.",
      })
    }
    if (err.cause?.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        error: "Cannot reach EC2 service.",
      })
    }

    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    })
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  return res.sendStatus(200)
}
