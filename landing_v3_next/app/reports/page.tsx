import { redirect, notFound } from 'next/navigation'

/**
 * /reports — index redirector.
 *
 * Auth gating happens upstream in `middleware.ts`. By the time this runs, the
 * request has a valid `report_auth` cookie.
 *
 * The actual report content lives at /reports/[id], where [id] must match
 * process.env.REPORT_ID. Visiting bare /reports forwards to /reports/{id}.
 * If REPORT_ID is unset, the redirect has nowhere to go and we 404.
 */
export default function ReportsIndex() {
  const id = process.env.REPORT_ID?.trim()
  if (!id) notFound()
  redirect(`/reports/${id}`)
}
