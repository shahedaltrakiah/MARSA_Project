import { getTranslations } from "next-intl/server"
import { Eye, Target, Users } from "lucide-react"

import { AboutPageHero } from "@/components/marketing/about-page-hero"
import { MarketingPageCta } from "@/components/marketing/MarketingPageCta"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default async function AboutPage() {
  const t = await getTranslations("About")

  const pillars = [
    { icon: Target, title: t("missionTitle"), body: t("missionBody") },
    { icon: Eye, title: t("visionTitle"), body: t("visionBody") },
    { icon: Users, title: t("audienceTitle"), body: t("audienceBody") },
  ] as const

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <AboutPageHero />

      <Separator className="my-10" />

      <div className="grid gap-5 md:grid-cols-3">
        {pillars.map(({ title, icon: Icon, body }) => (
          <Card
            key={title}
            className="group relative overflow-hidden border-white/10 bg-card/70 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-secondary/30 hover:shadow-md"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[color-mix(in_oklab,var(--secondary)_12%,transparent)] blur-2xl transition-opacity group-hover:opacity-100"
            />
            <CardHeader className="relative pb-2">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold tracking-tight">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary leading-none text-white shadow-sm [&_svg]:block [&_svg]:shrink-0">
                  <Icon className="size-5" />
                </span>
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative text-sm leading-relaxed text-muted-foreground">{body}</CardContent>
          </Card>
        ))}
      </div>

      <MarketingPageCta className="mt-12" />
    </div>
  )
}
