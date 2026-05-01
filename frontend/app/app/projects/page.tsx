import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/components/utils"

const projects = [
  { name: "Marsa Project", status: "Active", updated: "2h ago" },
  { name: "Pricing Experiment", status: "Draft", updated: "Yesterday" },
  { name: "Customer Interviews", status: "Active", updated: "3d ago" },
]

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placeholder list UI — Claude will wire real data and routing.
          </p>
        </div>
        <Button variant="secondary" className="sm:w-auto">
          New project
        </Button>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-4">
        {projects.map((p) => (
          <Card key={p.name} className="bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="truncate text-base">{p.name}</CardTitle>
                <div className="mt-1 text-xs text-muted-foreground">Updated {p.updated}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={p.status === "Active" ? "default" : "secondary"}>{p.status}</Badge>
                <Link href="/app/projects" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                  Open <ArrowRight className="ml-2 size-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg border bg-background p-3">
                  <div className="text-xs font-medium text-foreground">Offering</div>
                  <div className="mt-1 text-xs text-muted-foreground">Define value + differentiation.</div>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <div className="text-xs font-medium text-foreground">Customer</div>
                  <div className="mt-1 text-xs text-muted-foreground">Capture segments + insights.</div>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <div className="text-xs font-medium text-foreground">Money</div>
                  <div className="mt-1 text-xs text-muted-foreground">Model pricing + runway.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

