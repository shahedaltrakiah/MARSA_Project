"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/components/utils"

type NavItem = {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors",
        scrolled
          ? "border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/55"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="inline-flex items-center" aria-label="MARSA home">
          <span className="relative h-9 w-32 overflow-hidden sm:w-36">
            <Image
              src="/brand/marsa-logo-blue.png"
              alt="MARSA logo"
              fill
              className="object-contain dark:hidden"
              priority
            />
            <Image
              src="/brand/marsa-logo-blue-white.png"
              alt="MARSA logo"
              fill
              className="hidden object-contain dark:block"
              priority
            />
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative rounded-xl px-3 py-2 text-sm transition-all",
                  "text-muted-foreground hover:text-foreground",
                  "hover:-translate-y-0.5 hover:bg-muted/60",
                  active && "text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 -bottom-[1px] h-px bg-foreground transition-opacity",
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                  )}
                />
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: "sm", variant: "outline" }),
              "marsa-gradient-border transition-transform hover:-translate-y-0.5"
            )}
          >
            Login
          </Link>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "sm", variant: "secondary" }),
              "transition-transform hover:-translate-y-0.5"
            )}
          >
            Start your startup
          </Link>
        </div>

        <div className="sm:hidden">
          <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
            Start
          </Link>
        </div>
      </div>
    </header>
  )
}

