/**
 * Report access auth helpers.
 *
 * Single shared password gating for /reports. Uses HMAC-SHA256 (Web Crypto API,
 * so it works in both the Node and Edge runtimes — required because middleware
 * runs on Edge).
 *
 * Secrets:
 *   REPORT_PASSWORD     — the shared password emailed to the recipient
 *   REPORT_AUTH_SECRET  — long random string used to sign the auth cookie
 */

const COOKIE_NAME = 'report_auth'
const TOKEN_VERSION = 1

export const REPORT_AUTH_COOKIE = COOKIE_NAME
export const REPORT_AUTH_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getSecret(): string {
  const secret = process.env.REPORT_AUTH_SECRET
  if (!secret || secret.length < 16) {
    throw new Error(
      'REPORT_AUTH_SECRET is missing or too short (need 16+ chars). Generate with: openssl rand -hex 32'
    )
  }
  return secret
}

function getPassword(): string {
  const pw = process.env.REPORT_PASSWORD
  if (!pw) throw new Error('REPORT_PASSWORD is not set')
  return pw
}

// ── base64url helpers (Edge-safe; no Buffer) ─────────────────────────────────
function base64urlEncode(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(str: string): Uint8Array {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4))
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + pad
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

/**
 * Produce a signed token: `<base64url(payload)>.<base64url(hmac)>`
 * Payload contains version + issued-at; the cookie's Max-Age handles expiry.
 */
export async function signToken(): Promise<string> {
  const payload = JSON.stringify({ v: TOKEN_VERSION, iat: Date.now() })
  const payloadB64 = base64urlEncode(new TextEncoder().encode(payload))
  const key = await importKey(getSecret())
  const sigBuf = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payloadB64)
  )
  const sigB64 = base64urlEncode(new Uint8Array(sigBuf))
  return `${payloadB64}.${sigB64}`
}

/**
 * Verify a token's signature (and version). Returns false on any failure —
 * tampering, missing pieces, wrong version, malformed input.
 */
export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [payloadB64, sigB64] = parts

  try {
    const key = await importKey(getSecret())
    const sigBytes = base64urlDecode(sigB64)
    const ok = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as BufferSource,
      new TextEncoder().encode(payloadB64)
    )
    if (!ok) return false

    const payloadJson = new TextDecoder().decode(base64urlDecode(payloadB64))
    const payload = JSON.parse(payloadJson) as { v?: number }
    return payload.v === TOKEN_VERSION
  } catch {
    return false
  }
}

/**
 * Constant-time password comparison. Length-equal short-circuit is fine because
 * we don't reveal the expected length to the attacker (the response is just
 * 401, not "wrong length").
 */
export function verifyPassword(input: string): boolean {
  const expected = getPassword()
  const a = new TextEncoder().encode(input)
  const b = new TextEncoder().encode(expected)
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}
