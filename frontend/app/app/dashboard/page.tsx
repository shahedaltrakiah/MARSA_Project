"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { useProjects } from "@/hooks/useProjects"

export default function WorkspaceDashboardPage() {
  const t = useTranslations("Workspace.workspaceDashboard")
  const { user } = useAuth()
  const { projects, isLoading } = useProjects()

  const { total, owned, shared } = React.useMemo(() => {
    if (!user) return { total: 0, owned: 0, shared: 0 }
    const uid = user.id
    let o = 0
    let s = 0
    for (const p of projects) {
      if (p.owner.id === uid) o += 1
      else s += 1
    }
    return { total: projects.length, owned: o, shared: s }
  }, [projects, user])

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("total")}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">{total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("owned")}</CardDescription>
              <CardTitle className="text-3xl tabular-nums text-primary">{owned}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("shared")}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">{shared}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t("footnote")}</p>
    </div>
  )
}
