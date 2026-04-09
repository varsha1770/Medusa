/**
 * Configuration constants for 3D product generation integration
 */

export const GENERATE_CONFIG = {
  // EC2 Service timeouts (milliseconds)
  GENERATE_TIMEOUT: 110_000, // 110s for model generation
  RESIZE_TIMEOUT: 60_000,    // 60s for model resizing
  USDZ_TIMEOUT: 90_000,      // 90s for USDZ conversion

  // S3 Bucket Paths
  S3_PATHS: {
    GLB: "models/glb/{productId}/{timestamp}.glb",
    USDZ: "models/usdz/{productId}/{timestamp}.usdz",
    POSTER: "models/posters/{productId}/{timestamp}.jpg",
    IMAGES: "uploads/product-images/{productId}/{timestamp}.jpg",
  },

  // Dimension Units
  UNITS: {
    MM: "mm",
    CM: "cm",
    IN: "in",
    FT: "ft",
    M: "m",
  },

  // Unit Conversions to MM
  UNIT_TO_MM: {
    mm: 1,
    cm: 10,
    in: 25.4,
    ft: 304.8,
    m: 1000,
  },

  // API Endpoints
  API_ENDPOINTS: {
    GENERATE: "/admin/3d-generate",
    RESIZE: "/admin/3d-resize",
    CONVERT_USDZ: "/admin/3d-convert-usdz",
    PROXY_MODEL: "/admin/3d-proxy-model",
  },

  // Supported image formats for generation
  SUPPORTED_FORMATS: ["image/jpeg", "image/png", "image/webp"],
}

export const DEFAULT_PRODUCT_DIMENSIONS = {
  width: 100,    // mm
  height: 100,   // mm
  depth: 100,    // mm
  unit: "mm" as const,
}
