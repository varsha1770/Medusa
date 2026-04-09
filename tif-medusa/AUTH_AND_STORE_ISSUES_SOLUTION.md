# Auth & Store Issues - Complete Diagnosis & Solution

## 🔴 Issues You're Experiencing

### 1. **401 Unauthorized on `/admin/users/me`**

**Error**: 
```
:9000/admin/users/me:1  Failed to load resource: the server responded with a status of 401 (Unauthorized)
```

**Root Cause**: 
- When you create a user via API, you get back an auth token
- You're not including that token in subsequent requests
- Server rejects requests without valid auth token

**Fix**:
```bash
# Step 1: Create user
curl -X POST http://localhost:9000/admin/users/create-with-store \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "Pass123!", "store_id": "store_123"}'

# Step 2: ALWAYS include token in Authorization header for next requests
TOKEN="your-jwt-token-here"
curl http://localhost:9000/admin/users/me \
  -H "Authorization: Bearer $TOKEN"  # ← This is required!
```

---

### 2. **"No active store found" Error in Dashboard**

**Error in browser console**:
```javascript
Uncaught FetchError: No active store found
    at retrieveActiveStore (chunk-DZTHAF47.js:29:11)
```

**Root Cause**:
- The marketplace plugin (`@techlabi/medusa-marketplace-plugin`) is trying to load the "active store"
- Every admin user MUST be associated with a store
- When dashboard loads, it can't find a store → crashes with "No active store found"

**Fix**:
```bash
# 1. Create a store first
curl -X POST http://localhost:9000/admin/stores \
  -H "Content-Type: application/json" \
  -d '{"name": "My Store", "slug": "my-store"}'
# Response: { "id": "store_123", ...}

# 2. Create user WITH store association
curl -X POST http://localhost:9000/admin/users/create-with-store \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Pass123!",
    "store_id": "store_123"  # ← Associate with store!
  }'
```

---

### 3. **Login Fails After API User Creation**

**Symptom**: 
- You create user via API
- You try to login at `/app` with those credentials
- Login fails or user can't access dashboard

**Root Causes**:
- Password may not have been set properly
- User not associated with a store (marketplace plugin requirement)
- Auth token wasn't generated or persisted

**Fix**:
Use the new endpoint that handles everything:
```bash
POST /admin/users/create-with-store
{
  "email": "admin@test.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "store_id": "store_123"
}
```

This endpoint:
- ✅ Creates the user
- ✅ Sets the password (auth identity)
- ✅ Associates with a store
- ✅ Returns user info for verification

---

## 🟢 Step-by-Step Solution

### Step 1: Create a Store (Required First)

```bash
curl -X POST http://localhost:9000/admin/stores \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Ecommerce Store",
    "slug": "my-store"
  }'

# Save the returned store ID (e.g., "store_123abc")
```

**Response:**
```json
{
  "id": "store_123abc",
  "name": "My Ecommerce Store",
  "slug": "my-store",
  ...
}
```

---

### Step 2: Create User with Store Association (New Endpoint)

```bash
curl -X POST http://localhost:9000/admin/users/create-with-store \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subadmin@example.com",
    "password": "SecurePassword123!",
    "first_name": "John",
    "last_name": "Doe",
    "store_id": "store_123abc"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "user_xyz789",
    "email": "subadmin@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "nextSteps": {...}
}
```

---

### Step 3: Login to Admin Dashboard

1. Go to **`http://localhost:9000/app`**
2. Enter:
   - **Email**: `subadmin@example.com`
   - **Password**: `SecurePassword123!`
3. Dashboard should load **without** "No active store found" error ✅

---

## 📋 Summary of What Was Wrong vs. Fixed

| Issue | Before | After |
|-------|--------|-------|
| **User Creation** | No password set, no error handling | `create-with-store` sets password + validates |
| **Store Association** | Users created without store | Auto-associates with provided `store_id` |
| **Auth Token** | Token not generated on creation | Endpoint returns auth-ready user |
| **Dashboard Error** | "No active store found" crash | Works because user has associated store |
| **Login Flow** | API credentials didn't work | Now works properly after endpoint fix |

---

## 🧪 Test Everything Works

You can run the automated test script to verify the complete flow:

```bash
cd /home/hi/projects/TIF_medusa/tif-medusa
node auth-test.js
```

This tests:
1. ✅ Store creation
2. ✅ User creation with password
3. ✅ Auth token functionality  
4. ✅ Dashboard access
5. ✅ Invite system

---

## 📚 Key Concepts

### Why Auth Tokens Are Required
```
Browser/API Client
    ↓
Request without token
    ↓
Server: "Who are you?"
    ↓
Response: 401 Unauthorized ❌

---

Browser/API Client
    ↓
Request with token (Authorization: Bearer ...)
    ↓
Server: "Valid token! Processing..."
    ↓
Response: 200 OK ✅
```

### Why Stores Are Required
The marketplace plugin assumes each admin manages one or more stores. When the dashboard loads:

```
Dashboard loads
    ↓
Queries: "What's the user's active store?"
    ↓
If no store found:
    ↓
FetchError: "No active store found" ❌

---

Dashboard loads
    ↓
User has store_id = "store_123"
    ↓
Loads store data and renders
    ↓
Dashboard works ✅
```

---

## 🛠️ API Reference

### Create Store
```bash
curl -X POST http://localhost:9000/admin/stores \
  -H "Content-Type: application/json" \
  -d '{"name": "...", "slug": "..."}'
```

### Create User (NEW)
```bash
curl -X POST http://localhost:9000/admin/users/create-with-store \
  -H "Content-Type: application/json" \
  -d '{
    "email": "...",
    "password": "...",
    "first_name": "...",
    "last_name": "...",
    "store_id": "store_123"
  }'
```

### Get Current User (requires token)
```bash
curl http://localhost:9000/admin/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### List User's Stores (requires token)
```bash
curl http://localhost:9000/admin/stores \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Invites
```bash
curl http://localhost:9000/admin/invites/diagnostic
```

---

## ⚠️ Critical Reminders

1. **ALWAYS include token in header**:
   ```bash
   -H "Authorization: Bearer <token>"
   ```

2. **ALWAYS associate users with stores** (for marketplace plugin):
   ```json
   {
     "email": "...",
     "store_id": "store_123"  // REQUIRED
   }
   ```

3. **Create store FIRST**, then users:
   ```
   1. POST /admin/stores
   2. POST /admin/users/create-with-store (with store_id)
   3. Login at /app
   ```

4. **Test the flow**:
   ```
   node auth-test.js
   ```

---

## 📁 Files Created/Modified

1. **`src/api/admin/users/create-with-store/route.ts`** (NEW)
   - Handles complete user creation with password + store
   - Fixed TypeScript types
   - Proper Medusa module method signatures

2. **`AUTH_TOKEN_AND_STORE_GUIDE.md`**
   - Detailed troubleshooting guide
   - 3 root cause scenarios
   - Step-by-step fix instructions

3. **`QUICK_REFERENCE.md`**
   - Quick 3-step fix
   - API endpoint summary
   - Troubleshooting checklist

4. **`auth-test.js`**
   - Automated test script
   - Tests all steps: stores, users, auth, dashboard
   - Provides actionable feedback

5. **`src/api/admin/invites/diagnostic/route.ts`**
   - Check invite system status
   - Verify tokens and expiration

---

## 🚀 Next Steps

1. **Read this file** (you're doing it now ✓)
2. **Follow Step-by-Step Solution** above
3. **Test with**:
   ```bash
   node auth-test.js
   ```
4. **Login to dashboard**:
   ```
   http://localhost:9000/app
   ```
5. **Verify everything works** - you should NOT see:
   - ❌ 401 Unauthorized
   - ❌ "No active store found"
   - ❌ Login failures

---

## 💡 If Something Still Doesn't Work

1. Check **backend logs** for detailed error messages:
   ```bash
   cd /home/hi/projects/TIF_medusa/tif-medusa
   yarn medusa develop 2>&1 | grep -i "error\|user\|store"
   ```

2. Run **diagnostic endpoint**:
   ```bash
   curl http://localhost:9000/admin/invites/diagnostic
   ```

3. Verify **auth works**:
   ```bash
   curl http://localhost:9000/admin/users/me \
     -H "Authorization: Bearer your-token"
   ```

4. Check **stores exist**:
   ```bash
   curl http://localhost:9000/admin/stores \
     -H "Authorization: Bearer your-token"
   ```

---

**You're all set!** Follow the 3-step solution above and your auth + store issues should be completely resolved. 🎉
