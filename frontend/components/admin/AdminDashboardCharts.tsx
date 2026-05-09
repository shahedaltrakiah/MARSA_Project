"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { AdminDashboardStats } from "@/types/admin"

type Props = {
  stats: AdminDashboardStats
  labels: {
    barTitle: string
    pieTitle: string
    entrepreneurs: string
    staff: string
    profilesDetailed: string
    minimalProfile: string
    empty: string
  }
}

const BAR_COLORS = ["#0ea5e9", "#8b5cf6", "#10b981"]
const PIE_DETAILED = "#10b981"
const PIE_MINIMAL = "#64748b"

export function AdminDashboardCharts({ stats, labels }: Props) {
  const barData = [
    { name: labels.entrepreneurs, value: stats.workspace_members, key: "m" },
    { name: labels.staff, value: stats.staff, key: "s" },
    { name: labels.profilesDetailed, value: stats.profiles_with_content, key: "p" },
  ]

  const minimal = Math.max(0, stats.workspace_members - stats.profiles_with_content)
  const pieData = [
    { name: labels.profilesDetailed, value: stats.profiles_with_content, fill: PIE_DETAILED },
    { name: labels.minimalProfile, value: minimal, fill: PIE_MINIMAL },
  ]

  const pieTotal = pieData.reduce((a, b) => a + b.value, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-border/80 bg-card/80 p-4 shadow-sm backdrop-blur-sm">
        <h3 className="mb-4 text-sm font-semibold text-foreground">{labels.barTitle}</h3>
        <div className="h-[260px] w-full min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                interval={0}
                height={48}
                tickMargin={8}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {barData.map((_, i) => (
                  <Cell key={barData[i].key} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border/80 bg-card/80 p-4 shadow-sm backdrop-blur-sm">
        <h3 className="mb-2 text-sm font-semibold text-foreground">{labels.pieTitle}</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          {labels.profilesDetailed} vs {labels.minimalProfile}
        </p>
        {pieTotal === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            {labels.empty}
          </div>
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={2}
                  stroke="hsl(var(--border))"
                  strokeWidth={1}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [value, name]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
