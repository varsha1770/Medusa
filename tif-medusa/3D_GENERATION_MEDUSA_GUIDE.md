# 3D Product Generation Integration - TIF Medusa Admin

This document describes the integration of the 3D product generation system from ConsumAR into the TIF Medusa backend admin interface.

## Overview

The 3D generation workflow from ConsumAR has been fully ported to Medusa's admin dashboard, allowing merchants to:

1. **Generate 3D Models** - Upload product images to EC2 service for GLB model generation
2. **Preview Models** - View generated 3D models with Google Model Viewer integration
3. **Resize Models** - Adjust product dimensions (width, height, depth) with automatic GLB resizing
4. **Convert Formats** - Convert GLB to USDZ for iOS AR applications
5. **Upload to S3** - Store all assets (GLB, USDZ, poster images) in AWS S3 buckets

## Architecture

### API Routes

All generation API routes are deployed to Medusa's `/admin` endpoint under `src/api/admin/`:

| Route | Method | Purpose |
|-------|--------|---------|
| `/admin/3d-generate` | POST | Forward image uploads to EC2 and receive GLB s3_key |
| `/admin/3d-resize` | POST | Resize GLB model with custom dimensions |
| `/admin/3d-convert-usdz` | POST | Convert GLB to USDZ format |
| `/admin/3d-proxy-model` | GET | CORS proxy for S3/CloudFront model access |

### Admin Widget

**File:** `src/admin/widgets/product-generation.tsx`

Medusa admin widget that appears on product detail pages (`product.details.after` zone) providing:
- Image upload interface
- Generation status tracking
- Dimension editor for resize operations
- Asset preview and download links
- CORS-safe model viewer access

### Configuration & Dependencies

**Environment Variables** (`.env`):
```env
EC2_GENERATE_URL=http://13.232.237.176:5000/run
EC2_USDZ_URL=http://13.232.237.176:5000/convert_usdz
EC2_RESIZE_URL=http://13.232.237.176:5000/resize

AWS_S3_REGION=ap-south-1
AWS_S3_BUCKET_MODELS=tryitproductmodels
AWS_S3_BUCKET_IMAGES=tryitproductimages
```

**Required NPM Packages:**
- `@aws-sdk/client-s3` - For S3 upload operations
- `@medusajs/ui` - Medusa UI components used in widget
- `react-i18next` - Translations support in widget

## How to Use (Admin Workflow)

### Step 1: Upload Product Images

1. Navigate to a product detail page in Medusa Admin
2. Scroll to "3D Model Generation" widget (at bottom of page)
3. Click "Browse" and select product images (JPEG, PNG, or WebP)
4. Click "Generate 3D Model"

### Step 2: Monitor Generation

- Widget shows "Uploading" status as images are sent to EC2
- EC2 service processes images into a GLB 3D model (110s timeout)
- GLB is auto-uploaded to S3 bucket `tryitproductmodels`
- USDZ conversion happens automatically for iOS AR support
- Poster image generated and saved to S3

### Step 3: View & Adjust Dimensions

1. Once generation completes, "Model Dimensions" section appears
2. Edit width, height, depth values and unit (mm/cm/in/ft/m)
3. Click "Apply Dimensions" to trigger resize operation
4. EC2 service returns resized GLB model
5. Updated GLB is saved/replaced in S3

### Step 4: Access 3D Assets

"Assets" section shows download/preview links for:
- **GLB Model** - Primary 3D format for web viewers
- **USDZ Model** - iOS AR-compatible format
- **Poster Image** - Product image for listings

All assets are stored in S3 with `public-read` ACL for direct browser access.

## Data Persistence

All 3D asset URLs are stored in the product record as metadata or custom fields. Unlike ConsumAR, Medusa does not require separate backend schema changes - metadata is handled via Medusa's native custom field system.

### Storing 3D Metadata (Custom Fields)

To persist 3D URLs on product create/edit, add custom field configuration in `src/admin/custom-fields/product-3d.ts`:

```typescript
import { unstable_defineCustomFieldsConfig, unstable_createFormHelper } from "@medusajs/admin-sdk"

const form = unstable_createFormHelper()

export default unstable_defineCustomFieldsConfig({
  model: "product",
  link: "product_3d",  // Links to custom module storing 3D data
  forms: [
    {
      zone: "create",
      fields: {
        glb_model_url: form.define({
          validation: form.string().nullish(),
          defaultValue: "",
        }),
        usdz_model_url: form.define({
          validation: form.string().nullish(),
          defaultValue: "",
        }),
        poster_image_url: form.define({
          validation: form.string().nullish(),
          defaultValue: "",
        }),
      },
    },
    {
      zone: "edit",
      fields: {
        glb_model_url: form.define({
          validation: form.string().nullish(),
          defaultValue: "",
        }),
        usdz_model_url: form.define({
          validation: form.string().nullish(),
          defaultValue: "",
        }),
        poster_image_url: form.define({
          validation: form.string().nullish(),
          defaultValue: "",
        }),
      },
    },
  ],
})
```

## Model Viewer Integration

The widget uses Medusa's built-in component system. For actual 3D preview in a modal/drawer:

```typescript
// Optional: Add model viewer component
import "@google/model-viewer"

const ModelViewer = ({ src }: { src: string }) => (
  <model-viewer
    src={src}
    alt="Product 3D Model"
    auto-rotate
    camera-controls
    style={{ width: "100%", height: "500px" }}
  />
)
```

## ConsumAR Feature Parity

| Feature | ConsumAR | Medusa Admin | Notes |
|---------|----------|-------------|-------|
| Generate from images | ✓ | ✓ | Same EC2 service |
| GLB preview | ✓ | ✓ | Google Model Viewer |
| Resize models | ✓ | ✓ | Same EC2 service |
| Convert to USDZ | ✓ | ✓ | Same EC2 service |
| S3 storage | ✓ | ✓ | Same buckets |
| Poster extraction | ✓ | ✓ | Auto-generated |
| Dimension units | ✓ | ✓ | mm/cm/in/ft/m support |
| Metadata persistence | ✓ | ✓ | Via custom fields |

## Environment & Deployment

### Development

```bash
# Start Medusa backend with 3D routes
yarn dev

# Routes available at:
# http://localhost:9000/admin/3d-generate
# http://localhost:9000/admin/3d-resize
# etc.
```

### Production

1. Ensure EC2 service (13.232.237.176:5000) is accessible from server
2. Configure AWS credentials for S3 access
3. Update `.env` with production S3 bucket names if different
4. Optional: Set up CloudFront CDN for S3 model delivery (faster load times)

## Error Handling

Widget displays user-friendly error messages:
- **"Generation failed"** - EC2 service error or timeout
- **"Cannot reach EC2"** - Network/connectivity issue (check EC2_GENERATE_URL)
- **"Resize failed"** - Dimension values invalid or EC2 issue
- **"Conversion timed out"** - USDZ conversion exceeded 90s limit

All errors are logged to console with request details for debugging.

## Next Steps

1. **Install dependencies** - Add @aws-sdk/client-s3 if not present
2. **Test generation** - Create test product and verify widget appears
3. **Verify S3 access** - Ensure AWS credentials allow upload to buckets
4. **Monitor logs** - Check Medusa server logs during first generation
5. **Add custom fields** - Optionally persist 3D URLs on product model
6. **Update storefront** - Integrate 3D model URLs into product pages/AR viewer

## Troubleshooting

**Widget not showing?**
- Ensure `src/admin/widgets/product-generation.tsx` is in correct directory
- Check Medusa admin build logs for errors
- Verify product detail page loads other widgets first

**EC2 connection errors?**
- Verify `EC2_GENERATE_URL` is correct and accessible
- Check firewall/security groups allow outbound traffic to 13.232.237.176:5000
- Test with curl: `curl -I http://13.232.237.176:5000/run`

**S3 upload failures?**
- Verify AWS credentials are configured (via IAM roles or env vars)
- Check bucket names and region match `.env`
- Ensure IAM policy allows PutObject on bucket

**Slow generation?**
- EC2 service takes 60-110s depending on image count/size
- Use smaller, lower-resolution images for faster processing
- Monitor EC2 server status if consistently slow
