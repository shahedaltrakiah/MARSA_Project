import { Check } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/components/utils"
import { Link } from "@/i18n/navigation"

const TIER_IDS = ["free", "pro", "team"] as const

export default async function PricingPage() {
  const t = await getTranslations("Pricing")

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="max-w-2xl">
        <Badge variant="secondary">{t("badge")}</Badge>
        <h1 className="mt-4 text-balance font-[var(--font-heading)] text-4xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">{t("description")}</p>
      </div>

      <Separator className="my-10" />

      <div className="grid gap-4 md:grid-cols-3">
        {TIER_IDS.map((id) => {
          const tier = t.raw(id) as {
            name: string
            price: string
            description: string
            features: string[]
          }
          const highlighted = id === "pro"
          return (
            <Card
              key={id}
              className={
                highlighted
                  ? "border-secondary/50 bg-card/70 shadow-sm backdrop-blur"
                  : "bg-card/70 shadow-sm backdrop-blur"
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">{tier.name}</CardTitle>
                  {highlighted ? <Badge>{t("popular")}</Badge> : null}
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-tight">
                  {tier.price}
                  {id !== "free" ? (
                    <span className="ms-1 text-lg font-normal text-muted-foreground">{t("perMonth")}</span>
                  ) : null}
                </div>
                <div className="text-sm text-muted-foreground">{tier.description}</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="size-4 text-foreground" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ variant: highlighted ? "secondary" : "outline" }),
                    "w-full"
                  )}
                >
                  {t("cta")}
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
