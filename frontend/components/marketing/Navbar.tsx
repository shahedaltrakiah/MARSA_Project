"use client"

import * as React from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Menu, X } from "lucide-react"

import { LocaleSwitcher } from "@/components/marketing/LocaleSwitcher"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/components/utils"
import { Link, usePathname } from "@/i18n/navigation"

const NAV_HREFS = [
  { href: "/", labelKey: "home" as const },
  { href: "/features", labelKey: "features" as const },
  { href: "/about", labelKey: "about" as const },
  { href: "/pricing", labelKey: "pricing" as const },
  { href: "/contact", labelKey: "contact" as const },
]

export default function Navbar() {
  const t = useTranslations("Nav")
  const pathname = usePathname()
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  React.useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [mobileOpen])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all",
        scrolled
          ? "border-b bg-background/75 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/55"
          : "bg-background/0"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:h-16">
        <Link href="/" className="inline-flex min-w-0 items-center" aria-label={t("logoHome")}>
          <Image
            src="/brand/marsa-logo-blue.png"
            alt={t("logoAlt")}
            width={360}
            height={96}
            className="h-10 w-auto origin-left scale-[1.12] dark:hidden sm:h-11 sm:scale-[1.14]"
            priority
          />
          <Image
            src="/brand/marsa-logo-blue-white.png"
            alt={t("logoAlt")}
            width={360}
            height={96}
            className="hidden h-10 w-auto origin-left scale-[1.12] dark:block sm:h-11 sm:scale-[1.14]"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
          {NAV_HREFS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative rounded-xl px-3 py-1.5 text-sm transition-all",
                  "text-muted-foreground hover:text-foreground",
                  "hover:-translate-y-0.5 hover:bg-muted/50",
                  active && "text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                {t(item.labelKey)}
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
          <LocaleSwitcher />
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: "default", variant: "outline" }),
              "marsa-gradient-border transition-transform hover:-translate-y-0.5"
            )}
          >
            {t("login")}
          </Link>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "default", variant: "secondary" }),
              "transition-transform hover:-translate-y-0.5"
            )}
          >
            {t("start")}
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <LocaleSwitcher />
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
              "marsa-gradient-border size-9"
            )}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[100] sm:hidden" id="mobile-nav" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label={t("closeMenu")}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute end-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-s border-border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-4">
              <span className="text-sm font-semibold">{t("menu")}</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className={cn(buttonVariants({ size: "icon", variant: "ghost" }), "size-9")}
                aria-label={t("closeMenu")}
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="border-b px-4 py-3">
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "w-full marsa-gradient-border"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "w-full")}
                  onClick={() => setMobileOpen(false)}
                >
                  {t("signUp")}
                </Link>
              </div>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="Primary">
              {NAV_HREFS.map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-xl px-3 py-3 text-base font-medium transition-colors",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t(item.labelKey)}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  )
}
