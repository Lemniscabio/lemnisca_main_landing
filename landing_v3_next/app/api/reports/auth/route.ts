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

  let body: { password?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const password = typeof body.password === 'string' ? body.password : ''
  if (!verifyPassword(password)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const token = await signToken()
  const response = NextResponse.json({ ok: true })
  response.cookies.set(REPORT_AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REPORT_AUTH_MAX_AGE,
    path: '/'
  })
  return response
}
