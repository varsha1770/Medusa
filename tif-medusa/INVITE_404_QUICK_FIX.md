# Invite 404 Issue - Action Checklist

## 🎯 Quick Fix (Do This First)

- [ ] **Step 1**: Clear browser cache
  ```
  Ctrl+Shift+Delete → Select "All time" → Clear cache
  ```

- [ ] **Step 2**: Hard refresh the page
  ```
  Ctrl+F5 (Windows/Linux) 
  Cmd+Shift+R (Mac)
  ```

- [ ] **Step 3**: Complete logout and login fresh
  ```
  1. Click profile → Logout
  2. Close the browser tab completely
  3. Open new tab
  4. Go to http://localhost:9000/app
  5. Login again with email/password
  ```

---

## 🔍 Diagnostic (If Above Didn't Work)

- [ ] **Step 1**: Get your auth token
  ```
  Open browser console (F12 → Console)
  Paste: localStorage.getItem('medusa_auth_token')
  Copy the token value
  ```

- [ ] **Step 2**: Check your user role/access
  ```bash
  TOKEN="paste-your-token-here"
  curl http://localhost:9000/admin/invites/user-status \
    -H "Authorization: Bearer $TOKEN"
  ```

- [ ] **Step 3**: Check which pages work for you
  ```bash
  TOKEN="paste-your-token-here"
  
  # Try each page - which ones return 200?
  curl -i http://localhost:9000/app \
    -H "Authorization: Bearer $TOKEN"
  
  curl -i http://localhost:9000/app/stores \
    -H "Authorization: Bearer $TOKEN"
  
  curl -i http://localhost:9000/app/products \
    -H "Authorization: Bearer $TOKEN"
  ```

- [ ] **Note Results**: 
  ```
  Status 200 = Page works ✅
  Status 304 = Cache issue (clear cache!)
  Status 404 = Page doesn't exist
  Status 401 = Auth problem
  ```

---

## 🛠️ Workaround (If Getting 404)

Based on your role, try these pages instead:

- [ ] If merchant user:
  ```
  Try: /app/stores
  Or: /app/products
  Or: /app/orders
  
  NOT: /app/merchants ❌ (doesn't exist)
  ```

- [ ] If admin user:
  ```
  Try: /app ✅ (should work)
  Or: Any page you see in the sidebar
  ```

---

## 📋 Reporting Issues

When contacting support, provide:

```
1. Your user role/scope:
   (from step 2 diagnostic above)

2. Which page you tried to access:
   /app/merchants or something else?

3. Error message:
   404 page not found or something else?

4. What you see in diagnostic:
   (run the user-status endpoint)

5. Which pages DO work for you:
   (from step 3 diagnostic above)
```

---

## 🚀 Expected Outcome

After following this checklist:

✅ **Best case**: Pages load normally, no 404
✅ **Next best**: You can access `/app`, `/app/stores`, `/app/products`
❌ **Still broken**: `/app/merchants` still returns 404

If still broken after all steps, the issue is architectural:
- The `/app/merchants` page doesn't exist in the Admin UI
- Invited merchant users need a different landing page
- Requires development team to fix the redirect logic

---

## 💡 Why This Happens (Technical)

```
1. You accept invite
   ↓
2. Admin UI checks your role (e.g., "merchant")
   ↓
3. Admin UI redirects you to role-based page
   ↓
   Merchants → /app/merchants
   Admins → /app
   ↓
4. If that page doesn't exist → 404 ❌
   If that page exists → you land on it ✅
```

The current issue: **`/app/merchants` doesn't exist yet**

Solution: Either
- Create the page, OR
- Redirect merchants to `/app/stores` instead

---

## ⏱️ Timeline

- **Immediate** (5 min): Clear cache + hard refresh
- **Short-term** (15 min): Run diagnostics to understand the issue
- **Workaround** (1 min): Use available pages like `/app/stores`
- **Long-term** (Development): Fix the redirect logic and create missing pages

---

## 📞 Support Info

Need help? Check:

1. **Cache clearing issues**: See "Quick Fix" section above
2. **Role/permission issues**: Run diagnostic, check `scope` field
3. **Missing pages**: Check which pages return 200 in diagnostic
4. **Still broken**: Run complete diagnostic and share results

---

## ✅ Final Verification

After fix, verify with:

```bash
TOKEN="your-token"

# 1. Should return 200 (not 304)
curl -i http://localhost:9000/app \
  -H "Authorization: Bearer $TOKEN" | head -1

# 2. Should show your user info
curl http://localhost:9000/admin/invites/user-status \
  -H "Authorization: Bearer $TOKEN" | jq .user

# 3. Should show accessible pages
curl http://localhost:9000/admin/invites/user-status \
  -H "Authorization: Bearer $TOKEN" | jq .accessInfo.accessiblePages

# All returning 200 + data? You're fixed! ✅
```

---

**Status**: 🔧 In Progress - Follow steps above to identify and fix the issue
