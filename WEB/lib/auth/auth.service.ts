import type { AuthUser, AuthSession, LoginCredentials, SignupData } from './auth.types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://hydrapure.onrender.com/api/v1'

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  const json = await res.json().catch(() => ({ message: 'Server error' }))

  if (!res.ok) {
    const message =
      json?.error?.message ||
      json?.message ||
      json?.error ||
      `Request failed: ${res.status}`
    throw new Error(message)
  }

  return json.data ?? json
}

// ─── Auth API calls ───────────────────────────────────────────────────────────

export async function loginApi(credentials: LoginCredentials): Promise<{
  user: AuthUser
  session: AuthSession
}> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export async function signupApi(data: SignupData): Promise<{
  message: string
  user: Pick<AuthUser, 'id' | 'email' | 'fullName' | 'role'>
}> {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function logoutApi(accessToken: string): Promise<void> {
  await apiFetch('/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export async function refreshSessionApi(refreshToken: string): Promise<AuthSession> {
  return apiFetch('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}

export async function getMeApi(accessToken: string): Promise<AuthUser> {
  return apiFetch('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export async function forgotPasswordApi(email: string): Promise<{ message: string }> {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function resetPasswordApi(
  accessToken: string,
  newPassword: string
): Promise<{ message: string }> {
  return apiFetch('/auth/reset-password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ new_password: newPassword, access_token: accessToken }),
  })
}

export async function resendVerificationApi(email: string): Promise<{ message: string }> {
  return apiFetch('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function updateProfileApi(
  accessToken: string,
  updates: { full_name?: string; phone?: string; avatar_url?: string }
): Promise<AuthUser> {
  return apiFetch('/auth/profile', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(updates),
  })
}
