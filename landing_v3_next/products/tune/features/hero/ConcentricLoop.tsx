'use client';

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

// ─── Data ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: '01', line1: 'Audit the',   line2: 'data' },
  { id: '02', line1: 'Model the',   line2: 'process' },
  { id: '03', line1: 'Optimize' },
  { id: '04', line1: 'Pilot-ready', line2: 'process' },
] as const;

// ─── Geometry ─────────────────────────────────────────────────────────────────

const STEP_COUNT = 4;
const HOLD_MS    = 1300;
const MANUAL_AUTO_PAUSE_MS = 5000;
const TRAVEL_MS  = 920;
const SNAP_MS    = 420;
const EASE       = [0.4, 0, 0.2, 1] as [number, number, number, number];
const SNAP_EASE  = [0.23, 1, 0.32, 1] as [number, number, number, number];
const VIEW       = 560;
const CX         = 280;
const CY         = 280;
const RING_R     = 176;
const NODE_R     = 10.5;
const GAP_DEG    = 13;
const ACTIVE_ARC_DEG = 78;

const KNOB_R     = 96;
const KNOB_INNER = 67;
const TICK_N     = 56;
const IND_R      = KNOB_R - 14;
const KNOB_HEAD_DEG = -90;
const DRAG_TAP_THRESHOLD_DEG = 4;
const KNOB_EXPANDED_SCALE = 1.065;
const INERTIA_STOP_VELOCITY = 10;
const INERTIA_DAMPING = 1.25;
const INERTIA_SOFT_LIMIT_VELOCITY = 1600;
const INERTIA_OVERFLOW_RESPONSE = 700;
const INERTIA_MIN_RELEASE_VELOCITY = 360;
const INERTIA_MAX_MS = 3200;

// Section to scroll to when step labels/nodes are clicked
const HOW_IT_WORKS_ID = 'engagement-journey';

function stepLabel(step: (typeof STEPS)[number]) {
  return 'line2' in step ? `${step.line1} ${step.line2}` : step.line1;
}

function polar(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: +(CX + r * Math.cos(rad)).toFixed(2), y: +(CY + r * Math.sin(rad)).toFixed(2) };
}

function arcD(r: number, fromDeg: number, toDeg: number) {
  let to = toDeg;
  if (to <= fromDeg) to += 360;
  const s = polar(r, fromDeg);
  const e = polar(r, to);
  const large = to - fromDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

const stepDeg = (i: number) => -90 + i * 90;

function positiveModulo(value: number, modulo: number) {
  return ((value % modulo) + modulo) % modulo;
}

function shortestDeltaDeg(fromDeg: number, toDeg: number) {
  return ((toDeg - fromDeg + 540) % 360) - 180;
}

function stepFromRotation(rotation: number) {
  return positiveModulo(Math.round(rotation / 90), STEP_COUNT);
}

function snappedRotation(rotation: number) {
  return Math.round(rotation / 90) * 90;
}

function softenedInertiaVelocity(velocity: number) {
  const direction = Math.sign(velocity);
  const speed = Math.abs(velocity);

  if (speed <= INERTIA_SOFT_LIMIT_VELOCITY) return velocity;

  const overflow = speed - INERTIA_SOFT_LIMIT_VELOCITY;
  const softenedOverflow = Math.log1p(overflow / INERTIA_OVERFLOW_RESPONSE) * INERTIA_OVERFLOW_RESPONSE;
  return direction * (INERTIA_SOFT_LIMIT_VELOCITY + softenedOverflow);
}

function rotationForStep(step: number, currentRotation: number) {
  const currentMod = positiveModulo(currentRotation, 360);
  const targetMod = step * 90;
  return currentRotation + shortestDeltaDeg(currentMod, targetMod);
}

function activeArcD(rotation: number) {
  const headDeg = KNOB_HEAD_DEG + rotation;
  return arcD(RING_R, headDeg - ACTIVE_ARC_DEG, headDeg);
}

const knobTicks = Array.from({ length: TICK_N }, (_, i) => {
  const deg   = (i / TICK_N) * 360 - 90;
  const major = i % (TICK_N / 4) === 0;
  const mid   = i % (TICK_N / 8) === 0;
  const r0    = KNOB_R - (major ? 11 : mid ? 7 : 4.5);
  const r1    = KNOB_R - 1.5;
  return { a: polar(r0, deg), b: polar(r1, deg), major, mid };
});

function scrollToSection() {
  const el = document.getElementById(HOW_IT_WORKS_ID);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

type KnobDrag = {
  pointerId: number;
  previousDeg: number;
  rotation: number;
  totalTravelDeg: number;
  netTravelDeg: number;
  lastTime: number;
  velocityDegPerSecond: number;
};

type TouchPoint = {
  identifier: number;
  clientX: number;
  clientY: number;
};

type TouchCollection = {
  length: number;
  item(index: number): TouchPoint | null;
};

function findTouch(touches: TouchCollection, identifier: number) {
  for (let index = 0; index < touches.length; index += 1) {
    const touch = touches.item(index);
    if (touch?.identifier === identifier) return touch;
  }

  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ConcentricLoop() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hoveringKnob, setHoveringKnob] = useState(false);
  const [focusedKnob, setFocusedKnob] = useState(false);
  const [settling, setSettling] = useState(false);
  const [autoResumeTick, setAutoResumeTick] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const knobHitRef = useRef<SVGCircleElement>(null);
  const dragRef = useRef<KnobDrag | null>(null);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const inertiaFrameRef = useRef<number | null>(null);
  const manualPauseUntilRef = useRef(0);
  const motRot = useMotionValue(0);
  const activeArcPath = useTransform(motRot, activeArcD);
  const knobExpanded = dragging || hoveringKnob || focusedKnob;

  const clearSettleTimer = useCallback(() => {
    if (settleTimerRef.current === null) return;
    window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = null;
  }, []);

  const stopInertia = useCallback(() => {
    if (inertiaFrameRef.current === null) return;
    cancelAnimationFrame(inertiaFrameRef.current);
    inertiaFrameRef.current = null;
  }, []);

  const stopRotationAnimation = useCallback(() => {
    animationRef.current?.stop();
    animationRef.current = null;
    clearSettleTimer();
    stopInertia();
    setSettling(false);
  }, [clearSettleTimer, stopInertia]);

  const pauseAutoLoop = useCallback(() => {
    manualPauseUntilRef.current = performance.now() + MANUAL_AUTO_PAUSE_MS;
    setAutoResumeTick((tick) => tick + 1);
  }, []);

  const animateToRotation = useCallback((targetRotation: number, durationMs = SNAP_MS, ease = SNAP_EASE) => {
    animationRef.current?.stop();
    clearSettleTimer();

    if (reduced || durationMs <= 0) {
      motRot.set(targetRotation);
      setSettling(false);
      return;
    }

    setSettling(true);
    animationRef.current = animate(motRot, targetRotation, {
      duration: durationMs / 1000,
      ease,
    });
    settleTimerRef.current = window.setTimeout(() => {
      animationRef.current = null;
      settleTimerRef.current = null;
      setSettling(false);
    }, durationMs);
  }, [clearSettleTimer, motRot, reduced]);

  const pointerDegFromEvent = useCallback((event: { clientX: number; clientY: number }) => {
    const svg = svgRef.current;
    if (!svg) return null;

    const matrix = svg.getScreenCTM();
    if (matrix) {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const local = point.matrixTransform(matrix.inverse());
      return Math.atan2(local.y - CY, local.x - CX) * 180 / Math.PI;
    }

    const bounds = svg.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * VIEW;
    const y = ((event.clientY - bounds.top) / bounds.height) * VIEW;
    return Math.atan2(y - CY, x - CX) * 180 / Math.PI;
  }, []);

  const goToStep = useCallback((i: number) => {
    const targetRotation = rotationForStep(i, motRot.get());
    animateToRotation(targetRotation, TRAVEL_MS, EASE);
  }, [animateToRotation, motRot]);

  const startInertia = useCallback((initialVelocity: number) => {
    stopInertia();
    pauseAutoLoop();

    let velocity = softenedInertiaVelocity(initialVelocity);
    let rotation = motRot.get();
    let previousTime = performance.now();
    const startTime = previousTime;

    setSettling(true);

    const tick = (now: number) => {
      const elapsedSeconds = Math.min((now - previousTime) / 1000, 0.05);
      const nextVelocity = velocity * Math.exp(-INERTIA_DAMPING * elapsedSeconds);

      rotation += ((velocity + nextVelocity) / 2) * elapsedSeconds;
      velocity = nextVelocity;
      previousTime = now;
      motRot.set(rotation);

      const expired = now - startTime > INERTIA_MAX_MS;
      if (Math.abs(nextVelocity) <= INERTIA_STOP_VELOCITY || expired) {
        inertiaFrameRef.current = null;
        pauseAutoLoop();
        setSettling(false);
        return;
      }

      inertiaFrameRef.current = requestAnimationFrame(tick);
    };

    inertiaFrameRef.current = requestAnimationFrame(tick);
  }, [motRot, pauseAutoLoop, stopInertia]);

  const startKnobDrag = useCallback((pointerId: number, point: { clientX: number; clientY: number }) => {
    const pointerDeg = pointerDegFromEvent(point);
    if (pointerDeg === null) return false;
    const now = performance.now();

    pauseAutoLoop();
    stopRotationAnimation();
    dragRef.current = {
      pointerId,
      previousDeg: pointerDeg,
      rotation: motRot.get(),
      totalTravelDeg: 0,
      netTravelDeg: 0,
      lastTime: now,
      velocityDegPerSecond: 0,
    };
    setDragging(true);
    return true;
  }, [motRot, pauseAutoLoop, pointerDegFromEvent, stopRotationAnimation]);

  const updateKnobDrag = useCallback((pointerId: number, point: { clientX: number; clientY: number }) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== pointerId) return;

    const pointerDeg = pointerDegFromEvent(point);
    if (pointerDeg === null) return;

    const now = performance.now();
    const delta = shortestDeltaDeg(drag.previousDeg, pointerDeg);
    const elapsedSeconds = Math.max((now - drag.lastTime) / 1000, 0.016);
    const instantVelocity = delta / elapsedSeconds;

    drag.previousDeg = pointerDeg;
    drag.rotation += delta;
    drag.totalTravelDeg += Math.abs(delta);
    drag.netTravelDeg += delta;
    drag.lastTime = now;
    drag.velocityDegPerSecond = drag.velocityDegPerSecond * 0.28 + instantVelocity * 0.72;
    motRot.set(drag.rotation);
  }, [motRot, pointerDegFromEvent]);

  const finishKnobDrag = useCallback((pointerId: number, cancelled = false) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== pointerId) return;

    dragRef.current = null;
    setDragging(false);
    pauseAutoLoop();

    const rotation = motRot.get();
    if (cancelled) {
      setSettling(false);
      return;
    }

    if (drag.totalTravelDeg < DRAG_TAP_THRESHOLD_DEG) {
      animateToRotation(snappedRotation(rotation) + 90, TRAVEL_MS, EASE);
      return;
    }

    const releaseDirection = Math.sign(drag.velocityDegPerSecond || drag.netTravelDeg);
    const releaseVelocity = releaseDirection * Math.max(
      Math.abs(drag.velocityDegPerSecond),
      INERTIA_MIN_RELEASE_VELOCITY,
    );

    startInertia(releaseVelocity);
  }, [animateToRotation, motRot, pauseAutoLoop, startInertia]);

  const handleKnobPointerDown = useCallback((event: ReactPointerEvent<SVGCircleElement>) => {
    if (event.pointerType === 'touch') return;
    if (!event.isPrimary) return;

    event.preventDefault();
    if (!startKnobDrag(event.pointerId, event)) return;

    event.currentTarget.setPointerCapture(event.pointerId);
  }, [startKnobDrag]);

  const handleKnobPointerMove = useCallback((event: ReactPointerEvent<SVGCircleElement>) => {
    if (event.pointerType === 'touch') return;
    updateKnobDrag(event.pointerId, event);
  }, [updateKnobDrag]);

  const finishKnobPointerInteraction = useCallback((
    event: ReactPointerEvent<SVGCircleElement>,
    cancelled = false,
  ) => {
    if (event.pointerType === 'touch') return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    finishKnobDrag(event.pointerId, cancelled);
  }, [finishKnobDrag]);

  const handleKnobKeyDown = useCallback((event: ReactKeyboardEvent<SVGCircleElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      animateToRotation(snappedRotation(motRot.get()) + 90, TRAVEL_MS, EASE);
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      animateToRotation(snappedRotation(motRot.get()) - 90, TRAVEL_MS, EASE);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      goToStep(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      goToStep(STEP_COUNT - 1);
    }
  }, [animateToRotation, goToStep, motRot]);

  useEffect(() => {
    const unsubscribe = motRot.on('change', (latest) => {
      const nextActive = stepFromRotation(latest);
      setActive((current) => (current === nextActive ? current : nextActive));
    });

    return unsubscribe;
  }, [motRot]);

  useEffect(() => {
    if (reduced || dragging || settling) return;

    const remainingPauseMs = manualPauseUntilRef.current - performance.now();
    if (remainingPauseMs > 0) {
      const resumeTimer = window.setTimeout(() => {
        setAutoResumeTick((tick) => tick + 1);
      }, remainingPauseMs);

      return () => window.clearTimeout(resumeTimer);
    }

    const timer = window.setTimeout(() => {
      animateToRotation(snappedRotation(motRot.get()) + 90, TRAVEL_MS, EASE);
    }, HOLD_MS);

    return () => window.clearTimeout(timer);
  }, [active, animateToRotation, autoResumeTick, dragging, motRot, reduced, settling]);

  useEffect(() => {
    const knobHit = knobHitRef.current;
    if (!knobHit) return;

    const listenerOptions: AddEventListenerOptions = { passive: false };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.changedTouches.item(0);
      if (!touch) return;

      event.preventDefault();
      startKnobDrag(touch.identifier, touch);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const touch = findTouch(event.changedTouches, drag.pointerId) ?? findTouch(event.touches, drag.pointerId);
      if (!touch) return;

      event.preventDefault();
      updateKnobDrag(touch.identifier, touch);
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const touch = findTouch(event.changedTouches, drag.pointerId);
      if (!touch) return;

      event.preventDefault();
      finishKnobDrag(touch.identifier);
    };

    const handleTouchCancel = (event: TouchEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const touch = findTouch(event.changedTouches, drag.pointerId);
      if (!touch) return;

      event.preventDefault();
      finishKnobDrag(touch.identifier, true);
    };

    knobHit.addEventListener('touchstart', handleTouchStart, listenerOptions);
    window.addEventListener('touchmove', handleTouchMove, listenerOptions);
    window.addEventListener('touchend', handleTouchEnd, listenerOptions);
    window.addEventListener('touchcancel', handleTouchCancel, listenerOptions);

    return () => {
      knobHit.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [finishKnobDrag, startKnobDrag, updateKnobDrag]);

  useEffect(() => {
    return () => {
      animationRef.current?.stop();
      stopInertia();
      clearSettleTimer();
    };
  }, [clearSettleTimer, stopInertia]);

  return (
    <figure
      className="relative mx-auto aspect-square w-full max-w-[380px] sm:max-w-[460px] md:max-w-[520px]"
      aria-label="Tune four-step process: Audit the data, Model the process, Optimize, Pilot-ready process"
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        role="img"
      >
        {/* ── Defs ─────────────────────────────────────────────────────── */}
        <defs>
          <radialGradient id="tlKnobBody" cx="36%" cy="28%" r="72%">
            <stop offset="0%"   stopColor="#DDE3EF" />
            <stop offset="28%"  stopColor="#C4CAD8" />
            <stop offset="58%"  stopColor="#98A2B4" />
            <stop offset="85%"  stopColor="#748092" />
            <stop offset="100%" stopColor="#5C6878" />
          </radialGradient>
          <radialGradient id="tlKnobSpecular" cx="40%" cy="22%" r="46%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.78)" />
            <stop offset="42%"  stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
          </radialGradient>
          <radialGradient id="tlKnobRim" cx="50%" cy="50%" r="50%">
            <stop offset="68%"  stopColor="rgba(0,0,0,0)"    />
            <stop offset="92%"  stopColor="rgba(0,0,0,0.26)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.44)" />
          </radialGradient>
          <radialGradient id="tlKnobInner" cx="38%" cy="30%" r="68%">
            <stop offset="0%"   stopColor="#B8C2D0" />
            <stop offset="100%" stopColor="#8A94A6" />
          </radialGradient>
          <radialGradient id="tlIndicator" cx="34%" cy="28%" r="62%">
            <stop offset="0%"   stopColor="#FF8C5A" />
            <stop offset="55%"  stopColor="#E84C18" />
            <stop offset="100%" stopColor="#A83010" />
          </radialGradient>
          <radialGradient id="tlKnobAmbient" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(180,190,220,0.14)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)"          />
          </radialGradient>
          <filter id="tlKnobShadow" x="-35%" y="-35%" width="170%" height="170%">
            <feDropShadow dx="0" dy="12" stdDeviation="18" floodColor="rgba(0,0,0,0.70)" />
          </filter>
        </defs>

        {/* ── Background disc ──────────────────────────────────────────── */}
        <circle cx={CX} cy={CY} r={RING_R + 42}
          fill="rgba(3,2,122,0.11)"
          stroke="rgba(205,205,254,0.12)"
          strokeWidth={1}
        />

        {/* ── Orbit ring (dashed) ───────────────────────────────────────── */}
        <circle cx={CX} cy={CY} r={RING_R}
          fill="none"
          stroke="rgba(161,161,254,0.28)"
          strokeWidth={1.1}
          strokeDasharray="2.5 6"
        />

        {/* ── Static arc segments ───────────────────────────────────────── */}
        {STEPS.map((_, i) => (
          <path key={i}
            d={arcD(RING_R, stepDeg(i) + GAP_DEG, stepDeg((i + 1) % STEP_COUNT) - GAP_DEG)}
            fill="none"
            stroke="#7A88C0"
            strokeOpacity={0.32}
            strokeWidth={1.1}
          />
        ))}

        {/* ── Active arc: its head is locked to the knob's red indicator angle. */}
        <motion.path
          d={activeArcPath}
          fill="none"
          stroke="#FBFC40"
          strokeWidth={2.6}
          strokeLinecap="round"
          initial={false}
          animate={{ opacity: dragging ? 1 : 0.84 }}
          transition={{ duration: reduced ? 0 : 0.16, ease: 'easeOut' }}
        />

        {/* ── Step nodes + labels (clickable) ──────────────────────────── */}
        {STEPS.map((step, i) => {
          const isActive = i === active;
          const deg      = stepDeg(i);
          const node     = polar(RING_R, deg);
          const labelR   = RING_R + 36;
          const lp       = polar(labelR, deg);
          const anchor   = i === 0 || i === 2 ? 'middle' : i === 1 ? 'start' : 'end';
          const baseY    = i === 0 ? lp.y - 9 : i === 2 ? lp.y + 2 : lp.y - 7;
          // Active label is larger
          const fontSize = isActive ? 13.5 : 11;

          return (
            <g
              key={step.id}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                goToStep(i);
                scrollToSection();
              }}
            >
              {/* Hit target — invisible, generous area */}
              <circle cx={node.x} cy={node.y} r={NODE_R + 22} fill="transparent" />

              {/* Glow halo */}
              <motion.circle
                cx={node.x} cy={node.y} r={NODE_R + 10}
                fill="#FBFC40"
                initial={false}
                animate={{ opacity: isActive ? 0.18 : 0, scale: isActive ? 1 : 0.6 }}
                transition={{ duration: reduced ? 0 : 0.7, ease: [0.23, 1, 0.32, 1] }}
                style={{ transformOrigin: `${node.x}px ${node.y}px` }}
              />

              {/* Node body */}
              <motion.circle
                cx={node.x} cy={node.y} r={NODE_R}
                fill={isActive ? '#FBFC40' : '#0D1A38'}
                stroke={isActive ? '#FBFC40' : '#6878A8'}
                strokeWidth={isActive ? 2 : 1.2}
                initial={false}
                animate={{ scale: isActive ? 1.08 : 1 }}
                transition={{ duration: reduced ? 0 : 0.65, ease: [0.23, 1, 0.32, 1] }}
                style={{ transformOrigin: `${node.x}px ${node.y}px` }}
              />

              {/* Step number */}
              <text
                x={node.x} y={node.y + 4}
                textAnchor="middle"
                fill={isActive ? '#0A1020' : '#8898C8'}
                fontSize={9.5}
                fontFamily="monospace"
                fontWeight="700"
                style={{ userSelect: 'none' }}
              >
                {step.id}
              </text>

              {/* Label — two lines, grows when active */}
              <motion.text
                x={lp.x}
                textAnchor={anchor}
                fontFamily="monospace"
                fontWeight={isActive ? '700' : '400'}
                initial={false}
                animate={{
                  fill: isActive ? '#FBFC40' : 'rgba(161,161,254,0.68)',
                  fontSize,
                }}
                transition={{ duration: reduced ? 0 : 0.45, ease: [0.23, 1, 0.32, 1] }}
                style={{ userSelect: 'none' }}
              >
                <tspan x={lp.x} y={baseY}>{step.line1}</tspan>
                {'line2' in step && <tspan x={lp.x} dy={16}>{step.line2}</tspan>}
              </motion.text>
            </g>
          );
        })}

        {/* ══════════════════════════════════════════════════════════════════
            PHYSICAL KNOB — interactive (drag to rotate)
        ══════════════════════════════════════════════════════════════════ */}

        <motion.g
          initial={false}
          animate={{ scale: knobExpanded ? KNOB_EXPANDED_SCALE : 1 }}
          transition={{ duration: reduced ? 0 : 0.22, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          {/* Ambient glow */}
          <circle cx={CX} cy={CY} r={KNOB_R + 22} fill="url(#tlKnobAmbient)" />

          {/* Cast shadow */}
          <circle cx={CX} cy={CY + 12} r={KNOB_R - 6}
            fill="rgba(0,0,0,0.52)"
            style={{ filter: 'blur(20px)' }}
          />

          {/* Body dome + drop shadow — FIXED (light source doesn't rotate) */}
          <circle cx={CX} cy={CY} r={KNOB_R}
            fill="url(#tlKnobBody)"
            filter="url(#tlKnobShadow)"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth={0.8}
          />
          {/* Rim edge darkening */}
          <circle cx={CX} cy={CY} r={KNOB_R} fill="url(#tlKnobRim)" />
          {/* Specular highlight */}
          <circle cx={CX} cy={CY} r={KNOB_R} fill="url(#tlKnobSpecular)" />

          {/* ROTATING GROUP — ticks + bevel + disc + indicator */}
          <motion.g
            style={{
              rotate: motRot,
              transformOrigin: `${CX}px ${CY}px`,
            }}
          >
            {/* Tick marks — more visible */}
            {knobTicks.map(({ a, b, major, mid }, i) => (
              <line key={i}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={
                  major ? 'rgba(20,32,52,0.90)' :
                  mid   ? 'rgba(30,44,68,0.72)' :
                          'rgba(45,62,92,0.52)'
                }
                strokeWidth={major ? 2.0 : mid ? 1.4 : 0.9}
                strokeLinecap="round"
              />
            ))}

            {/* Bevel: shadow ring */}
            <circle cx={CX} cy={CY} r={KNOB_R - 13}
              fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth={1.5} />
            {/* Bevel: lit ring */}
            <circle cx={CX + 0.5} cy={CY - 0.5} r={KNOB_R - 14}
              fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth={0.9} />

            {/* Inner recessed disc */}
            <circle cx={CX} cy={CY} r={KNOB_INNER}
              fill="url(#tlKnobInner)"
              stroke="rgba(0,0,0,0.18)"
              strokeWidth={0.8}
            />
            {/* Disc top-highlight lip */}
            <circle cx={CX} cy={CY} r={KNOB_INNER}
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={0.7}
              strokeDasharray={`${KNOB_INNER * 1.5} ${KNOB_INNER * 10}`}
              strokeDashoffset={`${KNOB_INNER * 0.5}`}
            />

            {/* Indicator stem */}
            <line
              x1={CX} y1={CY - IND_R - 5}
              x2={CX} y2={CY - IND_R + 7}
              stroke="rgba(120,50,20,0.55)"
              strokeWidth={2.6}
              strokeLinecap="round"
            />
            {/* Indicator jewel */}
            <circle cx={CX} cy={CY - IND_R} r={6}
              fill="url(#tlIndicator)"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth={0.8}
            />
            {/* Jewel specular */}
            <ellipse
              cx={CX - 1.6} cy={CY - IND_R - 2}
              rx={2.4} ry={1.6}
              fill="rgba(255,200,160,0.72)"
            />
          </motion.g>
        </motion.g>

        {/* Interactive hit area on knob — drag to rotate, tap to advance. */}
        <circle
          ref={knobHitRef}
          cx={CX} cy={CY} r={KNOB_R}
          fill="transparent"
          role="slider"
          tabIndex={0}
          aria-label="Rotate Tune process step"
          aria-valuemin={1}
          aria-valuemax={STEP_COUNT}
          aria-valuenow={active + 1}
          aria-valuetext={`${STEPS[active].id}: ${stepLabel(STEPS[active])}`}
          style={{
            cursor: dragging ? 'grabbing' : 'grab',
            pointerEvents: 'all',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
          onPointerDown={handleKnobPointerDown}
          onPointerMove={handleKnobPointerMove}
          onPointerUp={(event) => finishKnobPointerInteraction(event)}
          onPointerCancel={(event) => finishKnobPointerInteraction(event, true)}
          onLostPointerCapture={(event) => finishKnobPointerInteraction(event, true)}
          onPointerEnter={() => setHoveringKnob(true)}
          onPointerLeave={() => setHoveringKnob(false)}
          onFocus={() => setFocusedKnob(true)}
          onBlur={() => setFocusedKnob(false)}
          onKeyDown={handleKnobKeyDown}
        />

        {/* Step counter — above knob, not rotating */}
        <AnimatePresence mode="wait">
          <motion.text
            key={active}
            x={CX} y={CY + KNOB_INNER - 10}
            textAnchor="middle"
            fontSize={8}
            fontFamily="monospace"
            fill="rgba(80,95,130,0.80)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {`${STEPS[active].id} / 04`}
          </motion.text>
        </AnimatePresence>

      </svg>
    </figure>
  );
}
