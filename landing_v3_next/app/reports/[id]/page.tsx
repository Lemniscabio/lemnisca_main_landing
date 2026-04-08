import { notFound } from 'next/navigation'
import ReportsClient from '@/components/reports/ReportsClient'
import '@/components/reports/Reports.css'
import { getReport } from '@/lib/reports/jnm'
import { getReferenceCatalog } from '@/lib/reports/avira-references'

/**
 * /reports/[id] — Server Component.
 *
 * Auth gating happens upstream in `middleware.ts`. By the time this component
 * runs, the request has a valid `report_auth` cookie.
 *
 * The `[id]` route segment must match `process.env.REPORT_ID` (a separate
 * env var from REPORT_USERNAME so the URL slug doesn't expose the login
 * credentials). Anything else 404s — even with a valid cookie — so the URL
 * can't be used to enumerate other (future) report ids. Comparison is
 * case-insensitive and trims whitespace.
 */
export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const expected = process.env.REPORT_ID?.trim().toLowerCase()
  if (!expected || id.trim().toLowerCase() !== expected) {
    notFound()
  }

  const report = getReport()
  const referenceCatalog = getReferenceCatalog(report)
  return <ReportsClient report={report} referenceCatalog={referenceCatalog} />
}
