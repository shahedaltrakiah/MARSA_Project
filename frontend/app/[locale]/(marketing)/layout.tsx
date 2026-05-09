import type { ReactNode } from "react"

import MarketingFooter from "@/components/marketing/MarketingFooter"
import Navbar from "@/components/marketing/Navbar"
import ScrollToTop from "@/components/marketing/ScrollToTop"

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 pt-20 sm:pt-24">{children}</main>

      <MarketingFooter />

      <ScrollToTop />
    </div>
  )
}
