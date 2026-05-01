import { Check } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/components/utils"

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Start with structure and clarity.",
    features: ["1 project", "Core framework", "Notes panel", "Theme switching"],
  },
  {
    name: "Pro",
    price: "$19",
    description: "For founders building weekly momentum.",
    features: ["Unlimited projects", "Financial wizard", "AI recommendations", "Priority updates"],
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    description: "For early teams collaborating end‑to‑end.",
    features: ["Collaboration", "Roles & permissions", "Shared dashboards", "Admin controls"],
  },
]

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="max-w-2xl">
        <Badge variant="secondary">Pricing</Badge>
        <h1 className="mt-4 text-balance font-[var(--font-heading)] text-4xl font-semibold tracking-tight">
          Simple pricing that scales with you.
        </h1>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">
          Start free, upgrade when you’re ready. (Placeholder pricing — can be adjusted anytime.)
        </p>
      </div>

      <Separator className="my-10" />

      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={tier.highlighted ? "border-secondary/50 bg-card/70 shadow-sm backdrop-blur" : "bg-card/70 shadow-sm backdrop-blur"}
          >
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">{tier.name}</CardTitle>
                {tier.highlighted ? <Badge>Popular</Badge> : null}
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight">{tier.price}</div>
              <div className="text-sm text-muted-foreground">{tier.description}</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-foreground" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: tier.highlighted ? "secondary" : "outline" }),
                  "w-full"
                )}
              >
                Start your startup
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

