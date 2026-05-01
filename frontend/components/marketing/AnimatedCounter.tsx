"use client"

import * as React from "react"
import { useInView, useMotionValue, useSpring } from "framer-motion"

export default function AnimatedCounter({
  value,
  suffix = "",
  duration = 0.9,
}: {
  value: number
  suffix?: string
  duration?: number
}) {
  const ref = React.useRef<HTMLSpanElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-20% 0px" })

  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 120, damping: 26 })
  const [display, setDisplay] = React.useState(0)

  React.useEffect(() => {
    return spring.on("change", (latest) => setDisplay(Math.round(latest)))
  }, [spring])

  React.useEffect(() => {
    if (!inView) return
    motionValue.set(0)
    spring.set(value)
  }, [inView, motionValue, spring, value, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  )
}

