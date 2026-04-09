# Invite Link 404 Troubleshooting Guide

## Quick Diagnosis

Your **invite notification subscriber is working correctly**. The issue is the `/app/invite` page returning 404 when users click the links.

### Step 1: Verify Invites Are Being Created  
**Endpoint**: `GET http://localhost:9000/admin/invites/diagnostic`

This shows:
- All recent invites in the system
- Their tokens and expiry dates
- Generated invite URLs
- Whether any are expired or already accepted

👉 **Action**: Run this endpoint and check:
- [ ] Do invites exist?
- [ ] Are tokens present (not empty)?
- [ ] Are any already expired?
- [ ] Are any already accepted?

---

## Issue Analysis

### Scenario A: Invites Don't Exist
**Problem**: `/admin/invites/diagnostic` shows "No invites found"  
**Cause**: Invites aren't being created when you use the admin invite feature  
**Solution**: 
1. Verify you're creating invites through the original Medusa admin interface (`/app`)
2. NOT through our custom `/api/admin/invites/send` endpoint (that just sends emails)
3. Check the backend logs for errors when creating invites

### Scenario B: Invites Exist but Token is Invalid/Expired
**Problem**: Diagnostic shows invites exist but all are expired or tokens are empty  
**Cause**: 
- Invites were created long ago and naturally expired
- Token field is NULL in database
**Solution**:
1. Create fresh invites via the admin panel
2. Check that `expires_at` is in the future
3. Verify the token field isn't NULL

### Scenario C: Invites Are Valid but `/app/invite` Returns 404
**Problem**: Invites exist, tokens are valid, but clicking the link gives 404  
**Cause**: Admin UI page doesn't exist or isn't being served  
**Root Causes**:
1. **Marketplace Plugin Issue**: The `patch-admin.js` may have broken the admin UI
2. **Admin UI Not Compiled**: The dashboard files weren't generated
3. **Admin UI Doesn't Have Invite Page**: Non-standard Medusa setup

**Solution**:

#### Option A: Rebuild Admin UI (Recommended)
```bash
cd /home/hi/projects/TIF_medusa/tif-medusa
yarn medusa develop  # or: yarn dev
```
This rebuilds the dashboard. Watch for compile errors.

#### Option B: Test Without Marketplace Plugin
Temporarily comment out the marketplace plugin in `medusa-config.ts`:
```typescript
// plugins: [
//   {
//     resolve: "@techlabi/medusa-marketplace-plugin",
//     options: {},
//   },
// ]
```
Then restart the backend and test if `/app/invite` works.

#### Option C: Check Admin UI Files
```bash
ls -la node_modules/@medusajs/dashboard/dist/ | grep -i invite
```
If no invite files found, Dashboard wasn't compiled properly.

---

## Current Implementation

### How Invites Work in Your Setup

```
1. Admin creates invite via /app UI
   ↓
2. Medusa fires invite.created event
   ↓
3. invite-notification.ts subscriber receives event
   ↓
4. Retrieves full invite from USER module (with token)
   ↓
5. Builds URL: http://localhost:9000/app/invite?token=<JWT>
   ↓
6. Sends email via SendGrid
   ↓
7. Subadmin receives email and clicks link
   ↓
8. Browser navigates to /app/invite?token=...
   ↓
9. Admin UI page should load and handle token
   ↓
10. User sets password and accepts invite
```

**What's Broken**: Step 8-9 (Admin UI doesn't serve `/app/invite` page)

---

## The Custom Endpoint (For Reference)

We also have `/api/admin/invites/send` which is a manual way to send invite emails if the automatic flow breaks:

```bash
curl -X POST http://localhost:9000/admin/invites/send \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subadmin@example.com",
    "inviteLink": "http://localhost:9000/app/invite?token=your-token-here",
    "senderName": "Your Company"
  }'
```

But this requires you to manually construct the invite link (not recommended).

---

## Recommended Next Steps

1. **Run the diagnostic endpoint**: `GET /admin/invites/diagnostic`
2. **Check the output** and identify which scenario you're in
3. **Try rebuilding** with `yarn medusa develop`
4. **If still broken**: Temporarily disable marketplace plugin and test
5. **Check backend logs** for any initialization errors

---

## Files to Review

- **Subscriber**: `src/subscribers/invite-notification.ts` ✅ (Working correctly)
- **Diagnostic Endpoint**: `src/api/admin/invites/diagnostic/route.ts` (New)
- **Config**: `medusa-config.ts` (Check if modules are registered)
- **Patch Script**: `node_modules/@techlabi/medusa-marketplace-plugin/.medusa/server/src/patch-admin.js` (May need investigation)

---

## Advanced Debugging

If the diagnostic endpoint shows valid invites but `/app/invite` still 404s:

### Check Backend Logs
```bash
cd /home/hi/projects/TIF_medusa/tif-medusa
yarn dev 2>&1 | grep -i "invite\|app\|admin" | head -50
```

### Check if Dashboard Route Exists
```bash
curl -i http://localhost:9000/app/invite?token=test
# Look at response headers - should be 200 or redirect, not 404
```

### Check for Redirect loops
The admin UI might redirect unauthenticated users:
- If you're logged out: May redirect to login first
- If you're logged in: Should load the invite acceptance page

---

## Long-term Solution

If the marketplace plugin is causing issues, consider:
1. Reporting issue to `@techlabi/medusa-marketplace-plugin` maintainers
2. Using a different marketplace solution
3. Manually managing the admin UI without the plugin
