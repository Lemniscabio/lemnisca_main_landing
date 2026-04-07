import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken, REPORT_AUTH_COOKIE } from '@/lib/reportAuth'

/**
 * Gates /reports and any subpath behind a signed auth cookie.
 *
 * Flow:
 *  - /reports/unlock and /api/reports/auth are always allowed (excluded below).
 *  - Any other /reports request needs a valid `report_auth` cookie.
 *  - Missing/invalid cookie → REWRITE (not redirect) to /reports/unlock so the
 *    URL bar still shows the original path.
 */
export const config = {
  matcher: ['/reports', '/reports/:path*', '/api/avira/:path*']
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always let the unlock page + the auth POST through, otherwise we'd loop.
  if (pathname.startsWith('/reports/unlock')) {
    return NextResponse.next()
  }

  const token = request.cookies.get(REPORT_AUTH_COOKIE)?.value
  const ok = await verifyToken(token)

  // /api/avira is gated by the same cookie. Unauthenticated requests get a
  // JSON 401 rather than a rewrite to the unlock page — it's an API.
  if (pathname.startsWith('/api/avira')) {
    if (ok) return NextResponse.next()
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  if (ok) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = '/reports/unlock'
  return NextResponse.rewrite(url)
}
