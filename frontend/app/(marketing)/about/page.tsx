import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">About MARSA</h1>
        <p className="mt-3 text-muted-foreground">
          MARSA is a structured workspace for entrepreneurs — designed to keep strategy, execution, and notes in one
          calm place.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clarity</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            A consistent UI shell that helps you think clearly and move faster.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Structure</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Guided sections aligned to an entrepreneur’s workflow.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Momentum</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Notes and next steps are always within reach.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

