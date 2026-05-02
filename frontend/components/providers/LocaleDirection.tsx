"use client"

import { useEffect } from "react"

import { useLocale } from "next-intl"

/** Syncs <html lang> and dir for RTL Arabic. */
export function LocaleDirection() {
  const locale = useLocale()

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"
  }, [locale])

  return null
}
