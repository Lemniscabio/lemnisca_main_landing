'use client'

import { Suspense, useState, type FormEvent, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import './unlock.css'

export default function UnlockPage() {
  return (
    <Suspense>
      <UnlockPageInner />
    </Suspense>
  )
}

function UnlockPageInner() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [idleBanner, setIdleBanner] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('reason') === 'idle') {
      setIdleBanner(true)
    }
  }, [searchParams])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reports/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        // The auth endpoint echoes the report id (= REPORT_USERNAME). Use it
        // as the URL path segment so the user lands on /reports/{id} instead
        // of the legacy /reports index.
        const data = (await res.json().catch(() => ({}))) as { reportId?: string }
        const reportId = typeof data.reportId === 'string' && data.reportId ? data.reportId : ''
        window.location.href = reportId ? `/reports/${reportId}` : '/reports'
        return
      }
      if (res.status === 429) {
        setError('Too many attempts. Please try again in a few minutes.')
      } else {
        setError('Incorrect username or password.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="unlock-page">
      {/* ─── Left panel: black, animated multi-batch monitor ─────────────── */}
      <aside className="unlock-illustration" aria-hidden="true">
        <div className="unlock-illustration-inner">
          <FermentationMonitor />
          <div className="unlock-illustration-caption">
            <div className="unlock-illustration-eyebrow">Bioprocess Analytics</div>
            <h2>
              Bioprocesses,<br />
              decoded.
            </h2>
            <p>
              Multi-run bioreactor data, decomposed across biomass, metabolism,
              oxygen transfer, and process strategy — turning raw measurements
              into clear, actionable insight.
            </p>
          </div>
        </div>
      </aside>

      {/* ─── Right panel: light, auth form ───────────────────────────────── */}
      <section className="unlock-form-panel">
        <form onSubmit={handleSubmit} className="unlock-form">
          <div className="unlock-form-brand">
            <img
              src="/favicon.ico"
              alt="Lemnisca"
              width={20}
              height={20}
              style={{ borderRadius: 4 }}
            />
            <span>lemnisca</span>
            <span style={{ color: '#cbd5e1' }}>·</span>
            <span>protected report</span>
          </div>

          {idleBanner && (
            <div className="unlock-idle-banner">
              Your session expired due to inactivity. Please log in again.
            </div>
          )}

          <h1 className="unlock-form-title">Protected Report</h1>
          <p className="unlock-form-desc">
            Enter the username and password from your invitation email to view this report.
          </p>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoFocus
            required
            autoComplete="username"
            className="unlock-input"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="current-password"
            className="unlock-input"
          />

          {error && <div className="unlock-error">{error}</div>}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="unlock-submit"
          >
            {loading ? 'Verifying…' : 'Unlock Report'}
          </button>

          <p className="unlock-footnote">
            This report is protected. If you don&apos;t have your credentials, please
            contact the Lemnisca team.
          </p>
        </form>
      </section>
    </div>
  )
}

/**
 * Animated fermentation monitor.
 *
 * Six growth-curve traces draw across a dark "monitor" grid in a continuously
 * looping cycle. A vertical time cursor sweeps with the drawing, sample dots
 * pop in once each curve completes, and the highest performer gets a pulsing
 * endpoint highlight. Loops every 14s. All animations defined in unlock.css.
 */
function FermentationMonitor() {
  const CURVES: Array<{
    id: string
    color: string
    d: string
    delay: string // CSS animation-delay
  }> = [
    { id: 'B01', color: '#0072b2', delay: '0.0s',
      d: 'M40 280 C 90 278, 130 270, 160 240 C 190 205, 220 190, 250 175' },
    { id: 'B02', color: '#56b4e9', delay: '0.18s',
      d: 'M40 280 C 95 278, 135 268, 170 230 C 210 188, 240 168, 290 158' },
    { id: 'B03', color: '#009e73', delay: '0.36s',
      d: 'M40 280 C 90 278, 130 260, 165 220 C 200 180, 230 145, 270 130' },
    { id: 'B04', color: '#d55e00', delay: '0.54s',
      d: 'M40 280 C 80 270, 110 240, 140 195 C 170 145, 200 100, 240 70' },
    { id: 'B05', color: '#cc79a7', delay: '0.72s',
      d: 'M40 280 C 100 275, 140 250, 180 200 C 230 140, 290 110, 360 95 C 410 88, 440 90, 460 92' },
    { id: 'B06', color: '#e69f00', delay: '0.90s',
      d: 'M40 280 C 100 275, 140 250, 185 195 C 235 130, 295 88, 360 75 C 410 68, 445 70, 470 72' },
  ]

  return (
    <div className="monitor">
      <div className="monitor-header">
        <span className="monitor-status">
          <span className="monitor-status-dot" />
          live monitor
        </span>
        <span className="monitor-tag">growth curves</span>
      </div>

      <svg
        viewBox="0 0 500 320"
        xmlns="http://www.w3.org/2000/svg"
        className="monitor-svg"
        role="img"
        aria-label="Animated multi-batch fermentation monitor"
      >
        <defs>
          <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background grid */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`h${i}`}
            x1="40"
            x2="480"
            y1={60 + i * 55}
            y2={60 + i * 55}
            stroke="rgba(148, 163, 184, 0.10)"
            strokeWidth="1"
            strokeDasharray="2 6"
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <line
            key={`v${i}`}
            x1={40 + i * 55}
            x2={40 + i * 55}
            y1="40"
            y2="280"
            stroke="rgba(148, 163, 184, 0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        <line x1="40" y1="280" x2="480" y2="280" stroke="rgba(148, 163, 184, 0.30)" strokeWidth="1" />
        <line x1="40" y1="40"  x2="40"  y2="280" stroke="rgba(148, 163, 184, 0.30)" strokeWidth="1" />

        {/* Axis labels */}
        <text x="40" y="302" fontSize="9" fill="#64748b" fontFamily="Inter, sans-serif">
          time
        </text>
        <text
          x="22"
          y="50"
          fontSize="9"
          fill="#64748b"
          fontFamily="Inter, sans-serif"
          transform="rotate(-90 22 50)"
        >
          biomass
        </text>

        {/* Time cursor — vertical line sweeping with the draw */}
        <g className="cursor-group" style={{ opacity: 0 }}>
          <line
            x1="40"
            y1="40"
            x2="40"
            y2="280"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <circle cx="40" cy="40" r="2" fill="rgba(255, 255, 255, 0.4)" />
        </g>

        {/* Curves — initial state set inline so the first paint frame is
            already invisible (no flash before the CSS animation engages). */}
        {CURVES.map((c, i) => (
          <path
            key={c.id}
            d={c.d}
            fill="none"
            stroke={c.color}
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#lineGlow)"
            className={`curve curve-${i + 1}`}
            style={{
              animationDelay: c.delay,
              strokeDasharray: 1200,
              strokeDashoffset: 1200,
              opacity: 0,
            }}
          />
        ))}

        {/* Endpoint highlight: top performer gets a pulsing ring */}
        <g className="winner">
          <circle
            cx="470"
            cy="72"
            r="6"
            fill="none"
            stroke="#e69f00"
            strokeWidth="1.5"
            className="winner-ring"
            style={{ opacity: 0 }}
          />
          <circle cx="470" cy="72" r="4" fill="#e69f00" style={{ opacity: 0 }} />
        </g>
      </svg>

      {/* Mini legend below the chart — generic numbered runs */}
      <div className="monitor-legend">
        {CURVES.map((c, i) => (
          <div key={c.id} className="monitor-legend-item">
            <span className="monitor-legend-dot" style={{ background: c.color }} />
            <span className="monitor-legend-label">
              {String(i + 1).padStart(2, '0')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
