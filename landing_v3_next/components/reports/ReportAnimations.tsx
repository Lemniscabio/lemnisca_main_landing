'use client'

  import { useEffect, useRef } from 'react'
  import gsap from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'

  gsap.registerPlugin(ScrollTrigger)

  export function ReportAnimations({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!containerRef.current) return

      const ctx = gsap.context(() => {
        // Animate all sections on scroll
        gsap.utils.toArray('.report-section').forEach((section: any) => {
          gsap.from(section, {
            y: 40,
            opacity: 0,
            duration: 0.5,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          })
        })

        // Stagger cards within sections
        gsap.utils.toArray('.glass-card').forEach((card: any) => {
          gsap.from(card, {
            y: 20,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
            },
          })
        })
      }, containerRef)

      return () => ctx.revert()
    }, [])

    return <div ref={containerRef}>{children}</div>
  }