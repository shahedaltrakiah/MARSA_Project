"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { MoveRight, PhoneCall, Sparkles } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/components/utils"

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0)
  const titles = useMemo(
    () => ["structured", "clear", "connected", "actionable", "AI‑guided"],
    []
  )

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((n) => (n === titles.length - 1 ? 0 : n + 1))
    }, 2000)
    return () => clearTimeout(timeoutId)
  }, [titles.length])

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-14 sm:pb-14 sm:pt-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-8 py-10 text-center sm:py-14 lg:py-20">
        <div>
          <Badge variant="secondary" className="gap-2">
            <Sparkles className="size-4" />
            MARSA — your startup workspace
          </Badge>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-balance font-[var(--font-heading)] text-4xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
            <span className="text-[color-mix(in_oklab,var(--primary)_85%,white)]">
              Go from idea to execution with a
            </span>
            <span className="relative mx-auto mt-2 flex w-full max-w-2xl justify-center overflow-hidden pb-3 pt-1 sm:pb-4">
              &nbsp;
              {titles.map((title, index) => (
                <motion.span
                  key={title}
                  className="absolute font-[var(--font-heading)] font-semibold"
                  initial={{ opacity: 0, y: -80, filter: "blur(6px)" }}
                  transition={{ type: "spring", stiffness: 60, damping: 18 }}
                  animate={
                    titleNumber === index
                      ? { y: 0, opacity: 1, filter: "blur(0px)" }
                      : {
                          y: titleNumber > index ? -140 : 140,
                          opacity: 0,
                          filter: "blur(8px)",
                        }
                  }
                >
                  <span className="bg-[linear-gradient(90deg,color-mix(in_oklab,var(--primary)_85%,white),color-mix(in_oklab,var(--secondary)_85%,white))] bg-clip-text text-transparent">
                    {title}
                  </span>
                </motion.span>
              ))}
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed tracking-tight text-muted-foreground sm:text-xl">
            Build your offering, map your business model, track runway, and ship weekly — with guided prompts and a
            single source of truth for your startup.
          </p>
        </div>

        <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "gap-3 transition-transform hover:-translate-y-0.5"
            )}
          >
            Talk to us <PhoneCall className="size-4" />
          </Link>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg", variant: "secondary" }),
              "group gap-3 transition-transform hover:-translate-y-0.5"
            )}
          >
            Start free <MoveRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export { Hero }

