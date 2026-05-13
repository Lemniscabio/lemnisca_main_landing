'use client';

import { useLayoutEffect, useRef, useState } from 'react';

type Step = { label: string };

type PanelConfig = {
  variant: 'muted' | 'blue';
  label: string;
  steps: Step[];
  exitLabel: string;
  stat: string;
  statNote: string;
  loopBackToIndex: number;
  loopLabel?: string;
};

type FlowProps = PanelConfig;

const H_BRACKET_DROP = 14;
const H_BRACKET_BOTTOM = 44;

function nodeCls(blue: boolean) {
  return blue
    ? 'border-blue-200 bg-white text-[#1B2943] shadow-[0_1px_3px_rgba(65,64,252,0.06)]'
    : 'border-[#D7DDE6] bg-white text-[#1B2943]';
}

function circleCls(blue: boolean) {
  return blue
    ? 'border-blue-400 bg-blue-50 text-blue-700'
    : 'border-[#B8C2D2] bg-white text-[#5A6B85]';
}

function exitCls(blue: boolean) {
  return blue
    ? 'border-green-200 bg-green-50 text-green-700'
    : 'border-[#CCDDD1] bg-[#F0F7F2] text-[#6B9E7A]';
}

function arrowCls(blue: boolean) {
  return blue ? 'text-blue-300' : 'text-[#C8D0DC]';
}

function yesCls(blue: boolean) {
  return blue ? 'text-[#4A6FBF]' : 'text-[#7A8BA6]';
}

function strokeColor(blue: boolean) {
  return blue ? '#7DA0E8' : '#C2CAD6';
}

function labelFillColor(blue: boolean) {
  return blue ? '#4A6FBF' : '#8B95A6';
}

function horizontalNodeClass(index: number, blue: boolean) {
  if (!blue) return index === 0 ? 'w-[92px]' : 'w-[82px]';

  return ['w-[88px]', 'w-[92px]', 'w-[92px]', 'w-[112px]'][index] ?? 'w-[88px]';
}

// ---------- Horizontal (lg+) ----------
function HorizontalFlow({
  variant,
  steps,
  exitLabel,
  loopBackToIndex,
  loopLabel,
}: FlowProps) {
  const blue = variant === 'blue';
  const flowRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const decisionRef = useRef<HTMLDivElement | null>(null);
  const [geom, setGeom] = useState<{ leftX: number; rightX: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const flow = flowRef.current;
    const decision = decisionRef.current;
    if (!flow || !decision) return;

    function measure() {
      const target = nodeRefs.current[loopBackToIndex];
      if (!flow || !decision || !target) return;

      const flowRect = flow.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      const dRect = decision.getBoundingClientRect();

      setGeom({
        leftX: (tRect.left + tRect.right) / 2 - flowRect.left,
        rightX: (dRect.left + dRect.right) / 2 - flowRect.left,
        width: flowRect.width,
      });
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(flow);
    return () => ro.disconnect();
  }, [loopBackToIndex]);

  return (
    <div className="overflow-hidden">
      <div className="inline-block min-w-full">
        <div ref={flowRef} className="flex items-center gap-1">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-shrink-0 items-center gap-1">
              <div
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                className={`flex min-h-[34px] items-center justify-center rounded-[6px] border px-1.5 py-1 text-center text-[13px] font-medium leading-tight ${horizontalNodeClass(i, blue)} ${nodeCls(blue)}`}
              >
                {step.label}
              </div>
              <span className={`select-none text-[11px] leading-none ${arrowCls(blue)}`}>→</span>
            </div>
          ))}

          <div
            ref={decisionRef}
            className={`flex h-[70px] w-[70px] flex-shrink-0 items-center justify-center rounded-full border-2 text-center text-[12px] font-semibold leading-tight ${circleCls(blue)}`}
          >
            KPIs
            <br />
            achieved?
          </div>

          <span className={`select-none flex-shrink-0 text-[11px] leading-none ${arrowCls(blue)}`}>→</span>
          <span className={`flex-shrink-0 text-[9.5px] font-semibold ${yesCls(blue)}`}>Yes</span>
          <span className={`select-none flex-shrink-0 text-[11px] leading-none ${arrowCls(blue)}`}>→</span>
          <div
            className={`flex-shrink-0 whitespace-nowrap rounded-[6px] border px-1.5 py-1 text-[12px] font-semibold ${exitCls(blue)}`}
          >
            {exitLabel}
          </div>
        </div>

        {geom && (
          <svg
            className="pointer-events-none block"
            width={geom.width}
            height={H_BRACKET_BOTTOM + 12}
          >
            <path
              d={`M ${geom.rightX} 0 V ${H_BRACKET_BOTTOM} H ${geom.leftX} V ${H_BRACKET_DROP - 4}`}
              fill="none"
              stroke={strokeColor(blue)}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={`M ${geom.leftX - 5} ${H_BRACKET_DROP + 1} L ${geom.leftX} ${H_BRACKET_DROP - 5} L ${geom.leftX + 5} ${H_BRACKET_DROP + 1}`}
              fill="none"
              stroke={strokeColor(blue)}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x={(geom.leftX + geom.rightX) / 2}
              y={H_BRACKET_BOTTOM - 5}
              fill={labelFillColor(blue)}
              fontSize="11"
              fontWeight="600"
              textAnchor="middle"
            >
              No
            </text>
            {loopLabel && (
              <text
                x={geom.leftX + 10}
                y={H_BRACKET_DROP + 12}
                fill={labelFillColor(blue)}
                fontSize="11"
                fontStyle="italic"
              >
                {loopLabel}
              </text>
            )}
          </svg>
        )}
      </div>
    </div>
  );
}

// ---------- Vertical (below lg) ----------
function VerticalFlow({
  variant,
  steps,
  exitLabel,
  loopBackToIndex,
  loopLabel,
}: FlowProps) {
  const blue = variant === 'blue';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const decisionRef = useRef<HTMLDivElement | null>(null);
  const [geom, setGeom] = useState<{ targetY: number; decisionY: number; height: number; flowLeftX: number } | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function measure() {
      const target = nodeRefs.current[loopBackToIndex];
      const decision = decisionRef.current;
      if (!container || !target || !decision) return;

      const cRect = container.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      const dRect = decision.getBoundingClientRect();

      setGeom({
        targetY: (tRect.top + tRect.bottom) / 2 - cRect.top,
        decisionY: (dRect.top + dRect.bottom) / 2 - cRect.top,
        height: cRect.height,
        flowLeftX: tRect.left - cRect.left,
      });
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [loopBackToIndex]);

  const stroke = strokeColor(blue);
  const labelFill = labelFillColor(blue);

  return (
    <div ref={containerRef} className="relative pl-12">
      {/* SVG bracket on the left side */}
      {geom && (
        <svg
          className="pointer-events-none absolute left-0 top-0"
          width={geom.flowLeftX + 4}
          height={geom.height}
          style={{ overflow: 'visible' }}
        >
          {/* Bracket: from decision's left → corner → up → toward target's left */}
          <path
            d={`M ${geom.flowLeftX - 2} ${geom.decisionY} H 10 V ${geom.targetY} H ${geom.flowLeftX - 8}`}
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right-pointing arrowhead at the target end */}
          <path
            d={`M ${geom.flowLeftX - 14} ${geom.targetY - 5} L ${geom.flowLeftX - 8} ${geom.targetY} L ${geom.flowLeftX - 14} ${geom.targetY + 5}`}
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* "No" label centered on the bottom horizontal of the bracket */}
          <text
            x={(10 + (geom.flowLeftX - 2)) / 2}
            y={geom.decisionY - 6}
            fill={labelFill}
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
          >
            No
          </text>
          {/* Optional "iterate model" label on the bracket's left vertical */}
          {loopLabel && (
            <text
              x={14}
              y={(geom.targetY + geom.decisionY) / 2 + 4}
              fill={labelFill}
              fontSize="10"
              fontStyle="italic"
            >
              {loopLabel}
            </text>
          )}
        </svg>
      )}

      {/* Vertical flow */}
      <div className="flex flex-col items-start gap-4">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-start">
            <div
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
              className={`whitespace-nowrap rounded-[7px] border px-2.5 py-1.5 text-[11px] font-medium leading-snug ${nodeCls(blue)}`}
            >
              {step.label}
            </div>
            <span className={`mt-1 ml-3 select-none text-[12px] leading-none ${arrowCls(blue)}`}>↓</span>
          </div>
        ))}

        {/* Decision row */}
        <div className="mt-1 flex items-center gap-1.5">
          <div
            ref={decisionRef}
            className={`flex h-[54px] w-[54px] flex-shrink-0 items-center justify-center rounded-full border-2 text-center text-[9px] font-semibold leading-tight ${circleCls(blue)}`}
          >
            KPIs
            <br />
            achieved?
          </div>
          <span className={`select-none text-[12px] leading-none ${arrowCls(blue)}`}>→</span>
          <span className={`text-[10.5px] font-semibold ${yesCls(blue)}`}>Yes</span>
          <span className={`select-none text-[12px] leading-none ${arrowCls(blue)}`}>→</span>
          <div className={`whitespace-nowrap rounded-[7px] border px-2.5 py-1.5 text-[11px] font-semibold ${exitCls(blue)}`}>
            {exitLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoopPanel(props: PanelConfig) {
  const { variant, label, stat, statNote } = props;
  const blue = variant === 'blue';

  return (
    <div
      className={`flex min-w-0 flex-col rounded-[24px] border ${
        blue
          ? 'border-blue-200 bg-[linear-gradient(160deg,#F4F6FF_0%,#EEF1FF_100%)] p-6 md:p-7'
          : 'border-[#E4E8EF] bg-[#F9FAFB] px-8 pt-6 pb-8 md:px-10 md:pt-7 md:pb-10'
      }`}
    >
      <div
        className={`inline-flex self-start items-center rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${
          blue ? 'bg-blue-600 text-white' : 'bg-[#E6EAF1] text-[#8496B4]'
        }`}
      >
        {label}
      </div>

      {/* Horizontal layout at 1230px+; vertical layout below 1230px */}
      <div className="mt-8 hidden min-[1230px]:mt-10 min-[1230px]:block">
        <HorizontalFlow {...props} />
      </div>
      <div className="mt-8 min-[1230px]:hidden">
        <VerticalFlow {...props} />
      </div>

      <div className="mt-24">
        <p
          className={`text-[3rem] font-bold leading-none tracking-[-0.05em] md:text-[3.6rem] ${
            blue ? 'text-blue-600' : 'text-[#C8D0DC]'
          }`}
        >
          {stat}
        </p>
        <p
          className={`mt-2.5 text-[14px] leading-[1.5] tracking-[-0.01em] md:text-[15px] ${
            blue ? 'text-[#50607D]' : 'text-[#9BA8BF]'
          }`}
        >
          {statNote}
        </p>
      </div>
    </div>
  );
}

export function LoopComparisonViz() {
  return (
    <div className="grid gap-5 min-[1230px]:grid-cols-[0.991fr_1.38fr] min-[1230px]:gap-6">
      <LoopPanel
        variant="muted"
        label="Without Tune"
        steps={[{ label: 'Run experiments' }, { label: 'Analyse data' }]}
        exitLabel="Pilot"
        stat="~10s"
        statNote="Physical experiments per loop — guided by intuition, high uncertainty"
        loopBackToIndex={0}
      />
      <LoopPanel
        variant="blue"
        label="With Tune"
        steps={[
          { label: 'Run experiments' },
          { label: 'Build predictive model' },
          { label: 'Run virtual experiments' },
          { label: 'Validate recommended runs' },
        ]}
        exitLabel="Pilot"
        stat="10,000s"
        statNote="Virtual experiments per loop — only targeted physical runs needed"
        loopBackToIndex={1}
        loopLabel="iterate model"
      />
    </div>
  );
}
