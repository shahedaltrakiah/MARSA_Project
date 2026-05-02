import { getTranslations } from "next-intl/server"

import { Badge } from "@/components/ui/badge"

/** Typography and spacing match the hero block on `(marketing)/features/page.tsx`. */
export async function AboutPageHero() {
  const t = await getTranslations("About")

  return (
    <div className="max-w-2xl">
      <Badge variant="secondary">{t("badge")}</Badge>
      <h1 className="mt-4 text-balance font-[var(--font-heading)] text-4xl font-semibold tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-4 text-pretty text-lg text-muted-foreground">{t("description")}</p>
    </div>
  )
}
