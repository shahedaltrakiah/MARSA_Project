import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { LegalArticle } from "@/components/marketing/legal/LegalArticle"
import { MarketingLegalPage } from "@/components/marketing/legal/MarketingLegalPage"
import { PRIVACY_POLICY_HTML } from "@/content/legal/privacy-policy-html"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Legal" })
  return {
    title: `${t("privacyTitle")} · MARSA`,
    description: "How MARSA collects, uses, and shares information when you use our services.",
  }
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations("Legal")

  return (
    <MarketingLegalPage
      title={t("privacyTitle")}
      lastUpdated={t("lastUpdated")}
      locale={locale}
      englishOnlyNotice={t("englishOnlyNotice")}
    >
      <LegalArticle html={PRIVACY_POLICY_HTML} />
    </MarketingLegalPage>
  )
}
