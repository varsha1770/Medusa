import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const EC2_USDZ_URL = process.env.EC2_USDZ_URL

/**
 * POST /admin/3d-convert-usdz
 * Converts GLB model from S3 to USDZ format (iOS AR)
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    if (!EC2_USDZ_URL) {
      return res.status(500).json({
        success: false,
        error: "EC2_USDZ_URL not configured in environment",
      })
    }

    const { s3_key } = req.body || {}

    console.log("[3d-convert-usdz] Received s3_key:", s3_key)

    if (!s3_key) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: s3_key",
      })
    }

    // Build FormData for EC2
    const ec2Form = new FormData()
    ec2Form.append("s3_key", s3_key)

    console.log("[3d-convert-usdz] Forwarding to EC2...")

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 90_000) // 90s timeout

    let ec2Response
    try {
      ec2Response = await fetch(EC2_USDZ_URL, {
        method: "POST",
        body: ec2Form,
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timer)
    }

    const text = await ec2Response.text()
    console.log(`[3d-convert-usdz] EC2 ${ec2Response.status}:`, text.slice(0, 200))

    if (!ec2Response.ok) {
      return res.status(ec2Response.status).json({
        success: false,
        error: `EC2 error (${ec2Response.status}): ${text}`,
      })
    }

    const data = JSON.parse(text)
    return res.status(200).json(data)

  } catch (err: any) {
    console.error("[3d-convert-usdz] error:", err)

    if (err.name === "AbortError") {
      return res.status(504).json({
        success: false,
        error: "Conversion timed out.",
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
