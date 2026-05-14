'use client'

import SiteHeader from '@/components/SiteHeader'
import './ComingSoon.css'

export type ComingSoonPalette = {
  /** Page base. Typically a very dark variant of the dominant brand color. */
  base: string
  /** 3 orb colors. They get heavily blurred and screen-blended. */
  orbs: [string, string, string]
  /** Accent used for the eyebrow + underline. */
  accent: string
}

type Props = {
  product: 'Tune' | 'Thrust' | 'Torch'
  tagline?: string
  palette: ComingSoonPalette
}

export default function ComingSoon({ product, tagline, palette }: Props) {
  // CSS custom properties keep the styling per-product without per-product CSS.
  const styleVars = {
    '--cs-base': palette.base,
    '--cs-orb-1': palette.orbs[0],
    '--cs-orb-2': palette.orbs[1],
    '--cs-orb-3': palette.orbs[2],
    '--cs-accent': palette.accent,
  } as React.CSSProperties

  return (
    <div className="cs_root" style={styleVars}>
      <div className="cs_orb cs_orb--1" aria-hidden />
      <div className="cs_orb cs_orb--2" aria-hidden />
      <div className="cs_orb cs_orb--3" aria-hidden />
      <div className="cs_vignette" aria-hidden />

      <div className="cs_shell">
        <SiteHeader />
        <main className="cs_main">
          <span className="cs_eyebrow">{product} by Lemnisca</span>
          <h1 className="cs_heading">
            Coming <span className="cs_heading_accent">soon</span>
          </h1>
          {tagline ? <p className="cs_subline">{tagline}</p> : null}
        </main>
      </div>
    </div>
  )
}
