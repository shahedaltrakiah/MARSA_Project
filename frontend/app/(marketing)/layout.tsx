import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/components/utils"

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="inline-flex items-center">
            <span className="relative size-9 overflow-hidden">
              <Image
                src="/brand/marsa-logo-blue.png"
                alt="MARSA logo"
                fill
                className="object-contain p-1 dark:hidden"
                priority
              />
              <Image
                src="/brand/marsa-logo-blue-white.png"
                alt="MARSA logo"
                fill
                className="hidden object-contain p-1 dark:block"
                priority
              />
            </span>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex">
            <Link
              href="/about"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Login
            </Link>
            <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
              Get Started
            </Link>
          </nav>

          <div className="sm:hidden">
            <Link href="/login" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} MARSA</div>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

