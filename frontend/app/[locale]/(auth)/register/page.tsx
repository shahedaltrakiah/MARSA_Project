"use client"

import * as React from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"

import AuthSplitLayout from "@/components/auth/AuthSplitLayout"
import { WelcomeFlashDialog } from "@/components/auth/WelcomeFlashDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { Link } from "@/i18n/navigation"
import api, { isValidationError } from "@/lib/api"

function RegisterForm() {
  const t = useTranslations("Auth")
  const router = useRouter()
  const { register } = useAuth()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get("invite")

  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = React.useState(false)
  const [welcomeOpen, setWelcomeOpen] = React.useState(false)
  const [inviteProjectName, setInviteProjectName] = React.useState<string | null>(null)
  const [inviteEmailLocked, setInviteEmailLocked] = React.useState(false)
  const [invitePreviewError, setInvitePreviewError] = React.useState(false)

  React.useEffect(() => {
    if (!inviteToken) {
      setInviteProjectName(null)
      setInviteEmailLocked(false)
      setInvitePreviewError(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await api.get<{
          data: { project_name: string; email: string }
        }>(`/invitations/${encodeURIComponent(inviteToken)}`)
        if (cancelled) return
        setInviteProjectName(res.data.data.project_name)
        setEmail(res.data.data.email)
        setInviteEmailLocked(true)
        setInvitePreviewError(false)
      } catch {
        if (cancelled) return
        setInvitePreviewError(true)
        setInviteProjectName(null)
        setInviteEmailLocked(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [inviteToken])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match." })
      return
    }

    setIsLoading(true)
    try {
      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ")
      const result = await register(fullName, email, password, inviteToken)
      if (result.joinedProjectId !== undefined) {
        router.push(`/app/projects/${result.joinedProjectId}/progress`)
        return
      }
      setWelcomeOpen(true)
    } catch (err) {
      if (isValidationError(err)) {
        const errs = err.response?.data.errors ?? {}
        const flat: Record<string, string> = {}
        for (const [field, messages] of Object.entries(errs)) {
          if (messages[0]) flat[field] = messages[0]
        }
        setFieldErrors(flat)
      } else {
        setFieldErrors({ general: "Something went wrong. Please try again." })
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
        title={t("welcomeFlashTitleNew")}
        message={t("welcomeNewFlash")}
        continueLabel={t("welcomeFlashContinue")}
      />
      <AuthSplitLayout
        title="Build with structure."
        subtitle="Create your MARSA account and turn your idea into a plan you can execute."
        bottom={
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Login
            </Link>
          </div>
        }
      >
        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Create account</CardTitle>
            <CardDescription>Start with the basics — you can fill details later.</CardDescription>
            {inviteProjectName && (
              <p className="text-sm font-medium text-primary pt-1">{t("inviteBanner", { project: inviteProjectName })}</p>
            )}
            {invitePreviewError && inviteToken && (
              <p className="text-sm text-muted-foreground pt-1">{t("inviteInvalid")}</p>
            )}
            {inviteEmailLocked && (
              <p className="text-xs text-muted-foreground pt-1">{t("inviteEmailLocked")}</p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="transition-shadow focus-visible:ring-4 focus-visible:ring-ring/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="transition-shadow focus-visible:ring-4 focus-visible:ring-ring/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || inviteEmailLocked}
                  className="transition-shadow focus-visible:ring-4 focus-visible:ring-ring/30"
                />
                {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                    className="pr-11 transition-shadow focus-visible:ring-4 focus-visible:ring-ring/30"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
                {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-11 transition-shadow focus-visible:ring-4 focus-visible:ring-ring/30"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              {fieldErrors.general && <p className="text-sm text-destructive">{fieldErrors.general}</p>}

              <Button type="submit" className="w-full transition-transform hover:-translate-y-0.5" disabled={isLoading}>
                {isLoading ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </AuthSplitLayout>
    </>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <AuthSplitLayout
          title="Build with structure."
          subtitle="Create your MARSA account and turn your idea into a plan you can execute."
          bottom={null}
        >
          <Card className="rounded-3xl shadow-sm">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">Loading…</CardContent>
          </Card>
        </AuthSplitLayout>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
