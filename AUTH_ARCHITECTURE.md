# HydraPure End-to-End Authentication System Architecture

> **Version:** 1.0.0  
> **Platform:** HydraPure Smart Water Purification & Quality Monitoring Platform  
> **Backend Architecture:** Node.js (ES Modules), Express 4 REST API, Supabase Auth Integration  
> **Frontend Architecture:** Next.js 15 (App Router, React 19, Tailwind CSS)  
> **Database & Storage:** Supabase PostgreSQL 15 (`auth.users` ↔ `public.profiles` link)

---

## 1. Overview & Core Architecture

HydraPure implements a single, unified authentication architecture serving both the **Next.js 15 Web Dashboard** and the **HydraPure Mobile Application**. All authentication requests flow through versioned Express API endpoints (`/api/v1/auth/*`), guaranteeing strict backend JWT validation, Role-Based Access Control (RBAC), audit trail logging, and database security.

```
┌─────────────────────────┐        ┌─────────────────────────┐
│ Next.js 15 Web App      │        │ React Native Mobile App │
│ (Dashboard & Command)   │        │ (Field Technicians)     │
└────────────┬────────────┘        └────────────┬────────────┘
             │                                  │
             └─────────────────┬────────────────┘
                               │
                      HTTPS REST API Calls
                      /api/v1/auth/*
                               │
                               v
            ┌──────────────────────────────────────┐
            │  HydraPure Node.js + Express API     │
            │  - Zod Validation                    │
            │  - Express Rate Limiting             │
            │  - JWT & RBAC Middleware             │
            └──────────────────┬───────────────────┘
                               │
                               v
            ┌──────────────────────────────────────┐
            │ Supabase Auth (Identity Provider)    │
            │  - auth.users (Credentials & Auth)   │
            └──────────────────┬───────────────────┘
                               │
                               v
            ┌──────────────────────────────────────┐
            │ PostgreSQL Storage (Supabase)        │
            │  - public.profiles (RBAC & Scope)    │
            │  - public.audit_logs (Trail)         │
            └──────────────────────────────────────┘
```

---

## 2. Authentication Flows

### A. Signup Flow
1. User submits details (Full Name, Work Email, Phone, District, Password).
2. Client performs input validation and posts to `POST /api/v1/auth/register`.
3. Backend validates request body via Zod (`registerSchema`).
4. Backend invokes Supabase Auth Admin API (`supabaseAdmin.auth.admin.createUser`) to register user in `auth.users`.
5. Backend creates a corresponding `public.profiles` record with default role `VIEWER`. Public registration **cannot** elevate roles to `ADMIN` or `SUPER_ADMIN`.
6. Email verification link is sent via Supabase Auth.
7. User verifies email before logging in.

### B. Login Flow
1. User enters Work Email and Password on `/login`.
2. Client sends request to `POST /api/v1/auth/login`.
3. Backend calls `supabaseClient.auth.signInWithPassword`.
4. On credential verification, backend queries `public.profiles` for `is_active`, `role`, `district`, `block`.
5. If `is_active = false`, returns HTTP 401 with `ACCOUNT_DISABLED` ("Your account is currently inactive. Contact an administrator.").
6. On success, returns authenticated user object and JWT session tokens (`accessToken`, `refreshToken`, `expiresIn`, `expiresAt`).
7. Client stores session in memory/sessionStorage and sets a lightweight `hp_auth=1` cookie marker for Next.js Edge Middleware.
8. Client redirects user to designated route based on role permissions.

### C. Token Refresh Flow
1. Client schedules silent refresh 90 seconds before JWT expiration.
2. Client calls `POST /api/v1/auth/refresh` with `{ refresh_token }`.
3. Backend invokes `supabaseClient.auth.refreshSession`.
4. Returns updated access token and refresh token.
5. If refresh fails (token revoked or expired), client clears local session and redirects to `/login?expired=1`.

### D. Logout Flow
1. User clicks Logout in Dashboard header/sidebar.
2. Client calls `POST /api/v1/auth/logout` with `Authorization: Bearer <accessToken>`.
3. Backend invalidates session via Supabase Admin API and logs `LOGOUT` audit event.
4. Client clears local storage and `hp_auth` cookie.
5. Redirects to `/login`.

### E. Password Reset Flow
1. User enters work email at `/forgot-password`.
2. Client calls `POST /api/v1/auth/forgot-password`.
3. Backend calls `supabaseClient.auth.resetPasswordForEmail`.
4. **Security Enforcement:** Response returns generic success message regardless of email existence to prevent user enumeration attacks.
5. User clicks reset link in email and lands on `/reset-password`.
6. User enters new password and submits to `POST /api/v1/auth/reset-password`.
7. Password is updated in `auth.users`, user receives confirmation and redirects to `/login`.

---

## 3. Role-Based Access Control (RBAC) Matrix

HydraPure defines 7 distinct system roles:

| Role | Hierarchy Level | Permissions & Scope |
|---|---|---|
| `SUPER_ADMIN` | Level 1 (Highest) | Full state-wide access across all stations, user management, role elevation, audit logs, and hardware config. |
| `ADMIN` | Level 2 | State-wide access to water quality monitoring, station maintenance, alerts, reports, and operational user creation. |
| `DISTRICT_OFFICER` | Level 3 | Scoped to assigned District (e.g. Dhanbad). Access to district stations, alerts, reports, and regional analytics. |
| `BLOCK_OFFICER` | Level 4 | Scoped to assigned Block within a district. Access to block stations and local alert management. |
| `STATION_OPERATOR` | Level 5 | Assigned to specific water purification plants. Authorized to actuate Solenoid Valves (`BLOCK_SUPPLY` / `RESTORE_SUPPLY`). |
| `FIELD_TECHNICIAN` | Level 6 | Assigned to station maintenance, filter washing, membrane descaling, and sensor calibration logs. |
| `VIEWER` | Level 7 (Default) | Read-only access to safe water telemetry overview and public compliance metrics. |

### Backend Authorization Middleware
- `requireAuth`: Validates JWT Bearer token on protected endpoints.
- `requireRole(...roles)`: Verifies caller possesses required role.
- **Privilege Escalation Protection:** Any attempt by a non-super-admin to assign `SUPER_ADMIN` via `POST /api/v1/users` or `PATCH /api/v1/users/:id/role` is rejected with `403 Forbidden`.

---

## 4. API Endpoints Reference

### Authentication Endpoints (`/api/v1/auth`)
- `POST /api/v1/auth/login` - Authenticate email & password
- `POST /api/v1/auth/register` - Public account registration
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Invalidate current session
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/forgot-password` - Request password reset email
- `POST /api/v1/auth/reset-password` - Update password via reset token
- `POST /api/v1/auth/resend-verification` - Resend email verification
- `PATCH /api/v1/auth/profile` - Update own profile (name, phone, avatar)

### Admin User Management Endpoints (`/api/v1/users`)
- `GET /api/v1/users` - List users (Admin/SuperAdmin/DistrictOfficer)
- `GET /api/v1/users/:id` - Get user details
- `POST /api/v1/users` - Create user account with assigned role (Admin/SuperAdmin)
- `PATCH /api/v1/users/:id` - Update user details (Admin/SuperAdmin)
- `PATCH /api/v1/users/:id/status` - Activate / Deactivate account (Admin/SuperAdmin)
- `PATCH /api/v1/users/:id/role` - Update user role & geographic scope (Admin/SuperAdmin)
- `DELETE /api/v1/users/:id` - Deactivate user account (SuperAdmin/Admin)

---

## 5. Security & Isolation Matrix

1. **Service Role Secret Isolation**: `SUPABASE_SERVICE_ROLE_KEY` is maintained **strictly** on the Render Cloud Backend environment (`.env`). It is **never** bundled or exposed to Next.js client-side code or browser requests.
2. **Rate Limiting**: Authentication endpoints are protected by `authLimiter` (`express-rate-limit`) restricting repetitive requests to prevent brute-force attacks.
3. **No Plaintext Credentials**: Passwords are managed entirely inside Supabase Auth (`auth.users`) using bcrypt hashing. The backend never stores plaintext passwords or custom hash tables.
4. **Audit Trails**: Critical security events (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `SIGNUP`, `PASSWORD_RESET_REQUEST`, `ROLE_CHANGED`, `ACCOUNT_DISABLED`) are recorded in `public.audit_logs`.

---

## 6. Environment Variables Guide

### Backend (`backend/.env`)
```env
PORT=5050
NODE_ENV=development
SUPABASE_URL=https://vbtnhqghlsnuhfhirpoo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=hydrapure_jwt_secret_dev_key_jharkhand_secure_2026
CORS_ORIGINS=http://localhost:3000,https://hydrapure.vercel.app
FRONTEND_URL=http://localhost:3000
```

### Frontend (`WEB/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5050/api/v1
NEXT_PUBLIC_MAPTILER_KEY=YOUR_MAPTILER_KEY
```

---

## 7. Verification & Troubleshooting

### Running Backend Integration Tests
```bash
cd backend
npm test
```
Verifies:
- Login with valid admin credentials
- Rejection of invalid passwords (401)
- User registration with default `VIEWER` role
- Session retrieval (`/auth/me`)
- Role elevation blocking (403 on unauthorized escalation attempts)

### Running Frontend Build
```bash
cd WEB
npm run build
```
Ensures TypeScript compilation and Next.js App Router route generation pass cleanly.
