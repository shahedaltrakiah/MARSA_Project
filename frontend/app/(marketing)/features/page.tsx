import {
  Bot,
  CircleDollarSign,
  LayoutGrid,
  ListChecks,
  ScanSearch,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/components/utils"

const featureSections = [
  {
    title: "Idea validation",
    icon: <ScanSearch className="size-4" />,
    description:
      "Turn your idea into testable assumptions. Capture hypotheses, experiments, learnings, and next decisions.",
    bullets: ["Assumption tracking", "Experiment planning", "Decision notes"],
  },
  {
    title: "Business model builder",
    icon: <LayoutGrid className="size-4" />,
    description:
      "Structure your offering, pricing, channels, costs, and customer segments. Keep everything connected and clear.",
    bullets: ["Value proposition", "Channels + pricing", "Cost structure"],
  },
  {
    title: "Financial wizard",
    icon: <CircleDollarSign className="size-4" />,
    description:
      "Plan runway and scenarios without spreadsheet chaos. Make financial decisions grounded and repeatable.",
    bullets: ["Runway planning", "Assumptions & scenarios", "Targets & milestones"],
  },
  {
    title: "Task management",
    icon: <ListChecks className="size-4" />,
    description:
      "Transform strategy into weekly actions. Keep execution aligned with the model and goals you set.",
    bullets: ["Weekly planning", "Outcome focus", "Simple prioritization"],
  },
  {
    title: "AI recommendations",
    icon: <Bot className="size-4" />,
    description:
      "Get context-aware suggestions, next steps, and prompts that reduce decision fatigue as you build.",
    bullets: ["Next-step prompts", "Clarity questions", "Workflow guidance"],
  },
  {
    title: "Trust & security (foundation)",
    icon: <ShieldCheck className="size-4" />,
    description:
      "A clean, modern foundation designed for SaaS reliability. (Placeholder — implementation evolves with backend.)",
    bullets: ["Role-ready layout", "Consistent UI system", "Future-proof structure"],
  },
]

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="max-w-2xl">
        <Badge variant="secondary">Features</Badge>
        <h1 className="mt-4 text-balance font-[var(--font-heading)] text-4xl font-semibold tracking-tight">
          A complete workspace for founders.
        </h1>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">
          MARSA helps you think clearly and execute consistently — with a structured framework, financial tools, and AI
          guidance.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "w-full sm:w-auto")}
          >
            Start your startup
          </Link>
          <Link
            href="/pricing"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto")}
          >
            View pricing
          </Link>
        </div>
      </div>

      <Separator className="my-10" />

      <div className="grid gap-4 md:grid-cols-2">
        {featureSections.map((f) => (
          <Card key={f.title} className="bg-card/70 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="inline-flex size-8 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  {f.icon}
                </span>
                {f.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{f.description}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {f.bullets.map((b) => (
                  <div key={b} className="rounded-xl border bg-background px-3 py-2 text-xs text-muted-foreground">
                    {b}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

