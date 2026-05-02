"use client"

import * as React from "react"
import Image from "next/image"

import { cn } from "@/components/utils"
import { Link } from "@/i18n/navigation"

export default function AuthSplitLayout({
  title,
  subtitle,
  children,
  bottom,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  bottom?: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden overflow-hidden border-r lg:flex">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_20%,color-mix(in_oklab,var(--secondary)_20%,transparent),transparent_62%),radial-gradient(900px_circle_at_70%_35%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_60%)]"
          />
          <div aria-hidden className="absolute inset-0 marsa-grid opacity-70" />
          <div aria-hidden className="absolute inset-0 marsa-noise" />
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.05))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.35))]" />

          <div className="relative flex w-full flex-col justify-between p-10">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="MARSA home">
              <Image
                src="/brand/marsa-logo-blue.png"
                alt="MARSA logo"
                width={420}
                height={120}
                className="h-16 w-auto scale-[1.2] origin-left dark:hidden"
                priority
              />
              <Image
                src="/brand/marsa-logo-blue-white.png"
                alt="MARSA logo"
                width={420}
                height={120}
                className="hidden h-16 w-auto scale-[1.2] origin-left dark:block"
                priority
              />
            </Link>

            <div className="max-w-md">
              <div className="text-balance font-[var(--font-heading)] text-3xl font-semibold tracking-tight">
                {title}
              </div>
              <p className="mt-3 text-pretty text-muted-foreground">{subtitle}</p>

              <div className="mt-8 grid gap-3">
                {[
                  "A clear workflow: Idea → Model → Finance → Action",
                  "Keep assumptions explicit and decisions documented",
                  "Get AI suggestions tied to your actual project context",
                ].map((t) => (
                  <div
                    key={t}
                    className="marsa-gradient-border rounded-2xl px-4 py-3 text-sm shadow-sm backdrop-blur"
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} MARSA</div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10 lg:px-10">
          <div className={cn("w-full max-w-md")}>
            <div className="mb-8 lg:hidden">
              <Link href="/" className="inline-flex items-center" aria-label="MARSA home">
                <Image
                  src="/brand/marsa-logo-blue.png"
                  alt="MARSA logo"
                  width={360}
                  height={104}
                  className="h-14 w-auto scale-[1.14] origin-left dark:hidden"
                  priority
                />
                <Image
                  src="/brand/marsa-logo-blue-white.png"
                  alt="MARSA logo"
                  width={360}
                  height={104}
                  className="hidden h-14 w-auto scale-[1.14] origin-left dark:block"
                  priority
                />
              </Link>
            </div>
            {children}
            {bottom ? <div className="mt-6">{bottom}</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

