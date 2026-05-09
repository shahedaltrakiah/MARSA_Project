import Image from "next/image"
import {
  Building2,
  FileText,
  Globe,
  KeyRound,
  LayoutGrid,
  LogIn,
  Mail,
  RefreshCcw,
  Shield,
  Tag,
  UserPlus,
} from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/navigation"
import { cn } from "@/components/utils"

const navIconClass =
  "size-3.5 shrink-0 text-secondary opacity-75 transition-opacity group-hover:opacity-100"

export default async function MarketingFooter({ className }: { className?: string }) {
  const t = await getTranslations("Footer")
  const year = new Date().getFullYear()

  const linkClass = cn(
    "group inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium text-foreground/85 transition-colors sm:text-[13px]",
    "hover:bg-accent/60 hover:text-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  )

  const sectionTitleClass =
    "mb-2 font-[var(--font-heading)] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"

  return (
    <footer
      role="contentinfo"
      className={cn(
        "relative mt-auto shrink-0 overflow-hidden border-t border-border/70 bg-card text-xs sm:text-sm",
        className
      )}
    >
      <div className="h-px w-full bg-gradient-to-r from-primary/80 via-secondary to-primary/80" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-7">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-start lg:gap-10 xl:gap-14">
          <div className="flex shrink-0 justify-center lg:justify-start">
            <Link href="/" className="inline-flex shrink-0 items-center py-0.5" aria-label={t("brandAlt")}>
              <Image
                src="/brand/marsa-logo-blue.png"
                alt=""
                width={720}
                height={192}
                sizes="(max-width: 1024px) 260px, 320px"
                className="h-16 w-auto object-contain object-start dark:hidden sm:h-20 lg:h-24"
                priority={false}
              />
              <Image
                src="/brand/marsa-logo-blue-white.png"
                alt=""
                width={720}
                height={192}
                sizes="(max-width: 1024px) 260px, 320px"
                className="hidden h-16 w-auto object-contain object-start dark:block sm:h-20 lg:h-24"
                priority={false}
              />
            </Link>
          </div>

          {/* Explore | Account | Legal — aligned left next to logo */}
          <div className="grid w-full max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-none lg:grid-cols-3 lg:gap-10">
            <div>
              <p className={sectionTitleClass}>{t("exploreHeading")}</p>
              <nav className="flex flex-col gap-0" aria-label={t("exploreHeading")}>
                <Link href="/features" className={linkClass}>
                  <LayoutGrid className={navIconClass} aria-hidden />
                  {t("features")}
                </Link>
                <Link href="/pricing" className={linkClass}>
                  <Tag className={navIconClass} aria-hidden />
                  {t("pricing")}
                </Link>
                <Link href="/about" className={linkClass}>
                  <Building2 className={navIconClass} aria-hidden />
                  {t("about")}
                </Link>
                <Link href="/contact" className={linkClass}>
                  <Mail className={navIconClass} aria-hidden />
                  {t("contact")}
                </Link>
              </nav>
            </div>

            <div>
              <p className={sectionTitleClass}>{t("accountHeading")}</p>
              <nav className="flex flex-col gap-0" aria-label={t("accountNav")}>
                <Link href="/login" className={linkClass}>
                  <LogIn className={navIconClass} aria-hidden />
                  {t("signIn")}
                </Link>
                <Link href="/register" className={linkClass}>
                  <UserPlus className={navIconClass} aria-hidden />
                  {t("signUp")}
                </Link>
                <Link href="/forgot-password" className={linkClass}>
                  <KeyRound className={navIconClass} aria-hidden />
                  {t("forgotPassword")}
                </Link>
              </nav>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <p className={sectionTitleClass}>{t("legalHeading")}</p>
              <nav className="flex flex-col gap-0" aria-label={t("legalNav")}>
                <Link href="/privacy" className={linkClass}>
                  <Shield className={navIconClass} aria-hidden />
                  {t("privacy")}
                </Link>
                <Link href="/terms" className={linkClass}>
                  <FileText className={navIconClass} aria-hidden />
                  {t("terms")}
                </Link>
                <Link href="/refund" className={cn(linkClass, "items-start text-pretty leading-snug")}>
                  <RefreshCcw className={cn(navIconClass, "mt-0.5")} aria-hidden />
                  {t("refund")}
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-border/50 pt-4 text-[11px] text-muted-foreground sm:flex-row sm:text-xs">
          <p>{t("copyright", { year })}</p>
          <p className="inline-flex items-center gap-1.5 font-medium tabular-nums text-muted-foreground/90">
            <Globe className="size-3.5 shrink-0 text-secondary opacity-90" aria-hidden />
            www.marsa.app
          </p>
        </div>
      </div>
    </footer>
  )
}
