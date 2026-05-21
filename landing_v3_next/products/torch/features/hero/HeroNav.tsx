'use client';

// Torch-specific top nav. Mirrors products/tune/features/hero/HeroNav.tsx in
// structure (desktop inline / mobile sheet + hamburger, scroll-driven chrome
// swap, active-route detection) but adopts Torch's palette: dark canvas,
// white text, magenta accent.
//
// Cross-product nav items + CTA come from products/torch/content/shared.content.ts
// so the same nav schema can be reused by Thrust later.

import Link from 'next/link';
import posthog from 'posthog-js';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { shared } from '@/products/torch/content/shared.content';
import type { NavItem } from '@/products/torch/content/schema';

function captureTorchCtaClick(ctaLocation: string, destination: string) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.register({
    product: 'torch',
    surface: 'marketing',
    app: 'lemnisca_landing',
  });
  posthog.capture('torch_landing_cta_clicked', {
    cta_location: ctaLocation,
    destination,
  });
}

function externalLinkProps(href: string) {
  return href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

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

export function HeroNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const brand = shared.brand.name;
  const brandSuffix = shared.brand.suffix;
  const items = shared.nav.items;

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
          ? 'border-b border-white/10 bg-black/55 backdrop-blur-[18px] shadow-[inset_0_-1px_0_rgba(255,255,255,0.06),0_18px_54px_-38px_rgba(0,0,0,0.55)]'
          : 'bg-transparent shadow-none'
      }`}
    >
      <div className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10 lg:px-14">
        <Link
          href="/"
          className="group inline-flex items-end gap-2.5 transition-opacity duration-200 hover:opacity-85"
        >
          <span className="text-[30px] leading-none font-semibold tracking-[-0.02em] text-white transition-colors duration-300">
            {brand}
          </span>
          {brandSuffix && (
            <span className="flex flex-col items-start leading-none pb-[2px] text-white/70 transition-colors duration-300">
              <span className="text-[7px] font-medium tracking-[0.02em] md:text-[8px]">
                {brandSuffixParts(brandSuffix).pre}
              </span>
              <span className="text-[9px] font-medium tracking-[-0.02em] md:text-[10px]">
                {brandSuffixParts(brandSuffix).rest}
              </span>
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {items.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              scrolled={scrolled}
              active={isActiveRoute(item.href, pathname)}
            />
          ))}
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          {ctaItem && (
            <Link
              href={ctaItem.href}
              {...externalLinkProps(ctaItem.href)}
              onClick={() => captureTorchCtaClick('nav_mobile', ctaItem.href)}
              className="inline-flex items-center rounded-full px-3.5 py-2 text-[13px] font-medium text-white transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]"
              style={{
                background: '#E5388B',
                boxShadow: '0 12px 28px -18px rgba(229,56,139,0.7)',
              }}
            >
              {ctaItem.label}
            </Link>
          )}
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors duration-200 hover:bg-white/10"
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </div>

      <div
        id="torch-nav-mobile"
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
                    active ? 'bg-white/10 text-white' : 'text-white/85 hover:bg-white/5'
                  }`}
                >
                  <span>{item.label}</span>
                  {active && (
                    <span
                      aria-hidden
                      className="text-[12px] font-medium tracking-[0.06em] uppercase text-white/55"
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

function NavLink({
  item,
  scrolled,
  active,
}: {
  item: NavItem;
  scrolled: boolean;
  active: boolean;
}) {
  // CTA renders as a pink pill only after scroll. At rest it falls through to
  // the plain NavLink text+underline render below, matching the other nav
  // items so the bar stays minimal over the hero. Mirrors Tune's pattern.
  if (item.cta && scrolled) {
    return (
      <Link
        href={item.href}
        {...externalLinkProps(item.href)}
        onClick={() => captureTorchCtaClick('nav', item.href)}
        className="inline-flex items-center rounded-full px-4 py-2 text-[14px] font-medium text-white transition-[background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.97]"
        style={{
          background: '#E5388B',
          boxShadow: '0 12px 28px -18px rgba(229,56,139,0.7)',
        }}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      {...externalLinkProps(item.href)}
      aria-current={active ? 'page' : undefined}
      className={`group relative text-[14px] transition-[color,transform] duration-150 ease-out active:scale-[0.985] ${
        active ? 'text-white font-medium' : 'text-white/70 hover:text-white'
      }`}
    >
      <span>{item.label}</span>
      <span
        aria-hidden
        className={`absolute -bottom-1 left-0 h-px transition-[width] duration-200 ease-out group-hover:w-full ${
          active ? 'w-full' : 'w-0'
        }`}
        style={{ background: '#E5388B' }}
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
