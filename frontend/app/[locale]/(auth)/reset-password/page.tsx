"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Eye, EyeOff } from "lucide-react"
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

function ResetPasswordForm() {
  const t = useTranslations("Auth")
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const emailParam = searchParams.get("email")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const paramsInvalid = !token || !emailParam

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!token || !emailParam) return
    setError(null)

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"))
      return
    }

    setIsSubmitting(true)
    try {
      await api.post("/auth/reset-password", {
        token,
        email: emailParam,
        password,
        password_confirmation: confirmPassword,
      })
      setSuccess(true)
    } catch (err) {
      if (isValidationError(err)) {
        setError(
          getFirstError(err, "email") ??
            getFirstError(err, "token") ??
            getFirstError(err, "password") ??
            getFirstError(err, "password_confirmation") ??
            t("genericError")
        )
      } else if (isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined
        setError(data?.message ?? t("genericError"))
      } else {
        setError(t("genericError"))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (paramsInvalid) {
    return (
      <AuthSplitLayout
        title={t("resetPasswordPageTitle")}
        subtitle={t("resetPasswordPageSubtitle")}
        bottom={
          <div className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-foreground hover:underline">
              {t("forgotBackToLogin")}
            </Link>
          </div>
        }
      >
        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">{t("resetPasswordCardTitle")}</CardTitle>
            <CardDescription className="text-destructive">{t("invalidResetLink")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/forgot-password"
              className={cn(buttonVariants({ variant: "secondary" }), "inline-flex w-full justify-center")}
            >
              {t("requestNewResetLink")}
            </Link>
          </CardContent>
        </Card>
      </AuthSplitLayout>
    )
  }

  return (
    <AuthSplitLayout
      title={t("resetPasswordPageTitle")}
      subtitle={t("resetPasswordPageSubtitle")}
      bottom={
        <div className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-foreground hover:underline">
            {t("forgotBackToLogin")}
          </Link>
        </div>
      }
    >
      <Card className="rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">{t("resetPasswordCardTitle")}</CardTitle>
          <CardDescription>{t("resetPasswordCardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-green-600 dark:text-green-500">{t("resetSuccess")}</p>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "secondary" }), "inline-flex w-full justify-center")}
              >
                {t("resetGoToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">{t("email")}</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={emailParam}
                  disabled
                  readOnly
                  className="bg-muted/60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">{t("newPasswordLabel")}</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    className="pr-11 transition-shadow focus-visible:ring-4 focus-visible:ring-ring/30"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute end-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t("confirmNewPasswordLabel")}</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    className="pr-11 transition-shadow focus-visible:ring-4 focus-visible:ring-ring/30"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute end-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    disabled={isSubmitting}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button
                type="submit"
                className="w-full transition-transform hover:-translate-y-0.5"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("resettingPassword") : t("resetSubmit")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthSplitLayout>
  )
}

function ResetPasswordFallback() {
  return (
    <div className="mx-auto flex min-h-[40vh] max-w-lg items-center justify-center px-4">
      <div className="h-10 w-full max-w-md animate-pulse rounded-xl bg-muted" aria-hidden />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
