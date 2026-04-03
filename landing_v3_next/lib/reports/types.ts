export interface KPI {
  label: string
  value: string
  subtext?: string
  trend?: 'up' | 'down' | 'stable'
  icon?: string
}

export interface Evidence {
  type: 'chart' | 'table' | 'text'
  title: string
  description: string
  chartId?: string
  tableData?: { headers: string[]; rows: string[][] }
}

export interface Hypothesis {
  id: string
  title: string
  description: string
  verdict: 'supported' | 'partially' | 'refuted'
  verdictSummary: string
  evidence: Evidence[]
}

export interface Recommendation {
  title: string
  source: string
  description: string
  icon: string
}

export interface ReportData {
  company: { name: string; logo?: string }
  title: string
  subtitle: string
  problemStatement: {
    heading: string
    body: string
    kpis: KPI[]
  }
  hypotheses: Hypothesis[]
  recommendations: Recommendation[]
  executiveSummary: {
    heading: string
    bullets: string[]
  }
}
