import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { FicState } from "@/types/fic";

interface FicDetailMoodProps {
  state: FicState;
}

type Dimension = keyof FicState;

const DIMENSIONS: { key: Dimension; label: string; description: string }[] = [
  { key: "spice", label: "SPICE", description: "explicit content" },
  { key: "angst", label: "ANGST", description: "emotional intensity" },
  { key: "fluff", label: "FLUFF", description: "comfort & softness" },
  { key: "plot", label: "PLOT", description: "narrative complexity" },
  { key: "romance", label: "ROMANCE", description: "romantic focus" },
];

const INTENSITY_LABELS: Record<number, string> = {
  1: "minimal",
  2: "light",
  3: "moderate",
  4: "strong",
  5: "intense",
};

const BRAND_PINK = "#D462A6";
const GRID_COLOR = "rgba(255,255,255,0.06)";
const NUM_RINGS = 5;
const CENTER = 200;
const RADIUS = 120;
const VIEWBOX_SIZE = 400;

function getVertex(index: number, scale: number): [number, number] {
  const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
  return [
    CENTER + Math.cos(angle) * RADIUS * (scale / 5),
    CENTER + Math.sin(angle) * RADIUS * (scale / 5),
  ];
}

function polygonPoints(values: number[]): string {
  return values
    .map((v, i) => getVertex(i, v).join(","))
    .join(" ");
}

function getLabelPosition(index: number): { x: number; y: number; anchor: string } {
  const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
  const labelRadius = RADIUS + 28;
  const x = CENTER + Math.cos(angle) * labelRadius;
  const y = CENTER + Math.sin(angle) * labelRadius;

  let anchor = "middle";
  if (Math.cos(angle) < -0.1) anchor = "end";
  else if (Math.cos(angle) > 0.1) anchor = "start";

  return { x, y, anchor };
}

function getReaderFit(state: FicState): string {
  const entries = DIMENSIONS.map((d) => ({
    label: d.label.toLowerCase(),
    value: state[d.key],
  }));

  const sorted = [...entries].sort((a, b) => b.value - a.value);
  const top1 = sorted[0];
  const top2 = sorted[1];
  const lowest = sorted[sorted.length - 1];

  if (top1.value === lowest.value) {
    return "Balanced across all dimensions.";
  }

  return `Best for: high ${top1.label} & ${top2.label}. Light on ${lowest.label}.`;
}

export default function FicDetailMood({ state }: FicDetailMoodProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const dataValues = useMemo(
    () => DIMENSIONS.map((d) => state[d.key]),
    [state]
  );

  const zeroPoints = polygonPoints([0, 0, 0, 0, 0]);
  const dataPoints = polygonPoints(dataValues);

  const readerFit = useMemo(() => getReaderFit(state), [state]);

  const hoverDescription = useMemo(() => {
    if (hoveredIndex === null) return null;
    const dim = DIMENSIONS[hoveredIndex];
    const value = state[dim.key];
    const intensity = INTENSITY_LABELS[value] ?? "unknown";
    return `${dim.label} ${value}/5 — ${intensity} ${dim.description}`;
  }, [hoveredIndex, state]);

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <svg
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        className="w-full h-auto"
        role="img"
        aria-label="Mood radar chart"
      >
        {/* Grid rings */}
        {Array.from({ length: NUM_RINGS }, (_, ringIdx) => {
          const ringValue = ringIdx + 1;
          const points = Array.from({ length: 5 }, (_, i) =>
            getVertex(i, ringValue).join(",")
          ).join(" ");
          return (
            <polygon
              key={`ring-${ringIdx}`}
              points={points}
              fill="none"
              stroke={GRID_COLOR}
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines from center to each vertex */}
        {DIMENSIONS.map((_, i) => {
          const [vx, vy] = getVertex(i, 5);
          return (
            <line
              key={`axis-${i}`}
              x1={CENTER}
              y1={CENTER}
              x2={vx}
              y2={vy}
              stroke={GRID_COLOR}
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon */}
        <motion.polygon
          initial={{ points: shouldReduceMotion ? dataPoints : zeroPoints }}
          animate={{ points: dataPoints }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
          }
          fill={BRAND_PINK}
          fillOpacity={0.3}
          stroke={BRAND_PINK}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />

        {/* Vertex dots */}
        {dataValues.map((value, i) => {
          const [cx, cy] = getVertex(i, value);
          return (
            <motion.circle
              key={`dot-${i}`}
              initial={
                shouldReduceMotion
                  ? { cx, cy }
                  : { cx: CENTER, cy: CENTER }
              }
              animate={{ cx, cy }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
              }
              r={3}
              fill={BRAND_PINK}
              opacity={hoveredIndex === i ? 1 : 0.7}
            />
          );
        })}

        {/* Labels + hover hit areas */}
        {DIMENSIONS.map((dim, i) => {
          const { x, y, anchor } = getLabelPosition(i);
          const isHovered = hoveredIndex === i;
          const value = state[dim.key];

          return (
            <g
              key={`label-${i}`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-default"
            >
              {/* Invisible hit area for easier hovering */}
              <circle
                cx={x}
                cy={y}
                r={24}
                fill="transparent"
              />
              <text
                x={x}
                y={y}
                textAnchor={anchor}
                dominantBaseline="central"
                className="select-none"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fill: isHovered
                    ? "rgba(255,255,255,0.8)"
                    : "rgba(255,255,255,0.4)",
                  transition: "fill 0.2s ease",
                }}
              >
                {dim.label} {value}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover description area — fixed height to prevent layout shift */}
      <div className="h-6 flex items-center justify-center">
        <motion.p
          key={hoveredIndex ?? "empty"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "text-[12px] font-mono tracking-wider text-center",
            hoveredIndex !== null ? "text-white/60" : "text-transparent"
          )}
        >
          {hoverDescription ?? "\u00A0"}
        </motion.p>
      </div>

      {/* Reader fit sentence */}
      <p className="text-[12px] text-white/30 font-mono text-center mt-1">
        {readerFit}
      </p>
    </div>
  );
}
