"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type ContactForm = {
  name: string
  email: string
  message: string
}

export default function ContactPage() {
  const [form, setForm] = React.useState<ContactForm>({ name: "", email: "", message: "" })
  const [isSending, setIsSending] = React.useState(false)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSending(true)
    try {
      console.log(form)
    } finally {
      window.setTimeout(() => setIsSending(false), 500)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="max-w-2xl">
        <h1 className="text-balance font-[var(--font-heading)] text-3xl font-semibold tracking-tight">
          Contact
        </h1>
        <p className="mt-3 text-muted-foreground">
          Questions, partnerships, or feedback — send a message and we’ll get back to you.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
            <CardDescription>We typically respond within 1–2 business days.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                  required
                  disabled={isSending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@company.com"
                  required
                  disabled={isSending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Tell us what you’re building, and how we can help."
                  className="min-h-36 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  disabled={isSending}
                />
              </div>

              <Separator />

              <Button type="submit" className="w-full" disabled={isSending}>
                {isSending ? "Sending…" : "Send"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>Prefer email? Reach us directly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-xl border bg-background p-4">
              <div className="text-xs text-muted-foreground">General</div>
              <div className="mt-1 font-medium">support@marsa.app</div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <div className="text-xs text-muted-foreground">Partnerships</div>
              <div className="mt-1 font-medium">partners@marsa.app</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

