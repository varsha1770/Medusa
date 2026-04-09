/**
 * S3 Upload Utility for 3D Models and Product Images
 * Handles direct uploads to AWS S3 buckets configured for 3D assets
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || process.env.AWS_REGION || "ap-south-1",
})

export interface S3UploadOptions {
  bucket: string
  key: string
  body: Buffer | Uint8Array | string
  contentType?: string
  metadata?: Record<string, string>
}

/**
 * Upload a file to S3
 * @param options Upload options
 * @returns S3 key of uploaded file
 */
export async function uploadToS3(options: S3UploadOptions): Promise<string> {
  const { bucket, key, body, contentType = "application/octet-stream", metadata } = options

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
      // Enable public read if needed for model viewer access
      ACL: "public-read",
    })

    await s3Client.send(command)
    console.log(`[s3-upload] Successfully uploaded s3://${bucket}/${key}`)

    return key
  } catch (error: any) {
    console.error(`[s3-upload] Failed to upload to ${bucket}/${key}:`, error)
    throw new Error(`S3 upload failed: ${error.message}`)
  }
}

/**
 * Get S3 bucket names from environment
 */
export function getS3Buckets() {
  return {
    models: process.env.AWS_S3_BUCKET_MODELS || process.env.S3_MODELS_BUCKET || "tryitproductmodels",
    images: process.env.AWS_S3_BUCKET_IMAGES || process.env.S3_IMAGES_BUCKET || "tryitproductimages",
  }
}

/**
 * Get EC2 generation service URLs
 */
export function getEC2Urls() {
  return {
    generate: process.env.EC2_GENERATE_URL || "http://13.232.237.176:5000/run",
    usdz: process.env.EC2_USDZ_URL || "http://13.232.237.176:5000/convert_usdz",
    resize: process.env.EC2_RESIZE_URL || "http://13.232.237.176:5000/resize",
  }
}

/**
 * Build S3 URL from bucket and key
 */
export function buildS3Url(bucket: string, key: string): string {
  const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN
  if (cloudFrontDomain) {
    return `https://${cloudFrontDomain}/${key}`
  }
  const region = process.env.AWS_S3_REGION || process.env.AWS_REGION || "ap-south-1"
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
}
