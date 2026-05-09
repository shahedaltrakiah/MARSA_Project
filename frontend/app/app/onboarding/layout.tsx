import type { ReactNode } from "react"

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1600px]">{children}</div>
}

