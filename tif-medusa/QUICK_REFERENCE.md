# Quick Reference: Auth & Store Issues

## The Problem

```
User creates account via API → Gets 401 on /admin/users/me 
                            → Dashboard shows "No active store found"
                            → Takes can't login with generated credentials
```

## Root Causes

| Issue | Cause | Solution |
|-------|-------|----------|
| **401 Unauthorized** | Auth token not in request header | Include `Authorization: Bearer <token>` in **all** requests |
| **"No active store found"** | User not associated with a store | Use endpoint: `POST /admin/users/create-with-store` with `store_id` |
| **Login fails** | Password not set or token not generated | New endpoint handles both: password setup + token generation |

---

## 3-Step Fix

### 1️⃣ Create a Store
```bash
curl -X POST http://localhost:9000/admin/stores \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Store",
    "slug": "my-store"
  }'
# Returns: { "id": "store_123", ... }
```

### 2️⃣ Create User + Associate Store
```bash
curl -X POST http://localhost:9000/admin/users/create-with-store \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe",
    "store_id": "store_123"
  }'
# Returns: { "user": {...}, "token": "JWT...", ... }
```

### 3️⃣ Use Token in ALL Requests
```bash
TOKEN="JWT..."

# Verify auth works
curl http://localhost:9000/admin/users/me \
  -H "Authorization: Bearer $TOKEN"

# Dashboard should load at
# http://localhost:9000/app
```

---

## Endpoints Summary

| Endpoint | Method | Purpose | Returns |
|----------|--------|---------|---------|
| `/admin/stores` | POST | Create a store | `{ id, name, slug, ... }` |
| `/admin/users/create-with-store` | POST | Create user + store + password + token | `{ user, token, store }` |
| `/admin/users/me` | GET | Get current user (with token) | `{ id, email, ... }` |
| `/admin/auth/emailpass/login` | POST | Manual login | `{ token, user, ... }` |
| `/admin/invites/diagnostic` | GET | Check invites system | `{ inviteCount, invites[] }` |

---

## Include Token in Requests

```bash
# ❌ WON'T WORK (401)
curl http://localhost:9000/admin/users/me

# ✅ WILL WORK
curl http://localhost:9000/admin/users/me \
  -H "Authorization: Bearer eyJhbGciOi..."
```

---

## Test Everything

```bash
# Run the test script
node auth-test.js

# This verifies:
# ✓ Stores create successfully
# ✓ Users are created with password
# ✓ Auth tokens are returned
# ✓ Tokens work with /admin/users/me
# ✓ Users have store access
# ✓ Invites system works
```

---

## Why This Happens

**Marketplace Plugin Requirement**: The `@techlabi/medusa-marketplace-plugin` assumes every admin user operates a store. When the dashboard loads, it tries to retrieve the "active store" for that user. If no store is found, it crashes with "No active store found".

**Auth Token Requirement**: Every API request to protected endpoints needs an `Authorization` header with a valid JWT token.

---

## Files Created/Modified

- **New Endpoint**: `src/api/admin/users/create-with-store/route.ts`
  - Creates user + password + token + store association in one call

- **New Guide**: `AUTH_TOKEN_AND_STORE_GUIDE.md`
  - Detailed troubleshooting and examples

- **New Test Script**: `auth-test.js`
  - Automated test to verify complete auth flow

---

## Troubleshooting Checklist

- [ ] Store created? (`POST /admin/stores`)
- [ ] User created with store? (`POST /admin/users/create-with-store`)
- [ ] Token returned in response?
- [ ] Token included in header? (`Authorization: Bearer ...`)
- [ ] `/admin/users/me` returns 200 (not 401)?
- [ ] Dashboard loads at `/app`? (no "No active store" error)
- [ ] Can login with email/password?

---

## Next Steps

1. **Read full guide**: `AUTH_TOKEN_AND_STORE_GUIDE.md`
2. **Run test script**: `node auth-test.js`
3. **Identify failing test** to know what to fix
4. **Check backend logs** for detailed error messages
5. **Restart backend** if changes don't take effect

---

## Key Takeaways

✨ **Always include the token**:
```bash
-H "Authorization: Bearer <token>"
```

✨ **Always associate users with stores**:
```bash
"store_id": "store_123"  # in user creation
```

✨ **Use the new endpoint**:
```bash
POST /admin/users/create-with-store
```

✨ **Test with the script**:
```bash
node auth-test.js
```

---

For detailed explanations and advanced troubleshooting, see `AUTH_TOKEN_AND_STORE_GUIDE.md`
