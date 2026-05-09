"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Eye, EyeOff } from "lucide-react"

import AuthSplitLayout from "@/components/auth/AuthSplitLayout"
import { WelcomeFlashDialog } from "@/components/auth/WelcomeFlashDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { getFirstError, isValidationError } from "@/lib/api"
import { Link } from "@/i18n/navigation"

export default function LoginPage() {
  const t = useTranslations("Auth")
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [welcomeOpen, setWelcomeOpen] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await login(email, password)
      setWelcomeOpen(true)
    } catch (err) {
      if (isValidationError(err)) {
        setError(
          getFirstError(err, "email") ?? getFirstError(err, "password") ?? t("invalidCredentials")
        )
      } else {
        setError(t("genericError"))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    <WelcomeFlashDialog
      open={welcomeOpen}
      onOpenChange={(next) => {
        setWelcomeOpen(next)
        if (!next) router.push("/app/dashboard")
      }}
      title={t("welcomeFlashTitleBack")}
      message={t("welcomeBackFlash")}
      continueLabel={t("welcomeFlashContinue")}
    />
    <AuthSplitLayout
      title={t("loginTitle")}
      subtitle={t("loginSubtitle")}
      bottom={
        <div className="text-center text-sm text-muted-foreground">
          {t("registerPrompt")}{" "}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            {t("registerCta")}
          </Link>
        </div>
      }
    >
      <Card className="rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">{t("loginCardTitle")}</CardTitle>
          <CardDescription>{t("loginCardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="transition-shadow focus-visible:ring-4 focus-visible:ring-ring/30"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-11 transition-shadow focus-visible:ring-4 focus-visible:ring-ring/30"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute end-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full transition-transform hover:-translate-y-0.5" disabled={isLoading}>
              {isLoading ? t("signingIn") : t("signIn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthSplitLayout>
    </>
  )
}
