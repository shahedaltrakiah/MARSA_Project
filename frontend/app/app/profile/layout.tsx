import type { ReactNode } from "react"

import Topbar from "@/components/layout/Topbar"

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <main className="mx-auto max-w-[1600px] p-6">{children}</main>
    </div>
  )
}

