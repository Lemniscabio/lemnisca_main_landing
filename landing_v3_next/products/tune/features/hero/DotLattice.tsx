'use client';

// Calibration substrate. Aligned dot lattice — graph-paper rhythm, no drift, no
// displacement. Reads as instrumentation, not particles.
//
// Interactions:
//  - Cursor hover: dots within ~120px brighten in place (no movement).
//  - Click: a yellow signal pulse propagates through the lattice — dots tint
//    yellow at the expanding wavefront then fade. Restrained, low-energy.
//
// prefers-reduced-motion: kills cursor reactivity and click pulses; lattice stays.

import { useEffect, useRef } from 'react';

const SPACING = 28;
const DOT_RADIUS = 1.2;
const DOT_BASE: [number, number, number] = [161, 161, 254];   // blue-200
const DOT_BRIGHT: [number, number, number] = [205, 205, 254]; // blue-100
const PULSE_TINT: [number, number, number] = [251, 252, 64];  // yellow-50
const HOVER_RADIUS_PX = 138;
const HOVER_FALLOFF_POWER = 1.6;
const HOVER_ALPHA_BOOST = 7.56;
const HOVER_ALPHA_CAP = 7.74;

const PULSE_LIFE_MS = 900;
const PULSE_SPEED_PX_PER_MS = 0.55; // expanding wavefront speed
const PULSE_BAND_WIDTH = 22;        // thickness of the affected ring around the wavefront

type Pulse = {
  x: number;
  y: number;
  start: number;
};

export function DotLattice() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let mouseX = -9999;
    let mouseY = -9999;
    const pulses: Pulse[] = [];
    let raf = 0;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = width + 'px';
      canvas!.style.height = height + 'px';
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function paint(now: number) {
      ctx!.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      const offsetX = (width - (cols - 1) * SPACING) / 2;
      const offsetY = SPACING * 0.6;

      // Subtle headline-zone falloff so the type stays primary.
      const headlineCx = width * 0.28;
      const headlineCy = height * 0.45;
      const headlineR = Math.min(width, height) * 0.42;

      // Cull dead pulses.
      for (let i = pulses.length - 1; i >= 0; i--) {
        if (now - pulses[i].start > PULSE_LIFE_MS) pulses.splice(i, 1);
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * SPACING;
          const y = offsetY + r * SPACING;
          if (x < -2 || x > width + 2 || y < -2 || y > height + 2) continue;

          const hdx = x - headlineCx;
          const hdy = y - headlineCy;
          const hdist = Math.sqrt(hdx * hdx + hdy * hdy);
          const hdFalloff = Math.min(1, Math.max(0, (hdist - headlineR * 0.35) / (headlineR * 0.65)));
          const vTaper = 0.78 + 0.22 * Math.min(1, y / height);

          let alpha = (0.14 + 0.24 * hdFalloff) * vTaper;

          // Cursor proximity (no displacement, just brighten).
          let mix = 0;
          if (!reduced) {
            const dx = x - mouseX;
            const dy = y - mouseY;
            const d2 = dx * dx + dy * dy;
            const R = HOVER_RADIUS_PX;
            if (d2 < R * R) {
              const d = Math.sqrt(d2);
              mix = (1 - d / R) ** HOVER_FALLOFF_POWER;
              alpha = Math.min(HOVER_ALPHA_CAP, alpha + mix * HOVER_ALPHA_BOOST);
            }
          }

          let cr = DOT_BASE[0] + (DOT_BRIGHT[0] - DOT_BASE[0]) * mix;
          let cg = DOT_BASE[1] + (DOT_BRIGHT[1] - DOT_BASE[1]) * mix;
          let cb = DOT_BASE[2] + (DOT_BRIGHT[2] - DOT_BASE[2]) * mix;

          // Yellow pulse — sums across active pulses, capped.
          if (!reduced && pulses.length > 0) {
            let yellowMix = 0;
            for (const p of pulses) {
              const age = now - p.start;
              const radius = age * PULSE_SPEED_PX_PER_MS;
              const dx = x - p.x;
              const dy = y - p.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const bandDelta = Math.abs(dist - radius);
              if (bandDelta < PULSE_BAND_WIDTH) {
                // Triangle window across the band.
                const bandEnergy = 1 - bandDelta / PULSE_BAND_WIDTH;
                // Fade across pulse lifetime.
                const lifeFade = 1 - age / PULSE_LIFE_MS;
                yellowMix += bandEnergy * lifeFade;
              }
            }
            yellowMix = Math.min(1, yellowMix);
            if (yellowMix > 0) {
              cr = cr + (PULSE_TINT[0] - cr) * yellowMix;
              cg = cg + (PULSE_TINT[1] - cg) * yellowMix;
              cb = cb + (PULSE_TINT[2] - cb) * yellowMix;
              alpha = Math.min(0.85, alpha + yellowMix * 0.45);
            }
          }

          ctx!.beginPath();
          ctx!.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${cr | 0},${cg | 0},${cb | 0},${alpha})`;
          ctx!.fill();
        }
      }
    }

    function loop() {
      paint(performance.now());
      raf = requestAnimationFrame(loop);
    }

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }
    function onLeave() {
      mouseX = -9999;
      mouseY = -9999;
    }
    function onClick(e: MouseEvent) {
      if (reduced) return;
      const rect = canvas!.getBoundingClientRect();
      pulses.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        start: performance.now(),
      });
      // Cap concurrent pulses so the substrate stays calm.
      if (pulses.length > 4) pulses.shift();
    }

    resize();
    paint(performance.now());

    if (!reduced) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseleave', onLeave);
      // Listen on the section parent so clicks anywhere in the hero emit a pulse,
      // including clicks on text, buttons, and the dial.
      const parent = canvas.parentElement;
      parent?.addEventListener('click', onClick);
      raf = requestAnimationFrame(loop);
      window.addEventListener('resize', resize);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseleave', onLeave);
        parent?.removeEventListener('click', onClick);
        window.removeEventListener('resize', resize);
      };
    }
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
