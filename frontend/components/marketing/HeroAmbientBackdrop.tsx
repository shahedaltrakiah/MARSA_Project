"use client"

import type { CSSProperties } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Brain, Lightbulb, LineChart, ListChecks, Sparkles } from "lucide-react"

type Floater = {
  Icon: typeof Lightbulb
  style: CSSProperties
  duration: number
  delay: number
  x: number[]
  y: number[]
}

/** Sparse icon positions — deterministic for SSR (no random per request). */
const FLOATERS: Floater[] = [
  {
    Icon: Lightbulb,
    style: { top: "11%", left: "7%" },
    duration: 46,
    delay: 0,
    x: [0, 10, -6, 0],
    y: [0, -14, 6, 0],
  },
  {
    Icon: LineChart,
    style: { top: "19%", right: "9%" },
    duration: 52,
    delay: 4,
    x: [0, -8, 12, 0],
    y: [0, 12, -8, 0],
  },
  {
    Icon: ListChecks,
    style: { top: "42%", left: "11%" },
    duration: 41,
    delay: 9,
    x: [0, 7, -9, 0],
    y: [0, -11, 7, 0],
  },
  {
    Icon: Sparkles,
    style: { top: "33%", right: "16%" },
    duration: 55,
    delay: 2,
    x: [0, -11, 8, 0],
    y: [0, 16, -5, 0],
  },
  {
    Icon: Brain,
    style: { bottom: "26%", left: "18%" },
    duration: 48,
    delay: 11,
    x: [0, 9, -7, 0],
    y: [0, -13, 9, 0],
  },
  {
    Icon: Lightbulb,
    style: { bottom: "17%", right: "12%" },
    duration: 50,
    delay: 7,
    x: [0, -9, 6, 0],
    y: [0, 11, -7, 0],
  },
  {
    Icon: ListChecks,
    style: { top: "58%", right: "28%" },
    duration: 44,
    delay: 14,
    x: [0, 6, -8, 0],
    y: [0, -9, 10, 0],
  },
  {
    Icon: LineChart,
    style: { bottom: "38%", left: "38%" },
    duration: 54,
    delay: 3,
    x: [0, -7, 11, 0],
    y: [0, 14, -6, 0],
  },
]

const easeSmooth = [0.45, 0, 0.55, 1] as const

/**
 * Subtle grid, flow lines, soft glows, and small product icons (~15–22% opacity).
 * Behind copy; pointer-events none. Respects `prefers-reduced-motion`.
 */
export function HeroAmbientBackdrop() {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <>
      {/* Soft radial washes — very slow breathing */}
      {!reduceMotion ? (
        <>
          <motion.div
            className="absolute -left-[20%] top-[0%] h-[55vh] max-h-[520px] w-[70vw] rounded-full bg-[color-mix(in_oklab,var(--secondary)_22%,transparent)] blur-[100px]"
            animate={{ opacity: [0.22, 0.38, 0.28, 0.22], x: [0, 18, -8, 0], y: [0, 12, -6, 0] }}
            transition={{ duration: 48, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-[18%] top-[5%] h-[50vh] max-h-[480px] w-[65vw] rounded-full bg-[color-mix(in_oklab,var(--primary)_18%,transparent)] blur-[100px]"
            animate={{ opacity: [0.18, 0.32, 0.24, 0.18], x: [0, -16, 10, 0], y: [0, 10, -8, 0] }}
            transition={{ duration: 56, repeat: Infinity, ease: "easeInOut", delay: 6 }}
          />
          <motion.div
            className="absolute left-1/2 top-[25%] h-64 w-[85%] max-w-4xl -translate-x-1/2 rounded-full bg-[color-mix(in_oklab,var(--secondary)_14%,transparent)] blur-[80px]"
            animate={{ opacity: [0.14, 0.24, 0.18, 0.14], scaleX: [0.92, 1.02, 0.96, 0.92] }}
            transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      ) : (
        <>
          <div className="absolute -left-[20%] top-[0%] h-[55vh] max-h-[520px] w-[70vw] rounded-full bg-[color-mix(in_oklab,var(--secondary)_22%,transparent)] opacity-[0.28] blur-[100px]" />
          <div className="absolute -right-[18%] top-[5%] h-[50vh] max-h-[480px] w-[65vw] rounded-full bg-[color-mix(in_oklab,var(--primary)_18%,transparent)] opacity-[0.22] blur-[100px]" />
        </>
      )}

      {/* Fine grid */}
      <svg
        className="absolute inset-0 h-full w-full text-secondary opacity-[0.14] dark:opacity-[0.18]"
        aria-hidden
      >
        <defs>
          <pattern id="marsa-fine-grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M 56 0 L 0 0 0 56" fill="none" stroke="currentColor" strokeWidth="0.55" vectorEffect="non-scaling-stroke" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#marsa-fine-grid)" />
      </svg>

      {/* Flow / contour lines */}
      <svg
        className="absolute inset-0 h-full w-full overflow-visible text-secondary opacity-90"
        aria-hidden
      >
        {!reduceMotion ? (
          <motion.g
            initial={false}
            animate={{ opacity: [0.12, 0.2, 0.15, 0.12] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d="M -80 180 Q 180 120 420 200 T 920 160"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.65"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M 1100 320 Q 760 280 520 360 T 120 420"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.55"
              vectorEffect="non-scaling-stroke"
              opacity={0.9}
            />
            <path
              d="M -40 480 Q 240 420 500 500 T 980 440"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
              opacity={0.8}
            />
          </motion.g>
        ) : (
          <g className="opacity-[0.14]">
            <path
              d="M -80 180 Q 180 120 420 200 T 920 160"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.45"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M 1100 320 Q 760 280 520 360 T 120 420"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.4"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}
      </svg>

      {/* Small icons — tinted secondary, light blur so they read on dark */}
      {FLOATERS.map(({ Icon, style, duration, delay, x, y }, i) => (
        <motion.div
          key={`ambient-icon-${i}`}
          className="pointer-events-none absolute text-secondary opacity-[0.2] blur-[0.4px] drop-shadow-[0_0_12px_color-mix(in_oklab,var(--secondary)_35%,transparent)] [&_svg]:size-4 dark:opacity-[0.22]"
          style={style}
          animate={reduceMotion ? undefined : { x, y }}
          transition={{
            duration,
            repeat: Infinity,
            ease: easeSmooth,
            delay,
          }}
          aria-hidden
        >
          <Icon strokeWidth={1.25} />
        </motion.div>
      ))}
    </>
  )
}
