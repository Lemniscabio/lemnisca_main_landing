import { NextResponse } from 'next/server'
import { REPORT_AUTH_COOKIE } from '@/lib/reportAuth'

export const runtime = 'nodejs'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(REPORT_AUTH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}
