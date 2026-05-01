"use client"

import * as React from "react"
import { motion, useInView, type Variants } from "framer-motion"

import { cn } from "@/components/utils"

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { margin: "-15% 0px -10% 0px", once: true })

  const variants: Variants = {
    hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, delay } },
  }

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}

export function HoverCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  )
}

export function Floating({
  children,
  className,
  duration = 6,
}: {
  children: React.ReactNode
  className?: string
  duration?: number
}) {
  return (
    <motion.div
      className={cn("will-change-transform", className)}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  )
}

