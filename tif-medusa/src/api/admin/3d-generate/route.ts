import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const EC2_GENERATE_URL = process.env.EC2_GENERATE_URL

/**
 * POST /admin/3d-generate
 * Proxies image uploads to EC2 3D generation service (13.232.237.176:5000/run)
 * Returns GLB model URL after generation completes
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    if (!EC2_GENERATE_URL) {
      return res.status(500).json({
        success: false,
        error: "EC2_GENERATE_URL not configured in environment",
      })
    }

    const contentType = req.headers["content-type"] || ""
    if (!contentType.includes("multipart/form-data")) {
      return res.status(400).json({
        success: false,
        error: "Content-Type must be multipart/form-data with image files",
      })
    }

    console.log("[3d-generate] Forwarding multipart payload to EC2:", {
      ec2Url: EC2_GENERATE_URL,
      contentType,
    })

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 110_000) // 110s timeout

    let ec2Response
    try {
      ec2Response = await fetch(EC2_GENERATE_URL, {
        method: "POST",
        headers: {
          "content-type": contentType,
        },
        // Forward the original multipart stream as-is so boundaries/files stay intact.
        body: req as any,
        duplex: "half",
        signal: controller.signal,
      } as any)
    } finally {
      clearTimeout(timer)
    }

    const text = await ec2Response.text()
    console.log(`[3d-generate] EC2 ${ec2Response.status}:`, text.slice(0, 200))

    if (!ec2Response.ok) {
      return res.status(ec2Response.status).json({
        success: false,
        error: `EC2 error (${ec2Response.status}): ${text}`,
      })
    }

    const data = JSON.parse(text)
    return res.status(200).json(data)

  } catch (err: any) {
    console.error("[3d-generate] error:", err)

    if (err.name === "AbortError") {
      return res.status(504).json({
        success: false,
        error: "Generation timed out. Try fewer/smaller images.",
      })
    }
    if (err.cause?.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        error: "Cannot reach EC2 service. Ensure EC2_GENERATE_URL is correct.",
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
