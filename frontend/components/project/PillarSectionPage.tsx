"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import { useProjectSection } from "@/hooks/useProjectSection"
import type { ProjectSectionContent, ProjectSectionName } from "@/types/api"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import AiSuggestPanel from "@/components/project/AiSuggestPanel"
import type { PillarTabDef } from "./pillar-section-fields"

const textareaClass =
  "min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function emptyForms<P extends string>(tabs: PillarTabDef<P>[]): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {}
  for (const tab of tabs) {
    out[tab.pillar] = {}
    for (const f of tab.fields) {
      out[tab.pillar][f.key] = ""
    }
  }
  return out
}

function buildFormsFromContent<P extends string>(
  content: ProjectSectionContent,
  tabs: PillarTabDef<P>[]
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {}
  for (const tab of tabs) {
    out[tab.pillar] = {}
    const raw = content[tab.pillar]
    const obj =
      raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
    for (const f of tab.fields) {
      const v = obj[f.key]
      out[tab.pillar][f.key] = typeof v === "string" ? v : ""
    }
  }
  return out
}

type PillarSectionPageProps<P extends string> = {
  sectionName: ProjectSectionName
  title: string
  description: string
  tabs: PillarTabDef<P>[]
  /** When set, shows AI panel for the active pillar (Reach only; Targets uses workspace). */
  aiPillarSection?: "reach"
}

export function PillarSectionPage<P extends string>({
  sectionName,
  title,
  description,
  tabs,
  aiPillarSection,
}: PillarSectionPageProps<P>) {
  const { id } = useParams<{ id: string }>()
  const { content, isLoading, isSaving, error, save } = useProjectSection(Number(id), sectionName)

  const [forms, setForms] = React.useState<Record<string, Record<string, string>>>(() =>
    emptyForms(tabs)
  )
  const [activePillar, setActivePillar] = React.useState<string>(tabs[0]?.pillar ?? "")
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    if (!isLoading) {
      setForms(buildFormsFromContent(content, tabs))
    }
  }, [isLoading, content, tabs])

  async function savePillar(pillar: string) {
    setSaveError(null)
    const payload: ProjectSectionContent = {
      pillar,
      ...forms[pillar],
    }
    try {
      await save(payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setSaveError("Something went wrong. Please try again.")
    }
  }

  function setField(pillar: string, key: string, value: string) {
    setForms((prev) => ({
      ...prev,
      [pillar]: { ...prev[pillar], [key]: value },
    }))
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activePillar} onValueChange={setActivePillar}>
            <TabsList variant="line" className="mb-4 w-full flex-wrap justify-start gap-1">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.pillar} value={tab.pillar}>
                  {tab.tabLabel}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.pillar} value={tab.pillar} className="space-y-5 pt-1">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    void savePillar(tab.pillar)
                  }}
                  className="space-y-5"
                >
                  {tab.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={`${tab.pillar}-${field.key}`}>{field.label}</Label>
                      <textarea
                        id={`${tab.pillar}-${field.key}`}
                        className={textareaClass}
                        value={forms[tab.pillar]?.[field.key] ?? ""}
                        onChange={(e) => setField(tab.pillar, field.key, e.target.value)}
                        disabled={isLoading || isSaving}
                      />
                    </div>
                  ))}

                  <Separator />

                  <div className="flex items-center justify-end">
                    <Button type="submit" disabled={isSaving || isLoading}>
                      {isSaving ? "Saving…" : "Save"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            ))}
          </Tabs>

          {aiPillarSection ? (
            <AiSuggestPanel
              key={activePillar}
              projectId={Number(id)}
              section={aiPillarSection}
              pillar={activePillar}
            />
          ) : null}

          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
          {saveError ? <p className="mt-2 text-sm text-destructive">{saveError}</p> : null}
          {saved ? <p className="mt-2 text-sm text-green-600">Saved successfully.</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}
