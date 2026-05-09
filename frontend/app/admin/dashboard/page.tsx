"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { AdminDashboardCharts } from "@/components/admin/AdminDashboardCharts"
import { AdminStatRibbon } from "@/components/admin/AdminStatRibbon"
import { useAdminI18n } from "@/components/admin/AdminI18nContext"
import api from "@/lib/api"
import type { AdminDashboardPayload } from "@/types/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboardPage() {
  const { t } = useAdminI18n()
  const [data, setData] = useState<AdminDashboardPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ data: AdminDashboardPayload }>("/admin/dashboard")
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (!data) {
    return <div className="text-destructive">Could not load dashboard.</div>
  }

  const { stats, recent_entrepreneurs } = data

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/[0.08] via-card/90 to-teal-500/[0.08] p-6 shadow-sm sm:p-8">
        <div
          className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-500/10"
          aria-hidden
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">MARSA</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">{t.navDashboard}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t.dashboardSubtitle}</p>
        </div>
      </div>

      <AdminStatRibbon
        stats={stats}
        labels={{
          entrepreneurs: t.statRegisteredEntrepreneurs,
          staff: t.statStaff,
          profiles: t.statProfilesWithContent,
        }}
      />

      <AdminDashboardCharts
        stats={stats}
        labels={{
          barTitle: t.chartCommunityOverview,
          pieTitle: t.chartProfileMix,
          entrepreneurs: t.chartBarEntrepreneurs,
          staff: t.chartBarStaff,
          profilesDetailed: t.chartBarProfiles,
          minimalProfile: t.chartPieMinimal,
          empty: t.chartEmpty,
        }}
      />

      <Card className="overflow-hidden border-border/80 shadow-md">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 border-b border-border/60 bg-muted/30 pb-4">
          <div>
            <CardTitle className="text-lg">{t.recentEntrepreneurs}</CardTitle>
            <CardDescription>{t.registeredLabel}</CardDescription>
          </div>
          <Link
            href="/admin/entrepreneurs"
            className="text-sm font-semibold text-primary hover:underline"
          >
            {t.seeAllEntrepreneurs}
          </Link>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          {recent_entrepreneurs.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">{t.chartEmpty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-semibold text-muted-foreground">{t.registeredLabel}</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Name</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Email</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">{t.completionLabel}</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground" />
                  </tr>
                </thead>
                <tbody>
                  {recent_entrepreneurs.map((row, i) => (
                    <tr
                      key={row.id}
                      className={
                        i % 2 === 0
                          ? "border-t border-border/60 bg-card"
                          : "border-t border-border/60 bg-muted/20"
                      }
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {new Date(row.registered_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex min-w-[3rem] items-center justify-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium tabular-nums text-emerald-800 dark:text-emerald-300">
                          {row.profile_completion_pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Link
                          href={`/admin/users/${row.id}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {t.viewDetails}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
