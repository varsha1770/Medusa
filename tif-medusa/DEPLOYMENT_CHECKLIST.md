# 3D Generation Deployment Checklist

## Quick Start (5 minutes)

```bash
# 1. Install dependencies
cd tif-medusa
yarn install

# 2. Verify environment variables
cat .env | grep -E "EC2_|AWS_S3"

# 3. Start development server
yarn dev

# 4. Test widget (open browser)
# http://localhost:5173/admin/products/<any-product-id>
# Scroll down → Look for "3D Model Generation" card
```

---

## Pre-Deployment Checklist

### Code Verification ✓
- [x] `/src/api/admin/3d-generate/route.ts` - Exists
- [x] `/src/api/admin/3d-resize/route.ts` - Exists  
- [x] `/src/api/admin/3d-convert-usdz/route.ts` - Exists
- [x] `/src/api/admin/3d-proxy-model/route.ts` - Exists
- [x] `/src/lib/s3-upload.ts` - Exists
- [x] `/src/lib/generate-config.ts` - Exists
- [x] `/src/admin/widgets/product-generation.tsx` - Exists

### Dependencies ✓
- [x] `@aws-sdk/client-s3@^3.500.0` - Added to package.json
- [ ] `yarn install` - Run locally before deploy

### Environment ✓
- [x] `EC2_GENERATE_URL` - Set in .env
- [x] `EC2_USDZ_URL` - Set in .env
- [x] `EC2_RESIZE_URL` - Set in .env
- [x] `AWS_S3_REGION` - Set to ap-south-1
- [x] `AWS_S3_BUCKET_MODELS` - Set to tryitproductmodels
- [x] `AWS_S3_BUCKET_IMAGES` - Set to tryitproductimages
- [ ] AWS Credentials configured (IAM role or ~/.aws/credentials)

### Network Connectivity
- [ ] EC2 service reachable: `curl http://13.232.237.176:5000/run`
- [ ] S3 bucket accessible: `aws s3 ls s3://tryitproductmodels --region ap-south-1`
- [ ] No firewall blocking Medusa → EC2 (port 5000)

---

## Development Testing (Local)

```bash
# Terminal 1: Start Medusa
yarn dev

# Terminal 2 (once Medusa is running): Test EC2
curl -X POST http://13.232.237.176:5000/run \
  -F "images=@/path/to/test-image.jpg"

# Terminal 3 (once Medusa is running): Test S3
aws s3 cp test.txt s3://tryitproductmodels/test/ --region ap-south-1
```

**Expected Results:**
- Medusa admin loads at http://localhost:5173
- Product page contains "3D Model Generation" widget at bottom
- Widget has image upload input and "Generate" button
- Console has no TypeScript or React errors

---

## Production Deployment

### Docker/Container Deployment
```dockerfile
# In Medusa Dockerfile, after dependencies:
RUN yarn install  # Installs @aws-sdk/client-s3

# Ensure environment variables in production:
ENV EC2_GENERATE_URL=http://13.232.237.176:5000/run
ENV AWS_S3_BUCKET_MODELS=tryitproductmodels
ENV AWS_S3_BUCKET_IMAGES=tryitproductimages
ENV AWS_S3_REGION=ap-south-1
# AWS credentials via IAM role (recommended) or env vars
```

### K8s/ECS Deployment
```yaml
# In deployment spec, add to env:
env:
  - name: EC2_GENERATE_URL
    value: "http://13.232.237.176:5000/run"
  - name: AWS_S3_BUCKET_MODELS
    value: "tryitproductmodels"
  - name: AWS_S3_REGION
    value: "ap-south-1"
  # AWS credentials via IAM role (preferred) or:
  # - name: AWS_ACCESS_KEY_ID
  #   valueFrom:
  #     secretKeyRef:
  #       name: aws-secrets
  #       key: access-key
```

### Manual Server Deployment
```bash
# SSH to server
ssh user@production.server

# Pull latest code
cd /app/tif-medusa
git pull origin main

# Install and build
yarn install
yarn build

# Start with env vars
AWS_S3_REGION=ap-south-1 \
AWS_S3_BUCKET_MODELS=tryitproductmodels \
AWS_S3_BUCKET_IMAGES=tryitproductimages \
EC2_GENERATE_URL=http://13.232.237.176:5000/run \
EC2_USDZ_URL=http://13.232.237.176:5000/convert_usdz \
EC2_RESIZE_URL=http://13.232.237.176:5000/resize \
yarn start
```

---

## Troubleshooting

### Widget not visible
```bash
# 1. Check widget file exists
test -f src/admin/widgets/product-generation.tsx && echo "✓ Widget file found" || echo "✗ Missing"

# 2. Check admin rebuild
yarn build

# 3. Check browser console for errors
# F12 → Console tab
# Look for "defineWidgetConfig" or React errors
```

### Generation fails with "EC2 error"
```bash
# 1. Test EC2 directly
curl -v http://13.232.237.176:5000/run

# 2. Check firewall/network
ping 13.232.237.176
telnet 13.232.237.176 5000  # Should connect, not timeout

# 3. Check Medusa logs
docker logs <medusa-container>  # If containerized
yarn dev  # Check terminal output for HTTP errors

# 4. Verify environment variable set
yarn dev --expose-env | grep EC2_GENERATE_URL
```

### S3 upload fails
```bash
# 1. Test AWS credentials
aws sts get-caller-identity

# 2. Test S3 access
aws s3 ls s3://tryitproductmodels --region ap-south-1

# 3. Check IAM permissions (must have s3:PutObject, s3:GetObject)
aws iam get-user-policy --user-name <user> --policy-name <policy>

# 4. Check region is correct
grep AWS_S3_REGION .env  # Should be ap-south-1
```

---

## Rollback Plan

If 3D generation causes issues:

1. **Disable Widget** (quick fix)
   ```bash
   # Comment out widget config in src/admin/widgets/product-generation.tsx
   // export const config = defineWidgetConfig(...)
   ```

2. **Remove API Routes** (if causing server errors)
   ```bash
   rm -rf src/api/admin/3d-generate src/api/admin/3d-resize src/api/admin/3d-convert-usdz src/api/admin/3d-proxy-model
   ```

3. **Revert Package.json**
   ```bash
   git checkout package.json
   yarn install
   ```

4. **Restart Service**
   ```bash
   yarn build && yarn dev  # Dev
   # or systemctl restart medusa  # Production
   ```

---

## Success Criteria

✅ **Feature is working when:**
1. Admin can upload product image in dashboard
2. Click "Generate 3D Model" starts processing
3. Status shows "Success" after ~30-60 seconds
4. Downloads GLB file from S3 bucket
5. Can adjust dimensions and click "Apply Dimensions"
6. Can download USDZ format for iOS AR

✅ **All files deployed:**
- 4 API route files (3d-generate, 3d-resize, 3d-convert-usdz, 3d-proxy-model)
- 2 library files (s3-upload.ts, generate-config.ts)
- 1 widget component (product-generation.tsx)
- Updated package.json with AWS SDK
- Updated .env with all URLs/buckets

---

## Maintenance

### Monitoring
- **Generation Times:** Log EC2 response times (should be 30-120 seconds)
- **S3 Storage:** Monitor bucket sizes (expect 5-50MB per model)
- **Error Rates:** Track 504/503 timeouts from EC2
- **User Feedback:** Watch for USDZ conversion failures (non-critical)

### Updates
- **AWS SDK:** Monitor @aws-sdk/client-s3 updates (currently ^3.500.0)
- **Medusa Framework:** Ensure admin SDK updates don't break widget zone
- **EC2 Service:** Confirm 13.232.237.176:5000 endpoints remain stable

### Backup & Recovery
- **S3 Models:** Set versioning on tryitproductmodels bucket
- **Widget Config:** Keep src/admin/widgets/product-generation.tsx in version control
- **Environment:** Store .env values in secret manager (not in git)

---

**Ready for deployment. Test locally first, then promote to staging/production.**
