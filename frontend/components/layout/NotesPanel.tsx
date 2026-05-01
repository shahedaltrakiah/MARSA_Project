"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Link2, ListTodo, StickyNote, Image as ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type NotesPanelProps = {
  defaultCollapsed?: boolean
}

export default function NotesPanel({ defaultCollapsed = false }: NotesPanelProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  return (
    <aside
      className={[
        "relative h-[calc(100vh-3.5rem)] border-l bg-card transition-[width] duration-200",
        collapsed ? "w-12" : "w-[280px]",
      ].join(" ")}
    >
      <div className="flex h-14 items-center justify-between px-3">
        <div className={collapsed ? "sr-only" : "text-sm font-medium"}>Notes</div>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand notes panel" : "Collapse notes panel"}
        >
          {collapsed ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
        </Button>
      </div>

      <Separator />

      <div className={collapsed ? "hidden" : "p-3"}>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="text" aria-label="Text">
              <StickyNote className="size-4" />
            </TabsTrigger>
            <TabsTrigger value="images" aria-label="Images">
              <ImageIcon className="size-4" />
            </TabsTrigger>
            <TabsTrigger value="links" aria-label="Links">
              <Link2 className="size-4" />
            </TabsTrigger>
            <TabsTrigger value="checklists" aria-label="Checklists">
              <ListTodo className="size-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-3 space-y-2">
            <div className="rounded-lg border bg-background p-3 text-sm">
              <div className="font-medium">Quick note</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Capture ideas, decisions, and next steps for this project.
              </div>
              <div className="mt-3 h-20 rounded-md bg-muted" />
            </div>
            <div className="rounded-lg border bg-background p-3 text-xs text-muted-foreground">
              Placeholder content — Claude will wire real data later.
            </div>
          </TabsContent>

          <TabsContent value="images" className="mt-3 space-y-2">
            <div className="rounded-lg border bg-background p-3 text-sm">
              <div className="font-medium">Image board</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Add screenshots, diagrams, and inspiration references.
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="aspect-video rounded-md bg-muted" />
                <div className="aspect-video rounded-md bg-muted" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="links" className="mt-3 space-y-2">
            <div className="rounded-lg border bg-background p-3 text-sm">
              <div className="font-medium">Links</div>
              <div className="mt-2 space-y-2 text-xs">
                <a href="#" className="block rounded-md border bg-card px-3 py-2 hover:bg-muted">
                  Investor deck outline
                </a>
                <a href="#" className="block rounded-md border bg-card px-3 py-2 hover:bg-muted">
                  Market research notes
                </a>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="checklists" className="mt-3 space-y-2">
            <div className="rounded-lg border bg-background p-3 text-sm">
              <div className="font-medium">Checklist</div>
              <div className="mt-2 space-y-2 text-xs">
                <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
                  <div className="size-3 rounded border bg-background" />
                  Define target customer
                </div>
                <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
                  <div className="size-3 rounded border bg-background" />
                  Validate pricing assumptions
                </div>
                <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
                  <div className="size-3 rounded border bg-background" />
                  Draft first landing page
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  )
}

