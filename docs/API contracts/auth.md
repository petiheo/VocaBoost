# Authentication API Contract

<aside>
🔗

- Base URL: `http://localhost:3000/api/auth`
- Authentication Headers (Cho các endpoint cần xác thực):
  `Authorization: Bearer <jwt_token>`

</aside>

# 1. Register New Account

### Endpoint

```
POST /register
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "StrongPass123!",
  "role": "learner" // or "teacher", "admin"
}
```

### Validation Rules

- **email**: Required, valid email format
- **password**: Required, min 8 chars, must contain uppercase, lowercase and number
- **role**: Optional, default “learner”

### Response Success (201)

```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "role": "learner",
      "emailVerified": false
    }
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}

```

### Response Error (400/409)

```json
{
  "success": false,
  "message": "Email already registered" // or validation error message
}
```

# 2. Login

### Endpoint

```
POST /login
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "role": "learner", // or "teacher", "admin"
      "avatarUrl": null
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Response Error (401)

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

# 3. Google OAuth Login

### Initiate OAuth

```
GET /google
```

Redirect user to this URL to start Google OAuth flow.

### OAuth Callback

```
GET /google/callback
```

### Success Response

Redirects to:

```
https://frontend.com/auth/success?token=<jwt_token>&isNewUser=<boolean>
```

### Error Response

Redirects to:

```
https://frontend.com/login?error=<error_type>
```

Possible error types:

- `oauth_failed`: OAuth authentication failed
- `access_denied`: User denied access
- `processing_failed`: Server processing error

# 4. Logout

### Endpoint

```
POST /logout
```

### Headers

```
Authorization: Bearer <jwt_token>
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Logout successful"
}
```

# 5. Forgot Password

### Endpoint

```
POST /forgot-password
```

### Request Body

```json
{
  "email": "user@example.com"
}
```

### Response Success (200)

```json
{
  "success": true,
  "message": "If your email is registered, you'll receive a password reset link shortly."
}
```

### Response Error (404)

```json
{
  "success": false,
  "message": "Email not found"
}
```

# 6. **Resend Verification**

### Endpoint

```
POST /resend-verification
```

### Request Body

```json
{
  "email": "user@example.com"
}
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Verification email resent successfully. Please check your inbox"
}
```

### Response Error (404)

```json
{
  "success": false,
  "message": "Email not found or already verified"
}
```

# 7. **Reset Password**

### Endpoint

```
POST /reset-password
```

### Request Body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "newPassword": "NewSecurePass123"
}
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Password has been reset successfully. Please login with your new password."
}
```

### Response Error (400/404)

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

```json
{
  "success": false,
  "message": "Password must contain uppercase, lowercase and number"
}
```

# 8. Verify Email

### Endpoint

```
GET /verify-email/:token
```

### Parameters

- **token**: Email verification token from email link

### Response Success (200)

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "role": "learner",
      "emailVerified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Response Error (400/404)

```json
{
  "success": false,
  "message": "Invalid or expired verification token"
}
```

# 9. Validate Token

### Endpoint

```
GET /validate-token
```

### Headers

```
Authorization: Bearer <jwt_token>
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Validate token successfully",
  "data": {
    "userId": "uuid-string",
    "email": "user@example.com",
    "role": "learner"
  }
}
```

### Response Error (401)

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

# 10. Get account status

### Endpoint

```
POST /get-account-status
```

### Request Body

```json
{
  "email": "user@example.com"
}
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Account status retrieved",
  "data": {
    "email": "user@example.com",
    "emailVerified": true,
    "accountStatus": "active"
  }
}
```

### Response Error (404)

```json
{
  "success": false,
  "message": "Email not found"
}
```
