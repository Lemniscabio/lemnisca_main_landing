'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export type NavItem = { label: string; href: string }

export const NAV_ITEMS: NavItem[] = [
  { label: 'Tune', href: '/tune' },
  { label: 'Thrust', href: '/thrust' },
  { label: 'Torch', href: '/torch' },
]

type Props = {
  /** 'hero' keeps the .hero_header class so GSAP intro animation still targets it. */
  variant?: 'hero' | 'page'
  /** CTA target. On the landing page this is an in-page anchor; elsewhere it routes home. */
  ctaHref?: string
}

export default function SiteHeader({ variant = 'page', ctaHref }: Props) {
  const [open, setOpen] = useState(false)
  const cta = ctaHref ?? (variant === 'hero' ? '#prediction' : '/#prediction')
  const rootClass = `site_header${variant === 'hero' ? ' hero_header' : ''}`

  return (
    <div className={rootClass}>
      <Link href="/" className="site_header_logo" aria-label="Lemnisca home">
        <img src="/assets/Landing_assets/logo.svg" alt="lemnisca" />
      </Link>

      <nav className="site_header_nav" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="site_header_nav_link">
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="site_header_actions">
        <a href={cta} className="site_header_cta">
          <button>Enter the loop</button>
        </a>
        <button
          type="button"
          className="site_header_menu_btn"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className={`site_header_mobile${open ? ' is-open' : ''}`} role="menu">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="site_header_mobile_link"
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <a
          href={cta}
          className="site_header_mobile_link site_header_mobile_cta"
          onClick={() => setOpen(false)}
        >
          Enter the loop
        </a>
      </div>
    </div>
  )
}
