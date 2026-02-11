# Authentication API Testing Guide

## Testing with cURL or Postman

### Base URL
```
http://localhost:5000/api/auth
```

---

## 1. Register New User

**Endpoint**: `POST /api/auth/register`

**Request**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "client"
  }'
```

**Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "abc123",
    "email": "test@example.com",
    "name": "Test User",
    "role": "client",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2. Login

**Endpoint**: `POST /api/auth/login`

**Request**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@flowsync.com",
    "password": "admin123"
  }'
```

**Response** (200 OK):
```json
{
  "message": "Login successful",
  "user": {
    "id": "admin-001",
    "email": "admin@flowsync.com",
    "name": "Admin User",
    "role": "admin",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 3. Get Current User

**Endpoint**: `GET /api/auth/me`

**Request**:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "admin-001",
    "email": "admin@flowsync.com",
    "name": "Admin User",
    "role": "admin",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    "createdAt": "2026-02-11T12:30:00Z"
  }
}
```

---

## 4. Refresh Token

**Endpoint**: `POST /api/auth/refresh`

**Request**:
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Response** (200 OK):
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 5. Logout

**Endpoint**: `POST /api/auth/logout`

**Request**:
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response** (200 OK):
```json
{
  "message": "Logout successful"
}
```

---

## Default Test Accounts

### Admin Account
- **Email**: `admin@flowsync.com`
- **Password**: `admin123`
- **Role**: admin

### Client Accounts
- **Email**: `john@client.com` / **Password**: `client123` / **Role**: client
- **Email**: `sarah@client.com` / **Password**: `client123` / **Role**: client

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Please provide email and password"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid email or password"
}
```

```json
{
  "error": "Invalid or expired token. Please login again."
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Admin privileges required."
}
```

### 500 Internal Server Error
```json
{
  "error": "Error logging in"
}
```

---

## Testing Workflow

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Test login with default admin**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@flowsync.com","password":"admin123"}'
   ```

3. **Copy the accessToken from response**

4. **Test protected route**:
   ```bash
   curl -X GET http://localhost:5000/api/auth/me \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
   ```

5. **Test with client account**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@client.com","password":"client123"}'
   ```

---

## Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "FlowSync Auth API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\",\n  \"role\": \"client\"\n}"
        },
        "url": {"raw": "http://localhost:5000/api/auth/register"}
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@flowsync.com\",\n  \"password\": \"admin123\"\n}"
        },
        "url": {"raw": "http://localhost:5000/api/auth/login"}
      }
    },
    {
      "name": "Get Current User",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{accessToken}}"}],
        "url": {"raw": "http://localhost:5000/api/auth/me"}
      }
    }
  ]
}
```

---

## Next Steps

After testing authentication:
1. ✅ Verify all endpoints work
2. ✅ Test with both admin and client roles
3. ✅ Test token expiration
4. ✅ Test invalid credentials
5. ➡️ Move to Phase 3: Core API Development
