'use client';

// Tune-specific top nav. Lives inside the hero atmosphere — transparent ground,
// light text against the deep blue field. No hard chrome separator.
//
// On scroll past the hero, the nav becomes a thin sticky bar with a subtle blur
// so it remains usable as the user moves through subsequent sections without
// breaking the atmospheric continuity at the top of the page.

import Link from 'next/link';
import { useEffect, useState } from 'react';

type HeroNavProps = {
  brand: string;
  brandSuffix?: string;
  items: ReadonlyArray<{ label: string; href: string; cta?: boolean }>;
};

function externalLinkProps(href: string) {
  return href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

export function HeroNav({ brand, brandSuffix, items }: HeroNavProps) {
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 overflow-hidden transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300 ${
        scrolled
          ? 'border-b border-black/8 bg-white/44 backdrop-blur-[18px] shadow-[inset_0_-1px_0_rgba(255,255,255,0.16),0_18px_54px_-38px_rgba(3,8,42,0.2)]'
          : 'bg-transparent shadow-none'
      }`}
    >
      {scrolled ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[1px] rounded-none bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.1)_34%,rgba(255,255,255,0.03)_100%)]"
        />
      ) : null}

      <div className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10 lg:px-14">
        <Link
          href="/"
          className="group inline-flex items-baseline gap-2.5 transition-opacity duration-200 hover:opacity-85"
        >
          <span
            className={`text-[30px] leading-none font-semibold tracking-[-0.02em] transition-colors duration-300 ${
              scrolled ? 'text-blue-900' : 'text-white'
            }`}
          >
            {brand}
          </span>
          {brandSuffix && (
            <span
              className={`text-[12px] font-medium tracking-[0.02em] transition-colors duration-300 ${
                scrolled ? 'text-blue-900/70' : 'text-white'
              }`}
            >
              {brandSuffix}
            </span>
          )}
        </Link>
        <nav className="flex items-center gap-7">
          {items.map((item) => (
            <NavItem key={item.label} item={item} scrolled={scrolled} />
          ))}
        </nav>
      </div>
    </header>
  );
}

function NavItem({
  item,
  scrolled,
}: {
  item: { label: string; href: string; cta?: boolean };
  scrolled: boolean;
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

  return (
    <Link
      href={item.href}
      {...externalLinkProps(item.href)}
      className={`group relative text-[14px] transition-[color,transform] duration-150 ease-out active:scale-[0.985] ${
        scrolled ? 'text-blue-900 hover:text-blue-700' : 'text-white hover:text-white/85'
      }`}
    >
      <span>{item.label}</span>
      <span
        aria-hidden
        className={`absolute -bottom-1 left-0 h-px w-0 transition-[width] duration-200 ease-out group-hover:w-full ${
          scrolled ? 'bg-blue-900/70' : 'bg-white'
        }`}
      />
    </Link>
  );
}
