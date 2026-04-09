# Invite Acceptance Redirect Issues - Fix Guide

## 🔴 The Problem

After users **accept an invite**, they get:
```
404 - There is no page at this address
Check the URL and try again, or use the search bar to find what you are looking for.
```

**Root Cause**: 
- Admin UI is redirecting invited users to `/app/merchants` (or similar)
- That page doesn't exist in the current Admin UI version
- OR the page exists but Auth context is lost (causing 304 Not Modified responses)

---

## 🟢 Immediate Fix: Clear Cache & Hard Refresh

If pages are loading but showing 304 (Not Modified) status, the browser cache is stale:

### For Users:
```
1. Clear browser cache completely:
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Develop → Empty Caches

2. Hard refresh the page:
   - Ctrl+F5 (Windows/Linux)
   - Cmd+Shift+R (Mac)

3. Log out completely and log back in:
   - Go to /app
   - Click Logout
   - Close browser tab
   - Re-open and login fresh
```

---

## 🔧 Longer-Term Fix: Check What's Actually Happening

### Step 1: Diagnose User Status

After accepting invite, check what the user's role/scope is:

```bash
# Get your auth token from browser:
# 1. Right-click → Inspect → Console
# 2. Paste this: localStorage.getItem('medusa_auth_token') or document.cookie
TOKEN="your-token-here"

# Check your user status
curl http://localhost:9000/admin/invites/user-status \
  -H "Authorization: Bearer $TOKEN"
```

**Response will show**:
```json
{
  "user": {
    "id": "user_123",
    "email": "merchant@example.com",
    "scope": "merchant",  // ← This is key
    "roles": ["merchant"]
  },
  "accessInfo": {
    "recommendedLandingPage": "/app/stores",
    "accessiblePages": ["/app", "/app/stores", "/app/products", ...],
    "notes": [
      "You are a MERCHANT. Limited access to pages.",
      "Try /app/stores instead of /app/merchants"
    ]
  }
}
```

---

### Step 2: Understand Role-Based Routing

The issue is that **invited users have different roles** that map to different pages:

| User Type | Role | Landing Page | Routes |
|-----------|------|--------------|--------|
| Admin (created via UI) | `admin` | `/app` | All pages work |
| Invited as Merchant | `merchant` | `/app/merchants` | ❌ Doesn't exist |
| Invited as Superadmin | `superadmin` | `/app` | All pages |
| Invited as Regular User | `user` | `/app` | Standard pages |

**The Problem**: `/app/merchants` page doesn't exist in current Admin UI!

---

## ✅ Solution Options

### Option A: Create the Missing `/app/merchants` Page (Recommended)

The Admin UI needs a merchants page. This would be in the marketplace plugin or custom routes.

**Status**: Requires development work to create this page in the Admin UI.

---

### Option B: Change Invite User Role (Quick Fix for Now)

When creating invites, assign them `admin` or `superadmin` role instead of `merchant`:

```bash
# Check how invites are being created
# They should be created with correct role/scope that maps to existing pages
```

---

### Option C: Redirect Users to Available Page (Workaround)

Until the `/app/merchants` page exists, invited merchants should be redirected to one of these instead:

✅ **Available Pages**:
- `/app` - Main dashboard
- `/app/stores` - Store management (if using marketplace plugin)
- `/app/products` - Products list
- `/app/orders` - Orders list

```bash
# After accepting invite, manually navigate to:
http://localhost:9000/app/stores
# or
http://localhost:9000/app/products
```

---

## 🔍 Troubleshooting Step-by-Step

### Step 1: Test if Dashboard Page Exists

```bash
TOKEN="your-token"

# Try the default landing page
curl -i http://localhost:9000/app \
  -H "Authorization: Bearer $TOKEN"
# Should return 200, not 304

# If it returns 304, the page exists but auth header issue
# If it returns 404, page doesn't exist at all
```

### Step 2: Check What Pages Actually Work

```bash
TOKEN="your-token"

# Test each major page
for page in "" "stores" "products" "orders" "customers" "merchants" "sellers"; do
  echo "Testing /app/$page"
  curl -s -o /dev/null -w "Status: %{http_code}\n" \
    http://localhost:9000/app/$page \
    -H "Authorization: Bearer $TOKEN"
done
```

**Output will show which pages exist**:
```
Testing /app/
Status: 200  ✅ Works

Testing /app/stores
Status: 200  ✅ Works

Testing /app/products
Status: 200  ✅ Works

Testing /app/merchants
Status: 404  ❌ Doesn't exist
```

### Step 3: Clear All Caches

```bash
# Browser cache (User's browser)
# 1. Ctrl+Shift+Delete
# 2. Select "All time"
# 3. Clear cache

# Backend cache (may be needed)
cd /home/hi/projects/TIF_medusa/tif-medusa
rm -rf .medusa/cache  # Clear local cache
yarn medusa develop   # Restart backend
```

### Step 4: Test Fresh Login

```
1. Go to http://localhost:9000/app
2. Complete logout:
   - Click profile → Logout (or hit /app/logout)
   - Close the browser tab completely
   
3. Open new browser tab (clean session)

4. Manually navigate instead of using email link:
   http://localhost:9000/app
   Login with: email/password
   
5. Check if you can access pages now
```

---

## 📋 Why This Happens

### The Flow:

```
1. User receives email with invite link
   ↓
   http://localhost:9000/app/invite?token=JWT

2. User clicks link → goes to /app/invite page
   ↓
   Admin UI loads invite acceptance page

3. User accepts invite
   ↓
   Admin UI processes accept action

4. User is redirected to... ?
   ↓
   If role="merchant":
     Redirect to → /app/merchants  ❌ Doesn't exist!
   If role="admin":
     Redirect to → /app  ✅ Works
```

### The 304 Problem:

```
Request to /app/merchants with auth header:
  ↓
  Server checks If-Modified-Since / ETag from browser cache
  ↓
  Page hasn't changed since last cached version
  ↓
  Returns 304 Not Modified
  ↓
  Browser uses cached (expired) page
  ↓
  Old page tries to load assets with old auth context
  ↓
  Assets fail to load (new auth context incompatible)
  ↓
  Page shows 404 or broken state
```

---

## 🧪 Test & Verify Fix

### Test 1: Check User Status After Invite

```bash
TOKEN="your-token-from-invite"

curl http://localhost:9000/admin/invites/user-status \
  -H "Authorization: Bearer $TOKEN" | jq .

# Should show:
# - Your role/scope
# - Recommended landing page
# - What pages you can access
```

### Test 2: Verify Cache is Clear

```bash
TOKEN="your-token"

# Request should return 200 (fresh data), NOT 304 (cached)
curl -i http://localhost:9000/app \
  -H "Authorization: Bearer $TOKEN" | head -1

# Should see:
# HTTP/1.1 200 OK
# NOT:
# HTTP/1.1 304 Not Modified
```

### Test 3: Test Each Page

```bash
TOKEN="your-token"

echo "Testing accessible pages:"
curl -s http://localhost:9000/app/stores \
  -H "Authorization: Bearer $TOKEN" > /dev/null && echo "✓ /app/stores works"

curl -s http://localhost:9000/app/products \
  -H "Authorization: Bearer $TOKEN" > /dev/null && echo "✓ /app/products works"

curl -s http://localhost:9000/app/orders \
  -H "Authorization: Bearer $TOKEN" > /dev/null && echo "✓ /app/orders works"
```

---

## 📚 What to Tell Your Users

**Short version:**
```
If you get 404 after accepting invite:

1. Clear your browser cache (Ctrl+Shift+Delete)
2. Hard refresh the page (Ctrl+F5)
3. Log out and log back in fresh

If pages still show errors:
4. Try accessing /app/stores or /app/products directly
5. Contact support with the role/scope info
```

---

## 🚀 Long-Term Solution

**For your development team**:

1. **Identify the problematic redirect**:  
   - Where in Admin UI code is the redirect after invite acceptance?
   - What role/scope are invited users getting?
   - Update the redirect logic to only go to pages that exist

2. **Create missing pages**:  
   - If `/app/merchants` should exist, create it
   - OR update role assignment so merchants go to `/app/stores`

3. **Fix caching on Auth**:  
   - Ensure Auth state change clears HTTP cache headers
   - Clear browser cache on new login
   - Use Cache-Control: no-cache for admin routes

4. **Add role-based routing**:  
   - Map roles to correct landing pages
   - Validate user has permission for requested page
   - Redirect to allowed page if not authorized

---

## 📁 Files Created

- `src/api/admin/invites/user-status/route.ts` - Diagnostic endpoint
- This guide - `INVITE_REDIRECT_FIX.md`

---

## 🔗 Quick Links

- **Diagnostic endpoint**: `GET /admin/invites/user-status`
  ```bash
  curl http://localhost:9000/admin/invites/user-status \
    -H "Authorization: Bearer YOUR_TOKEN"
  ```

- **Check invite system**: `GET /admin/invites/diagnostic`
  ```bash
  curl http://localhost:9000/admin/invites/diagnostic
  ```

---

## ⚠️ Common Issues & Fixes

### Issue: "404 on /app/merchants"
**Fix**: User doesn't have permission or page doesn't exist. Check `/app/stores` instead.

### Issue: "Pages return 304 Not Modified"
**Fix**: Clear browser cache (Ctrl+Shift+Delete) and hard refresh (Ctrl+F5).

### Issue: "Page loads but doesn't show data"
**Fix**: API calls may be failing due to auth context. Log out and log back in fresh.

### Issue: "Can access /app but not /app/something"
**Fix**: Your role may not have permission. Contact admin to grant access.

---

## 📞 Next Steps

1. **Run diagnostic**: `curl http://localhost:9000/admin/invites/user-status`
2. **Check response**: What role/scope do you have?
3. **Clear cache**: Ctrl+Shift+Delete, then Ctrl+F5
4. **Try working page**: Navigate to `/app/stores` or `/app/products`
5. **Report findings**: The role + recommended page info
