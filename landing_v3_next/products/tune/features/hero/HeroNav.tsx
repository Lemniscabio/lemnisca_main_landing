'use client';

// Tune-specific top nav. Lives inside the hero atmosphere — transparent ground,
// light text against the deep blue field. No hard chrome separator.
//
// On scroll past the hero, the nav becomes a thin sticky bar with a subtle blur
// so it remains usable as the user moves through subsequent sections without
// breaking the atmospheric continuity at the top of the page.
//
// Responsive pattern mirrors components/SiteHeader.tsx (main marketing app):
// desktop renders all items inline; mobile collapses non-CTA links into a
// hamburger sheet, keeping only the CTA (and toggle button) visible on the
// top bar. This keeps the cross-product nav (Tune/Thrust/Torch) reachable
// from any product page without crowding narrow viewports.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type NavItem = { label: string; href: string; cta?: boolean };

type HeroNavProps = {
  brand: string;
  brandSuffix?: string;
  items: ReadonlyArray<NavItem>;
};

function externalLinkProps(href: string) {
  return href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

// Split "by Lemnisca" into { pre: "by", rest: "Lemnisca" } so we can stack them
// like the footer. If the suffix has no space, render the whole thing as `rest`.
function brandSuffixParts(suffix: string): { pre: string; rest: string } {
  const trimmed = suffix.trim();
  const firstSpace = trimmed.indexOf(' ');
  if (firstSpace === -1) return { pre: '', rest: trimmed };
  return {
    pre: trimmed.slice(0, firstSpace),
    rest: trimmed.slice(firstSpace + 1),
  };
}

function isActiveRoute(href: string, pathname: string | null) {
  if (!pathname || href.startsWith('http') || href.startsWith('#')) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeroNav({ brand, brandSuffix, items }: HeroNavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Close the mobile sheet on Escape and when the viewport widens past md.
  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    function onResize() {
      if (window.innerWidth >= 768) setMenuOpen(false);
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  const navLinks = items.filter((item) => !item.cta);
  const ctaItem = items.find((item) => item.cta);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 overflow-hidden transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300 ${
        scrolled || menuOpen
          ? 'border-b border-black/8 bg-white/44 backdrop-blur-[18px] shadow-[inset_0_-1px_0_rgba(255,255,255,0.16),0_18px_54px_-38px_rgba(3,8,42,0.2)]'
          : 'bg-transparent shadow-none'
      }`}
    >
      {scrolled || menuOpen ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[1px] rounded-none bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.1)_34%,rgba(255,255,255,0.03)_100%)]"
        />
      ) : null}

      <div className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10 lg:px-14">
        {/* Brand block — mirrors the footer's "TUNE by Lemnisca" arrangement:
            big brand on the left, tiny "by" stacked above a slightly larger
            "Lemnisca" on the right, bottom-aligned with the brand's baseline.

            ── SIZING KNOBS ──────────────────────────────────────────────
              • Brand "Tune"      → text-[30px]            (line below)
              • "by" small label  → text-[10px] md:text-[11px]
              • "Lemnisca" label  → text-[14px] md:text-[15px]
              • Gap brand↔stack   → gap-2.5
              • Stack bottom nudge→ pb-[2px]   (drops "Lemnisca" onto baseline)
            Increase/decrease any of these to taste; they're independent. */}
        <Link
          href="/"
          className="group inline-flex items-end gap-2.5 transition-opacity duration-200 hover:opacity-85"
        >
          <span
            className={`text-[30px] leading-none font-semibold tracking-[-0.02em] transition-colors duration-300 ${
              scrolled || menuOpen ? 'text-blue-900' : 'text-white'
            }`}
          >
            {brand}
          </span>
          {brandSuffix && (
            <span
              className={`flex flex-col items-start leading-none pb-[2px] transition-colors duration-300 ${
                scrolled || menuOpen ? 'text-blue-900/70' : 'text-white'
              }`}
            >
              <span className="text-[7px] font-medium tracking-[0.02em] md:text-[8px]">
                {brandSuffixParts(brandSuffix).pre}
              </span>
              <span className="text-[9px] font-medium tracking-[-0.02em] md:text-[10px]">
                {brandSuffixParts(brandSuffix).rest}
              </span>
            </span>
          )}
        </Link>

        {/* Desktop nav — all items inline. */}
        <nav className="hidden items-center gap-7 md:flex">
          {items.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              scrolled={scrolled}
              active={isActiveRoute(item.href, pathname)}
            />
          ))}
        </nav>

        {/* Mobile right side — CTA (compact) + hamburger toggle. */}
        <div className="flex items-center gap-3 md:hidden">
          {ctaItem && (
            <Link
              href={ctaItem.href}
              {...externalLinkProps(ctaItem.href)}
              className="inline-flex items-center rounded-full bg-[#FBFC40] px-3.5 py-2 text-[13px] font-medium text-blue-900 transition-[background-color,transform] duration-150 ease-out hover:bg-[#F4F538] active:scale-[0.97]"
              style={{ boxShadow: '0 12px 28px -18px rgba(251,252,64,0.7)' }}
            >
              {ctaItem.label}
            </Link>
          )}
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200 ${
              scrolled || menuOpen
                ? 'border-blue-900/15 text-blue-900 hover:bg-blue-900/5'
                : 'border-white/30 text-white hover:bg-white/10'
            }`}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {/* Mobile sheet — slides in below the bar with the cross-product nav. */}
      <div
        id="tune-nav-mobile"
        role="menu"
        className="md:hidden"
        style={{
          display: 'grid',
          gridTemplateRows: menuOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 260ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <nav
            className="relative z-10 flex flex-col gap-1 px-6 pb-6"
            aria-label="Mobile primary"
          >
            {navLinks.map((item) => {
              const active = isActiveRoute(item.href, pathname);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  {...externalLinkProps(item.href)}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center justify-between rounded-xl px-3 py-3 text-[16px] font-medium transition-colors duration-150 ${
                    active
                      ? 'bg-blue-900/8 text-blue-900'
                      : 'text-blue-900 hover:bg-blue-900/5'
                  }`}
                >
                  <span>{item.label}</span>
                  {active && (
                    <span
                      aria-hidden
                      className="text-[12px] font-medium tracking-[0.06em] uppercase text-blue-900/55"
                    >
                      Current
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavItem({
  item,
  scrolled,
  active,
}: {
  item: NavItem;
  scrolled: boolean;
  active: boolean;
}) {
  if (item.cta && scrolled) {
    return (
      <Link
        href={item.href}
        {...externalLinkProps(item.href)}
        className="inline-flex items-center rounded-full bg-[#FBFC40] px-4 py-2 text-[14px] font-medium text-blue-900 transition-[background-color,box-shadow,transform] duration-150 ease-out hover:bg-[#F4F538] active:scale-[0.97]"
        style={{ boxShadow: '0 12px 28px -18px rgba(251,252,64,0.7)' }}
      >
        {item.label}
      </Link>
    );
  }

  // Active route gets a persistent underline + slight weight bump so the
  // user always knows which product page they're on, even before hovering.
  return (
    <Link
      href={item.href}
      {...externalLinkProps(item.href)}
      aria-current={active ? 'page' : undefined}
      className={`group relative text-[14px] transition-[color,transform] duration-150 ease-out active:scale-[0.985] ${
        scrolled ? 'text-blue-900 hover:text-blue-700' : 'text-white hover:text-white/85'
      } ${active ? 'font-medium' : ''}`}
    >
      <span>{item.label}</span>
      <span
        aria-hidden
        className={`absolute -bottom-1 left-0 h-px transition-[width] duration-200 ease-out group-hover:w-full ${
          active ? 'w-full' : 'w-0'
        } ${scrolled ? 'bg-blue-900/70' : 'bg-white'}`}
      />
    </Link>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
      style={{ transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <line
        x1="2"
        y1="5"
        x2="16"
        y2="5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        style={{
          transformOrigin: '9px 5px',
          transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
          transform: open ? 'translateY(4px) rotate(45deg)' : 'none',
        }}
      />
      <line
        x1="2"
        y1="13"
        x2="16"
        y2="13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        style={{
          transformOrigin: '9px 13px',
          transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
          transform: open ? 'translateY(-4px) rotate(-45deg)' : 'none',
        }}
      />
    </svg>
  );
}
