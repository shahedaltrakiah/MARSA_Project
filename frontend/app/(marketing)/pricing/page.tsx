import { Check } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/components/utils"

const tiers = [
  {
    name: "Starter",
    price: "$0",
    description: "For early ideas and solo founders.",
    features: ["Framework workspace", "Notes panel", "Theme switching"],
  },
  {
    name: "Pro",
    price: "$19",
    description: "For founders building consistently.",
    features: ["Multiple projects", "Advanced notes", "Priority updates"],
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    description: "For teams collaborating end-to-end.",
    features: ["Shared projects", "Roles & permissions", "Team dashboards"],
  },
]

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-3 text-muted-foreground">Simple tiers. Upgrade when you’re ready.</p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={tier.highlighted ? "border-primary/40 bg-card/80 backdrop-blur" : "bg-card"}
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
                  buttonVariants({ variant: tier.highlighted ? "default" : "outline" }),
                  "w-full"
                )}
              >
                Get Started
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

