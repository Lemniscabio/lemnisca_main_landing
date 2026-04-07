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
  matcher: ['/reports', '/reports/:path*']
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always let the unlock page through, otherwise we'd loop.
  if (pathname.startsWith('/reports/unlock')) {
    return NextResponse.next()
  }

  const token = request.cookies.get(REPORT_AUTH_COOKIE)?.value
  const ok = await verifyToken(token)
  if (ok) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = '/reports/unlock'
  return NextResponse.rewrite(url)
}
