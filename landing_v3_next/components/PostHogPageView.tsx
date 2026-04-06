'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { usePostHog } from 'posthog-js/react'

export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      const params = searchParams.toString()
      if (params) {
        url = url + '?' + params
      }
      posthog.capture('$pageview', { $current_url: url })
    }
  }, [pathname, searchParams, posthog])

  return null
}
