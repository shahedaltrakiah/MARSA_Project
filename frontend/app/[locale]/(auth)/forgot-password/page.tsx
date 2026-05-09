"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { isAxiosError } from "axios"

import AuthSplitLayout from "@/components/auth/AuthSplitLayout"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/components/utils"
import { getFirstError, isValidationError } from "@/lib/api"
import api from "@/lib/api"
import { Link } from "@/i18n/navigation"

type ForgotPasswordSuccess = {
  message: string
  dev_reset_url?: string
}

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth")
  const [email, setEmail] = React.useState("")
  const [isSending, setIsSending] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [devUrl, setDevUrl] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSending(true)
    try {
      const res = await api.post<ForgotPasswordSuccess>("/auth/forgot-password", { email })
      setSuccess(true)
      setDevUrl(res.data.dev_reset_url ?? null)
    } catch (err) {
      if (isValidationError(err)) {
        setError(getFirstError(err, "email") ?? t("genericError"))
      } else if (isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined
        setError(data?.message ?? t("genericError"))
      } else {
        setError(t("genericError"))
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <AuthSplitLayout
      title={t("forgotPasswordPageTitle")}
      subtitle={t("forgotPasswordPageSubtitle")}
      bottom={
        <div className="text-center text-sm text-muted-foreground">
          {t("forgotRemembered")}{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            {t("forgotBackToLogin")}
          </Link>
        </div>
      }
    >
      <Card className="rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">{t("forgotPasswordCardTitle")}</CardTitle>
          <CardDescription>{t("forgotPasswordCardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-green-600 dark:text-green-500">{t("forgotSuccess")}</p>
              {devUrl ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-sm">
                  <p className="mb-2 text-muted-foreground">{t("forgotDevLinkLabel")}</p>
                  <a
                    href={devUrl}
                    className="break-all font-medium text-primary underline underline-offset-4 hover:text-primary/90"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {devUrl}
                  </a>
                </div>
              ) : null}
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline" }), "inline-flex w-full justify-center")}
              >
                {t("forgotBackToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSending}
                  autoComplete="email"
                  className="transition-shadow focus-visible:ring-4 focus-visible:ring-ring/30"
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button
                type="submit"
                className="w-full transition-transform hover:-translate-y-0.5"
                disabled={isSending}
              >
                {isSending ? t("sendingReset") : t("sendResetLink")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthSplitLayout>
  )
}
