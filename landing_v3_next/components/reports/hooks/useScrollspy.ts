import { useEffect, useRef, useState } from 'react'

export function useScrollspy(navIds: string[]) {
  const [activeSection, setActiveSection] = useState(navIds[0])
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map())

  useEffect(() => {
    const offset = 120

    const onScroll = () => {
      const scrollY = window.scrollY + offset
      const pageBottom = window.scrollY + window.innerHeight

      if (pageBottom >= document.documentElement.scrollHeight - 20) {
        setActiveSection(navIds[navIds.length - 1])
        return
      }

      let current = navIds[0]
      for (const id of navIds) {
        const el = sectionsRef.current.get(id)
        if (el && el.offsetTop <= scrollY) {
          current = id
        }
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [navIds])

  const registerSection = (id: string) => (el: HTMLElement | null) => {
    if (el) {
      el.setAttribute('data-section-id', id)
      sectionsRef.current.set(id, el)
    }
  }

  const scrollTo = (id: string) => {
    const el = sectionsRef.current.get(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return { activeSection, registerSection, scrollTo }
}
