import { useEffect, useRef } from 'react'

const EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'keydown',
  'click',
  'scroll',
  'touchstart',
]

export function useIdleTimeout(timeoutMs: number, onTimeout: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const lastResetRef = useRef(Date.now())

  useEffect(() => {
    const reset = () => {
      const now = Date.now()
      // Debounce: only reset if >1s since last reset
      if (now - lastResetRef.current < 1000) return
      lastResetRef.current = now

      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(onTimeout, timeoutMs)
    }

    // Start initial timer
    timerRef.current = setTimeout(onTimeout, timeoutMs)

    for (const event of EVENTS) {
      window.addEventListener(event, reset, { passive: true })
    }

    return () => {
      clearTimeout(timerRef.current)
      for (const event of EVENTS) {
        window.removeEventListener(event, reset)
      }
    }
  }, [timeoutMs, onTimeout])
}
