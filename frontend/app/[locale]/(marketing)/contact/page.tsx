"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { AlertCircle, CheckCircle2, Clock, Mail, MessageSquare, Send, User } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ContactForm = {
  name: string
  email: string
  message: string
}

type FormFeedback = { type: "idle" } | { type: "success" } | { type: "error" }

export default function ContactPage() {
  const t = useTranslations("Contact")
  const [form, setForm] = React.useState<ContactForm>({ name: "", email: "", message: "" })
  const [isSending, setIsSending] = React.useState(false)
  const [feedback, setFeedback] = React.useState<FormFeedback>({ type: "idle" })

  function patchForm(patch: Partial<ContactForm>) {
    setFeedback({ type: "idle" })
    setForm((p) => ({ ...p, ...patch }))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFeedback({ type: "idle" })
    setIsSending(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      setFeedback({ type: "success" })
      setForm({ name: "", email: "", message: "" })
    } catch {
      setFeedback({ type: "error" })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="max-w-2xl">
        <Badge variant="secondary">{t("badge")}</Badge>
        <h1 className="mt-4 text-balance font-[var(--font-heading)] text-4xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">{t("description")}</p>
      </div>

      <div className="mt-10 w-full">
        <Card className="w-full border-white/10 bg-card/70 shadow-sm backdrop-blur transition-shadow hover:shadow-md">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary leading-none text-white shadow-sm [&_svg]:block">
                <Send className="size-5" />
              </span>
              {t("sendTitle")}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 ps-[3.25rem] text-sm">
              <Clock className="size-3.5 shrink-0 opacity-80" aria-hidden />
              {t("sendHint")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={onSubmit} className="space-y-5">
              {feedback.type === "success" && (
                <Alert variant="success" className="animate-in fade-in-0 slide-in-from-top-1 duration-200">
                  <CheckCircle2 className="text-secondary" aria-hidden />
                  <div className="min-w-0 space-y-1">
                    <AlertTitle>{t("successTitle")}</AlertTitle>
                    <AlertDescription>{t("successBody")}</AlertDescription>
                  </div>
                </Alert>
              )}
              {feedback.type === "error" && (
                <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-top-1 duration-200">
                  <AlertCircle aria-hidden />
                  <div className="min-w-0 space-y-1">
                    <AlertTitle>{t("errorTitle")}</AlertTitle>
                    <AlertDescription>{t("errorBody")}</AlertDescription>
                  </div>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {t("name")}
                </Label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => patchForm({ name: e.target.value })}
                    placeholder={t("namePlaceholder")}
                    required
                    disabled={isSending}
                    className="h-10 rounded-xl border-white/10 bg-background/80 ps-10 shadow-none md:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t("email")}
                </Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => patchForm({ email: e.target.value })}
                    placeholder={t("emailPlaceholder")}
                    required
                    disabled={isSending}
                    className="h-10 rounded-xl border-white/10 bg-background/80 ps-10 shadow-none md:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">
                  {t("message")}
                </Label>
                <div className="relative">
                  <MessageSquare
                    className="pointer-events-none absolute start-3 top-3 size-4 text-muted-foreground"
                    aria-hidden
                  />
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => patchForm({ message: e.target.value })}
                    placeholder={t("messagePlaceholder")}
                    className="min-h-36 w-full resize-y rounded-xl border border-input bg-background/80 px-3 py-2.5 ps-10 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                    required
                    disabled={isSending}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-2 w-full rounded-xl shadow-sm"
                disabled={isSending}
              >
                {isSending ? (
                  t("submitting")
                ) : (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Send className="size-4" />
                    {t("submit")}
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
