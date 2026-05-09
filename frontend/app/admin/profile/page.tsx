"use client"

import * as React from "react"
import Link from "next/link"

import { useAdminI18n } from "@/components/admin/AdminI18nContext"
import api, { isValidationError } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import type { ApiResponse, User } from "@/types/api"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type PasswordForm = {
  currentPassword: string
  password: string
  confirmPassword: string
}

export default function AdminProfilePage() {
  const { user, updateUser } = useAuth()
  const { t } = useAdminI18n()

  const [editingName, setEditingName] = React.useState(false)
  const [nameDraft, setNameDraft] = React.useState("")
  const [nameError, setNameError] = React.useState<string | null>(null)
  const [nameSuccess, setNameSuccess] = React.useState<string | null>(null)
  const [isSavingName, setIsSavingName] = React.useState(false)

  const [form, setForm] = React.useState<PasswordForm>({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = React.useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = React.useState<string | null>(null)
  const [isSavingPassword, setIsSavingPassword] = React.useState(false)

  React.useEffect(() => {
    if (!nameSuccess) return
    const id = window.setTimeout(() => setNameSuccess(null), 3000)
    return () => window.clearTimeout(id)
  }, [nameSuccess])

  function startEditName() {
    setNameDraft(user?.name ?? "")
    setNameError(null)
    setEditingName(true)
  }

  function cancelEditName() {
    setEditingName(false)
    setNameError(null)
    setNameDraft("")
  }

  async function onSaveName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNameError(null)
    const trimmed = nameDraft.trim()
    if (trimmed.length < 2) {
      setNameError(t.errNameShort)
      return
    }

    setIsSavingName(true)
    try {
      const res = await api.patch<{ user: User }>("/auth/me", { name: trimmed })
      const next = res.data.user
      if (!next) {
        window.location.reload()
        return
      }
      updateUser(next)
      setEditingName(false)
      setNameSuccess(t.successNameSaved)
    } catch (e) {
      if (isValidationError(e)) {
        const errors = e.response?.data.errors
        const first = errors ? (Object.values(errors).flat()[0] as string | undefined) : undefined
        setNameError(first ?? t.errGeneric)
      } else {
        setNameError(t.errGeneric)
      }
    } finally {
      setIsSavingName(false)
    }
  }

  async function onChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (form.password.length < 8) {
      setPasswordError(t.errPasswordShort)
      return
    }
    if (form.password !== form.confirmPassword) {
      setPasswordError(t.errPasswordMismatch)
      return
    }

    setIsSavingPassword(true)
    try {
      await api.post<ApiResponse<unknown>>("/auth/change-password", {
        current_password: form.currentPassword,
        password: form.password,
        password_confirmation: form.confirmPassword,
      })
      setPasswordSuccess(t.successPasswordChanged)
      setForm({ currentPassword: "", password: "", confirmPassword: "" })
    } catch (e) {
      if (isValidationError(e)) {
        const errors = e.response?.data.errors
        const first = errors ? Object.values(errors)[0]?.[0] : undefined
        setPasswordError(first ?? t.errGeneric)
      } else {
        setPasswordError(t.errGeneric)
      }
    } finally {
      setIsSavingPassword(false)
    }
  }

  const roleLabel =
    user?.role === "super_admin"
      ? "super_admin"
      : user?.role === "admin"
        ? "admin"
        : user?.role ?? "—"

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/admin/dashboard"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← {t.navDashboard}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{t.profilePageTitle}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.profilePageSubtitle}</p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
          <div>
            <CardTitle>{t.profileIdentityCard}</CardTitle>
            <CardDescription>{t.labelEmailReadonly}</CardDescription>
          </div>
          {!editingName ? (
            <Button type="button" variant="outline" size="sm" onClick={startEditName}>
              {t.edit}
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {nameSuccess ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{nameSuccess}</p> : null}

          {!editingName ? (
            <>
              <div className="space-y-2">
                <Label>{t.labelDisplayName}</Label>
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">{user?.name ?? "—"}</div>
              </div>
              <div className="space-y-2">
                <Label>{t.labelEmailReadonly}</Label>
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">{user?.email ?? "—"}</div>
              </div>
              <div className="space-y-2">
                <Label>{t.labelRole}</Label>
                <div className="rounded-md border bg-primary/5 px-3 py-2 text-sm font-medium capitalize text-primary">
                  {roleLabel}
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={onSaveName} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-profile-name">{t.labelDisplayName}</Label>
                <Input
                  id="admin-profile-name"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  minLength={2}
                  required
                  disabled={isSavingName}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.labelEmailReadonly}</Label>
                <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  {user?.email ?? "—"}
                </div>
              </div>

              {nameError ? <p className="text-sm text-destructive">{nameError}</p> : null}

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" disabled={isSavingName} onClick={cancelEditName}>
                  {t.cancel}
                </Button>
                <Button type="submit" size="sm" disabled={isSavingName}>
                  {isSavingName ? t.saving : t.btnSaveDisplayName}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>{t.profilePasswordCard}</CardTitle>
          <CardDescription>{t.profilePageSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-current-password">{t.labelCurrentPassword}</Label>
              <Input
                id="admin-current-password"
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-new-password">{t.labelNewPassword}</Label>
              <Input
                id="admin-new-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-confirm-password">{t.labelConfirmNewPassword}</Label>
              <Input
                id="admin-confirm-password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>

            <Separator />

            {passwordSuccess ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">{passwordSuccess}</p>
            ) : null}
            {passwordError ? <p className="text-sm text-destructive">{passwordError}</p> : null}

            <div className="flex items-center justify-end">
              <Button type="submit" disabled={isSavingPassword}>
                {isSavingPassword ? t.saving : t.btnChangePassword}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
