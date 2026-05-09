"use client"

import AiSection from "@/components/marketing/landing/AiSection"
import CtaSection from "@/components/marketing/landing/CtaSection"
import HeroSection from "@/components/marketing/landing/HeroSection"
import HowItWorksSection from "@/components/marketing/landing/HowItWorksSection"
import ProblemSection from "@/components/marketing/landing/ProblemSection"
import WhatYouCanDoSection from "@/components/marketing/landing/WhatYouCanDoSection"

export default function LandingPage() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 min-h-[calc(100dvh-5rem)] sm:min-h-[calc(100dvh-6rem)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--secondary)_12%,transparent),transparent)]" />
      </div>

      <HeroSection />
      <ProblemSection />
      <WhatYouCanDoSection />
      <HowItWorksSection />
      <AiSection />
      <CtaSection />
    </div>
  )
}

