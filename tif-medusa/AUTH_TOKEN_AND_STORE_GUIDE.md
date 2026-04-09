# Auth Token & Store Issues - Debugging Guide

## Problem Summary

You're experiencing **3 related authentication and configuration issues**:

1. **`401 Unauthorized` on `/admin/users/me`** - Auth token not being sent
2. **`"No active store found"` error in Dashboard** - Marketplace plugin can't load store context  
3. **Login fails after API-based user creation** - Token not being generated or persisted

---

## Root Causes

### Issue 1: Auth Token Not Included in Requests

**Error**: `GET /admin/users/me` → `401 Unauthorized`

**Why it happens**:
- You create a user via API
- API returns a token
- You don't include that token in subsequent requests
- Server rejects request as unauthenticated

**Solution**: Always include the token in the `Authorization` header:

```bash
# ❌ WRONG - No auth header, gets 401
curl http://localhost:9000/admin/users/me

# ✅ CORRECT - With token in Authorization header
curl http://localhost:9000/admin/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Issue 2: "No Active Store Found" in Dashboard

**Error in browser console**:
```
FetchError: No active store found
at retrieveActiveStore
```

**Why it happens**:
- The marketplace plugin is trying to load an "active store" for the user
- The user either:
  - Has no store associated 
  - The store doesn't exist
  - The store endpoint (marketplace plugin) is failing to load
- Without a store, the dashboard can't render

**Solution**: Each user needs to be associated with a store:

```bash
# Create a store first, then associate the user
POST http://localhost:9000/admin/stores
{
  "name": "My Store",
  "slug": "my-store"
}
# Returns: { "id": "store_123", "name": "My Store", ... }

# Then create user with store association
POST http://localhost:9000/admin/users/create-with-store
{
  "email": "admin@example.com",
  "password": "securePassword",
  "store_id": "store_123"  // Associate with the store
}
```

---

### Issue 3: Login Flow Broken After API User Creation

**Symptom**: You create a user via API but can't log in afterward

**Why it happens**:
- Admin UI uses **manual login flow** (email + password → get token)
- API-created users work, but the auth token generation may fail
- OR the Auth identity (password hash) isn't being set correctly

**Solution**: Use the new `/admin/users/create-with-store` endpoint which:
1. Creates the user
2. Sets the password (auth identity) 
3. Attempts to generate an auth token
4. Associates with a store
5. Returns the token for immediate use

---

## Step-by-Step Fix

### Step 1: Create a Store (Required by Marketplace Plugin)

```bash
curl -X POST http://localhost:9000/admin/stores \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TIF Store",
    "slug": "tif-store"
  }'

# Response:
# {
#   "id": "store_123",
#   "name": "TIF Store",
#   "slug": "tif-store",
#   ...
# }
```

**Save the store ID** - you'll need it for creating users.

---

### Step 2: Create a User with Store Association

```bash
curl -X POST http://localhost:9000/admin/users/create-with-store \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subadmin@example.com",
    "password": "SecurePassword123!",
    "first_name": "John",
    "last_name": "Doe",
    "store_id": "store_123"
  }'

# Response:
# {
#   "success": true,
#   "user": {
#     "id": "user_abc123",
#     "email": "subadmin@example.com",
#     "first_name": "John",
#     "last_name": "Doe"
#   },
#   "token": "eyJhbGciOiJIUzI1NiIs...",  ← SAVE THIS TOKEN
#   "store": {
#     "id": "store_123"
#   },
#   "nextSteps": { ... }
# }
```

**Save the token** in a secure location.

---

### Step 3: Use the Token in Requests

```bash
# Using the token from Step 2:
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# Verify user is authenticated
curl http://localhost:9000/admin/users/me \
  -H "Authorization: Bearer $TOKEN"

# Response should show user info (not 401):
# {
#   "id": "user_abc123",
#   "email": "subadmin@example.com",
#   ...
# }
```

---

### Step 4: Login to Admin UI

Now the user should be able to login via browser at `http://localhost:9000/app`:

1. Go to `http://localhost:9000/app`
2. **Email**: `subadmin@example.com`
3. **Password**: `SecurePassword123!`
4. Dashboard should load **without** "No active store found" error

---

## Troubleshooting

### Still Getting 401 on `/admin/users/me`?

**Solution 1**: Verify token is included
```bash
# Check if Authorization header is present
curl -i http://localhost:9000/admin/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should show: HTTP/1.1 200 OK (not 401)
```

**Solution 2**: Token may have expired
```bash
# Get a new token by logging in
curl -X POST http://localhost:9000/admin/auth/emailpass/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subadmin@example.com",
    "password": "SecurePassword123!"
  }'
```

**Solution 3**: Password may not have been set
```bash
# Create user again with the new endpoint
POST http://localhost:9000/admin/users/create-with-store
{
  "email": "subadmin@example.com",
  "password": "SecurePassword123!",
  "store_id": "store_123"
}
```

---

### Still Getting "No Active Store Found" in Dashboard?

**Solution 1**: Verify store exists
```bash
curl http://localhost:9000/admin/stores \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return at least one store
```

**Solution 2**: Ensure user is associated with a store
```bash
# Check user details
curl http://localhost:9000/admin/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# User should have a store_id or stores array
# If missing, run create-with-store endpoint again with store_id
```

**Solution 3**: Marketplace plugin may need reload
```bash
# Restart the backend
cd /home/hi/projects/TIF_medusa/tif-medusa
yarn medusa develop
```

---

## Working Example (Complete Flow)

```bash
# 1. Create store
STORE=$(curl -s -X POST http://localhost:9000/admin/stores \
  -H "Content-Type: application/json" \
  -d '{"name": "My Store", "slug": "my-store"}')

STORE_ID=$(echo $STORE | jq -r '.id')
echo "Store created: $STORE_ID"

# 2. Create user with store
USER=$(curl -s -X POST http://localhost:9000/admin/users/create-with-store \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@example.com\",
    \"password\": \"Test123!\",
    \"first_name\": \"Admin\",
    \"last_name\": \"User\",
    \"store_id\": \"$STORE_ID\"
  }")

TOKEN=$(echo $USER | jq -r '.token')
echo "User created with token: $TOKEN"

# 3. Verify authentication works
curl -s http://localhost:9000/admin/users/me \
  -H "Authorization: Bearer $TOKEN" | jq .

# 4. Dashboard should load at http://localhost:9000/app
echo "Login at http://localhost:9000/app with:"
echo "  Email: admin@example.com"
echo "  Password: Test123!"
```

---

## Architecture Overview

```
┌─────────────────────────────┐
│   Browser / API Client      │
└────────┬────────────────────┘
         │
         │ 1. Create Store
         ▼
┌─────────────────────────────┐
│  POST /admin/stores         │
└────────┬────────────────────┘
         │ Creates: store_123
         │
         │ 2. Create User + Store Association
         ▼
┌─────────────────────────────┐
│  POST /admin/users/create   │
│        -with-store          │
└────────┬────────────────────┘
         │ Creates: user with password + store_id
         │ Returns: token
         │
         │ 3. Include token in ALL requests
         ▼
┌─────────────────────────────┐
│  GET /admin/users/me        │
│  Authorization: Bearer ... │
└────────┬────────────────────┘
         │ Verifies authentication ✓
         │
         │ 4. Access Dashboard
         ▼
┌─────────────────────────────┐
│  GET /app (Admin UI)        │
│  - Loads Header component   │
│  - Retrieves active store   │
│  - Dashboard renders ✓      │
└─────────────────────────────┘
```

---

## File Reference

**New Endpoint**: `src/api/admin/users/create-with-store/route.ts`
- **Method**: `POST`
- **Purpose**: Create user + set password + generate token + associate store
- **Returns**: User, token, and store

**Configuration**: `medusa-config.ts`
- **Module**: notification (SendGrid configured)
- **Plugin**: marketplace plugin (requires stores)

---

## Next Steps

1. **Test the flow** using the working example above
2. **Debug using tools**:
   - `GET /admin/invites/diagnostic` - Check invites
   - `GET /admin/users/me` - Check auth (with token)
3. **Verify stores** are created and associated with users
4. **Restart backend** if changes aren't reflected: `yarn medusa develop`

---

## Important Notes

⚠️ **Token Storage**:
- **Browser**: Use httpOnly cookies (most secure)
- **API Client**: Store in memory or secure storage
- **Never**: Commit tokens to code or expose in logs

⚠️ **Marketplace Plugin**:
- Requires every admin user to have an associated store
- "No active store found" means user ↔ store association is missing
- This is a plugin-specific requirement

⚠️ **Auth Methods**:
- Email/password: Native Medusa auth
- Invites: Token-based (via email link)
- API: Use tokens returned by create or login endpoints
