import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { LegalArticle } from "@/components/marketing/legal/LegalArticle"
import { MarketingLegalPage } from "@/components/marketing/legal/MarketingLegalPage"
import { REFUND_POLICY_HTML } from "@/content/legal/refund-html"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Legal" })
  return {
    title: `${t("refundTitle")} · MARSA`,
    description: "MARSA refund, cancellation, and delivery policies.",
  }
}

export default async function RefundPolicyPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations("Legal")

  return (
    <MarketingLegalPage
      title={t("refundTitle")}
      lastUpdated={t("lastUpdated")}
      locale={locale}
      englishOnlyNotice={t("englishOnlyNotice")}
    >
      <LegalArticle html={REFUND_POLICY_HTML} />
    </MarketingLegalPage>
  )
}
