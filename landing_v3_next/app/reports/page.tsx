import ReportsClient from '@/components/reports/ReportsClient'
import '@/components/reports/Reports.css'
import { getReport } from '@/lib/reports/jnm'
import { getReferenceCatalog } from '@/lib/reports/avira-references'

/**
 * /reports — Server Component.
 *
 * Auth gating happens upstream in `middleware.ts`. By the time this component
 * runs, the request has a valid `report_auth` cookie.
 *
 * The report data is loaded from `lib/reports/jnm/` (server-only) and passed
 * to <ReportsClient /> as props. It is serialised into the SSR HTML payload
 * for this single authorised request and never enters any client JavaScript
 * bundle.
 */
export default function ReportsPage() {
  const report = getReport()
  const referenceCatalog = getReferenceCatalog(report)
  return <ReportsClient report={report} referenceCatalog={referenceCatalog} />
}
