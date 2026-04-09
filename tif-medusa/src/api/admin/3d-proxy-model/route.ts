import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const AWS_REGION = process.env.AWS_S3_REGION || process.env.AWS_REGION || "ap-south-1"
const MODELS_BUCKET = process.env.AWS_S3_BUCKET_MODELS || "tryitproductmodels"
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN
const EC2_GENERATE_URL = process.env.EC2_GENERATE_URL

function toS3UrlFromKey(key: string) {
  if (CLOUDFRONT_DOMAIN) {
    return `https://${CLOUDFRONT_DOMAIN}/${key}`
  }
  return `https://${MODELS_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`
}

function resolveModelUrl(input: string): { resolvedUrl: string; sourceType: "absolute" | "s3-key" | "ec2-temp" } {
  const raw = String(input || "").trim()

  // Keep already-decoded absolute URLs untouched to preserve AWS signatures.
  if (/^https?:\/\//i.test(raw)) {
    return { resolvedUrl: raw, sourceType: "absolute" }
  }

  // Handle still-encoded absolute URLs (e.g., https%3A%2F%2F...)
  if (/^https?%3A%2F%2F/i.test(raw)) {
    try {
      const onceDecoded = decodeURIComponent(raw)
      return { resolvedUrl: onceDecoded, sourceType: "absolute" }
    } catch {
      // Fall through to remaining logic.
    }
  }

  const cleaned = raw.replace(/^\/+/, "")

  // EC2 often returns temporary keys like temp/<uuid>.glb or temp/<uuid>.usdz
  if (cleaned.startsWith("temp/")) {
    if (!EC2_GENERATE_URL) {
      throw new Error("EC2_GENERATE_URL is required to resolve temp/* model paths")
    }
    const ec2Origin = new URL(EC2_GENERATE_URL).origin
    return {
      resolvedUrl: new URL(cleaned, `${ec2Origin}/`).toString(),
      sourceType: "ec2-temp",
    }
  }

  // Treat remaining relative values as S3 object keys.
  return {
    resolvedUrl: toS3UrlFromKey(cleaned),
    sourceType: "s3-key",
  }
}

/**
 * GET /admin/3d-proxy-model
 * CORS proxy for S3/CloudFront model URLs
 * Query param: url=<encoded_s3_or_cloudfront_url>
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { url } = req.query
    const { download, filename } = req.query

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        error: "Missing url query parameter",
      })
    }

    const { resolvedUrl, sourceType } = resolveModelUrl(url)

    // Security: only allow S3 / CloudFront URLs + configured EC2 host for temp files
    let parsed
    try {
      parsed = new URL(resolvedUrl)
    } catch {
      return res.status(400).json({
        error: "Invalid URL",
      })
    }

    const allowedHosts = [".amazonaws.com", ".cloudfront.net"]
    if (EC2_GENERATE_URL) {
      try {
        allowedHosts.push(new URL(EC2_GENERATE_URL).hostname)
      } catch {
        // Ignore invalid EC2 url config; requests will still be restricted to AWS hosts.
      }
    }

    const isAllowed = allowedHosts.some((h) => parsed.hostname.endsWith(h))
    if (!isAllowed) {
      return res.status(403).json({
        error: "Only AWS URLs (S3/CloudFront) and configured EC2 host are allowed",
      })
    }

    console.log("[3d-proxy-model] Proxying:", {
      sourceType,
      hostname: parsed.hostname,
      pathname: parsed.pathname,
    })

    const s3Response = await fetch(resolvedUrl, { cache: "no-store" })

    if (!s3Response.ok) {
      const upstreamText = await s3Response.text().catch(() => "")
      return res.status(s3Response.status).json({
        error: `Upstream error: ${s3Response.status}`,
        details: upstreamText.slice(0, 500),
      })
    }

    const contentType = s3Response.headers.get("content-type") || "application/octet-stream"
    const contentLength = s3Response.headers.get("content-length")

    // Set CORS headers for browser access
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "*")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.setHeader("Content-Type", contentType)

    if (download === "1") {
      const safeName = typeof filename === "string" && filename.trim() ? filename.trim() : "model"
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`)
    }

    if (contentLength) {
      res.setHeader("Content-Length", contentLength)
    }

    // Stream the response body
    if (s3Response.body) {
      const reader = s3Response.body.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          res.write(value)
        }
      } finally {
        reader.releaseLock()
      }
    }

    return res.end()

  } catch (err: any) {
    console.error("[3d-proxy-model] error:", err)
    return res.status(500).json({
      error: err.message || "Proxy error",
    })
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "*")
  return res.sendStatus(200)
}
