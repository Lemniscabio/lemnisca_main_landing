import { NextResponse } from 'next/server'
import {
  verifyPassword,
  signToken,
  REPORT_AUTH_COOKIE,
  REPORT_AUTH_MAX_AGE
} from '@/lib/reportAuth'

export const runtime = 'nodejs'

// ── Tiny in-memory rate limiter (per IP) ─────────────────────────────────────
// Single-process MVP. Resets on deploy/restart, which is acceptable here.
const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

function rateLimitOk(ip: string): boolean {
  const now = Date.now()
  const rec = attempts.get(ip)
  if (!rec || rec.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (rec.count >= MAX_ATTEMPTS) return false
  rec.count++
  return true
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  if (!rateLimitOk(ip)) {
    return NextResponse.json(
      { ok: false, error: 'too_many_attempts' },
      { status: 429 }
    )
  }

  let body: { username?: unknown; password?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  // Username gate. Independent of the existing password verification logic.
  // The expected username comes from REPORT_USERNAME env var. If the env var
  // is unset, the username gate fails closed — no implicit default.
  // Comparison is case-insensitive and trims whitespace for forgiving UX.
  const expectedUsernameRaw = process.env.REPORT_USERNAME
  if (!expectedUsernameRaw) {
    console.error('[auth] REPORT_USERNAME env var is not set — refusing all logins')
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const submittedUsername =
    typeof body.username === 'string' ? body.username.trim().toLowerCase() : ''
  const expectedUsername = expectedUsernameRaw.trim().toLowerCase()
  if (submittedUsername !== expectedUsername) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const password = typeof body.password === 'string' ? body.password : ''
  if (!verifyPassword(password)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const token = await signToken()
  // Echo the report id back to the client so it knows which /reports/[id]
  // route to navigate to. The id comes from REPORT_ID — a separate env var
  // from REPORT_USERNAME so the URL slug doesn't expose the login username.
  const reportId = process.env.REPORT_ID?.trim() || ''
  const response = NextResponse.json({ ok: true, reportId })
  response.cookies.set(REPORT_AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REPORT_AUTH_MAX_AGE,
    path: '/'
  })
  return response
}
