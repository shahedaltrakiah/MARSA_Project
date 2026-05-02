import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { LegalArticle } from "@/components/marketing/legal/LegalArticle"
import { MarketingLegalPage } from "@/components/marketing/legal/MarketingLegalPage"
import { TERMS_HTML_AR } from "@/content/legal/terms-html-ar"
import { TERMS_HTML_EN } from "@/content/legal/terms-html"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Legal" })
  return {
    title: `${t("termsTitle")} · MARSA`,
    description: t("termsMetaDescription"),
  }
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations("Legal")
  const isAr = locale === "ar"

  return (
    <MarketingLegalPage
      title={t("termsTitle")}
      lastUpdated={t("lastUpdated")}
      locale={locale}
      showEnglishOnlyBanner={!isAr}
      englishOnlyNotice={t("englishOnlyNotice")}
    >
      <LegalArticle
        html={isAr ? TERMS_HTML_AR : TERMS_HTML_EN}
        dir={isAr ? "rtl" : "ltr"}
        lang={isAr ? "ar" : "en"}
      />
    </MarketingLegalPage>
  )
}
