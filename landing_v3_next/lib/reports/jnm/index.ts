import 'server-only'
import type { ReportData } from '../types'
import { jnmNarrative } from './narrative'
import { batchData, batchMeta } from './batches.generated'

/**
 * Server-only entry point. Returns the full Jananom report — narrative + data —
 * shaped for client-side rendering.
 *
 * Called from `app/reports/page.tsx` (Server Component). The returned object
 * is serialised once into the SSR HTML payload for the authorised request.
 * It never enters any client JavaScript bundle.
 */
export function getReport(): ReportData {
  return {
    ...jnmNarrative,
    batchMeta,
    batchData,
  }
}
