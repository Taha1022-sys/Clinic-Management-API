# Swagger API Documentation - Testing Guide

## 📚 Accessing Swagger Documentation

**Swagger UI URL:** http://localhost:3000/api/docs

Open this URL in your browser to access the interactive API documentation.

---

## 🎯 How to Test Endpoints with Swagger

### Step 1: Register a New User

1. Navigate to the **Auth** section
2. Click on `POST /api/v1/auth/register`
3. Click the **"Try it out"** button
4. Fill in the request body with sample data:

```json
{
  "email": "patient@example.com",
  "password": "Patient@123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "PATIENT"
}
```

5. Click **"Execute"**
6. **IMPORTANT:** Copy the `accessToken` from the response - you'll need it for protected endpoints!

Sample Response:
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "patient@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "PATIENT",
    "isActive": true,
    "createdAt": "2025-12-17T10:30:00.000Z",
    "updatedAt": "2025-12-17T10:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": "1h"
}
```

---

### Step 2: Authenticate in Swagger (Add JWT Token)

1. Scroll to the top of the Swagger page
2. Click the **"Authorize" 🔓** button (green button at the top right)
3. In the "Value" field, paste your JWT token (the `accessToken` you copied)
4. Click **"Authorize"**
5. Click **"Close"**

Now you're authenticated! All protected endpoints will use this token automatically.

---

### Step 3: Test Protected Endpoints

#### Get Your Profile
1. Find `GET /api/v1/users/profile` under the **Users** section
2. Click **"Try it out"**
3. Click **"Execute"**
4. You should see your user profile in the response

#### Update Your Profile
1. Find `PATCH /api/v1/users/profile`
2. Click **"Try it out"**
3. Modify the fields you want to update:

```json
{
  "firstName": "Johnny",
  "lastName": "Doe Updated",
  "phone": "+0987654321"
}
```

4. Click **"Execute"**
5. Verify the updated information in the response

---

### Step 4: Test Admin-Only Endpoints

First, register an admin user:

1. **Logout from current session** (click Authorize 🔓 button, then click "Logout")
2. Register a new admin user at `POST /api/v1/auth/register`:

```json
{
  "email": "admin@clinic.com",
  "password": "Admin@123456",
  "firstName": "Super",
  "lastName": "Admin",
  "role": "ADMIN"
}
```

3. Copy the admin's `accessToken`
4. Click **"Authorize" 🔓** and paste the admin token
5. Now you can test admin-only endpoints:

#### Get All Users (Admin Only)
- `GET /api/v1/users` - Returns all users

#### Get User by ID (Admin Only)
- `GET /api/v1/users/{id}` - Get specific user details
- Replace `{id}` with an actual user UUID

#### Update Any User (Admin Only)
- `PATCH /api/v1/users/{id}` - Update any user
- Can modify role and isActive status

#### Delete User (Admin Only)
- `DELETE /api/v1/users/{id}` - Soft delete a user

---

## 🔐 Password Requirements

When registering users, passwords must meet these criteria:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

**Valid Examples:**
- `Password@123`
- `Admin@123456`
- `Doctor!2024`
- `Patient$Pass1`

**Invalid Examples:**
- `password` (no uppercase, number, or special char)
- `Pass@1` (too short)
- `PASSWORD123` (no special char)

---

## 👥 User Roles

The system has three roles:

1. **PATIENT** (default) - Can view/edit own profile
2. **DOCTOR** - Can view/edit own profile
3. **ADMIN** - Full access to all endpoints

---

## 📝 Testing Checklist

- [ ] Register a PATIENT user
- [ ] Login with patient credentials
- [ ] Authorize in Swagger with patient token
- [ ] Get patient profile
- [ ] Update patient profile
- [ ] Try to access admin endpoint (should get 403 Forbidden)
- [ ] Register an ADMIN user
- [ ] Authorize in Swagger with admin token
- [ ] Get all users (admin only)
- [ ] Update another user (admin only)
- [ ] Soft delete a user (admin only)

---

## ⚡ Quick Test Samples

### Sample PATIENT
```json
{
  "email": "patient@clinic.com",
  "password": "Patient@123",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890",
  "role": "PATIENT"
}
```

### Sample DOCTOR
```json
{
  "email": "doctor@clinic.com",
  "password": "Doctor@123",
  "firstName": "Dr. Michael",
  "lastName": "Johnson",
  "phone": "+0987654321",
  "role": "DOCTOR"
}
```

### Sample ADMIN
```json
{
  "email": "admin@clinic.com",
  "password": "Admin@123456",
  "firstName": "Super",
  "lastName": "Admin",
  "role": "ADMIN"
}
```

---

## 🛡️ Common Error Responses

### 400 Bad Request
- Validation errors (missing fields, invalid format)
- Check the error message for details

### 401 Unauthorized
- Missing or invalid JWT token
- Token expired (tokens expire after 1 hour)
- Solution: Re-login and get a new token

### 403 Forbidden
- Insufficient permissions (e.g., non-admin trying to access admin endpoint)
- Check if the endpoint requires a specific role

### 404 Not Found
- User or resource doesn't exist
- Check the ID you're using

### 409 Conflict
- User with email already exists
- Use a different email address

---

## 🎨 Swagger Features

✅ **Interactive Testing** - Test all endpoints directly from the browser
✅ **Bearer Auth Support** - Easy JWT token management
✅ **Request/Response Examples** - See sample data for all endpoints
✅ **Schema Validation** - Real-time validation of request bodies
✅ **API Documentation** - Complete description of all endpoints
✅ **Persistent Authorization** - Token persists across page refreshes

---

## 📌 Tips

1. **Token Expiration:** Tokens expire after 1 hour. If you get 401 errors, re-login to get a fresh token.

2. **Role Testing:** To test role-based access, register users with different roles and compare what endpoints they can access.

3. **JSON Format:** Make sure your JSON is valid (use double quotes, no trailing commas).

4. **UUID Format:** User IDs are UUIDs (e.g., `123e4567-e89b-12d3-a456-426614174000`), not simple numbers.

5. **Swagger Persistence:** The "persistAuthorization" option is enabled, so your token will remain even after refreshing the page.

---

## 🚀 Next Steps

After testing with Swagger, you can:
1. Use these same endpoints from a frontend application
2. Test with Postman or other API clients
3. Write automated tests using the documented API schema
4. Share the API documentation URL with frontend developers

---

**Happy Testing! 🎉**
