import { cookies } from 'next/headers'

const SESSION_COOKIE = 'mira_admin_session'
const SECRET = process.env.ADMIN_SECRET ?? 'mira-admin-secret'

// Simple signed token: base64(payload).signature
function sign(payload: string): string {
  // In production use a proper HMAC — this is a lightweight server-only check
  const encoder = new TextEncoder()
  const data = encoder.encode(payload + SECRET)
  // XOR-based checksum (no crypto API needed in Edge/Node)
  let hash = 0
  for (const byte of data) hash = (hash * 31 + byte) >>> 0
  return `${payload}.${hash.toString(36)}`
}

function verify(token: string): boolean {
  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return false
  const payload = token.slice(0, lastDot)
  return sign(payload) === token
}

export function createSessionToken(username: string): string {
  const payload = `${username}:${Date.now()}`
  return sign(payload)
}

export function setAdminSession(token: string): void {
  // Called from Server Actions / API routes
  // Note: cookies() write requires being inside a Server Action or Route Handler
}

export function getSessionToken(): string | undefined {
  return cookies().get(SESSION_COOKIE)?.value
}

export function isAuthenticated(): boolean {
  const token = getSessionToken()
  if (!token) return false
  return verify(token)
}

export function checkCredentials(username: string, password: string): boolean {
  return (
    username === (process.env.ADMIN_USERNAME ?? 'admin') &&
    password === (process.env.ADMIN_PASSWORD ?? 'Mira@2026!')
  )
}

export { SESSION_COOKIE }
