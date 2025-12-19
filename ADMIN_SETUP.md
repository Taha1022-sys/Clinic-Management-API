# 🔐 Admin User Setup Guide

## Quick Setup (3 Steps)

### 1. Register a New User
```bash
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "email": "admin@clinic.com",
  "password": "Admin123!",
  "firstName": "Admin",
  "lastName": "User",
  "phone": "+1234567890"
}
```

### 2. Login to Get JWT Token
```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@clinic.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@clinic.com",
    "role": "PATIENT"  // Still PATIENT at this point
  }
}
```

### 3. Promote to ADMIN
```bash
PATCH http://localhost:3000/api/v1/users/admin@clinic.com/promote-to-admin
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE

{
  "adminSecret": "CHANGE_ME_IN_PRODUCTION"
}
```

**Response:**
```json
{
  "message": "User promoted to ADMIN successfully",
  "user": {
    "id": "...",
    "email": "admin@clinic.com",
    "role": "ADMIN",  // ✅ Now ADMIN!
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

---

## 🔒 Security Configuration

Add to your `.env` file:
```env
ADMIN_SETUP_SECRET=your-super-secret-key-here-change-this
```

If not set, default is `CHANGE_ME_IN_PRODUCTION` (not secure for production).

---

## 🚀 Using the Script

### Option A: Node.js Script
```bash
node promote-admin.js admin@clinic.com YOUR_JWT_TOKEN
```

### Option B: PowerShell
```powershell
$JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
$SECRET = "CHANGE_ME_IN_PRODUCTION"

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/users/admin@clinic.com/promote-to-admin" `
  -Method PATCH `
  -Headers @{
    "Authorization" = "Bearer $JWT"
    "Content-Type" = "application/json"
  } `
  -Body (@{adminSecret=$SECRET} | ConvertTo-Json)
```

---

## ⚠️ IMPORTANT: Production Security

**AFTER creating your first admin:**

1. **Remove the endpoint** from `users.controller.ts`:
   - Delete the entire `promoteToAdmin()` method
   - Or comment it out

2. **Alternative: Restrict by existing ADMIN**:
   - Add `@Roles(Role.ADMIN)` decorator
   - Only existing admins can create new admins

3. **Delete the script**:
   ```bash
   rm promote-admin.js
   rm ADMIN_SETUP.md
   ```

---

## 🧪 Verification

Check if promotion worked:
```bash
# Login again to get fresh token with ADMIN role
POST http://localhost:3000/api/v1/auth/login

# Try admin-only endpoint
GET http://localhost:3000/api/v1/users
Authorization: Bearer YOUR_NEW_JWT_TOKEN
```

If you can see all users, you're now an ADMIN! ✅

---

## 🐛 Troubleshooting

### Error: "Invalid admin secret"
- Check your `.env` file has `ADMIN_SETUP_SECRET`
- Restart the NestJS server after changing `.env`
- Make sure the secret matches exactly (no extra spaces)

### Error: "User not found"
- Verify the email is correct
- Check user exists: `GET /users/profile` with JWT token

### Error: "Unauthorized"
- Your JWT token might be expired
- Login again to get a fresh token

### Still PATIENT role after promotion?
- Login again to get a new JWT token
- The old token still has the old role claim
