"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import api, { isValidationError } from "@/lib/api"
import type { ApiResponse, User } from "@/types/api"
import { useAuth } from "@/hooks/useAuth"

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

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuth()
  const t = useTranslations("Workspace.profile")
  const tCommon = useTranslations("Workspace.common")

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
      setNameError(t("nameMin"))
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
      setNameSuccess(t("nameUpdated"))
    } catch (e) {
      if (isValidationError(e)) {
        const errors = e.response?.data.errors
        const first = errors ? (Object.values(errors).flat()[0] as string | undefined) : undefined
        setNameError(first ?? tCommon("genericError"))
      } else {
        setNameError(tCommon("genericError"))
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
      setPasswordError(t("passwordMin"))
      return
    }
    if (form.password !== form.confirmPassword) {
      setPasswordError(t("passwordMismatch"))
      return
    }

    setIsSavingPassword(true)
    try {
      await api.post<ApiResponse<unknown>>("/auth/change-password", {
        current_password: form.currentPassword,
        password: form.password,
        password_confirmation: form.confirmPassword,
      })
      setPasswordSuccess(t("passwordUpdated"))
      setForm({ currentPassword: "", password: "", confirmPassword: "" })
    } catch (e) {
      if (isValidationError(e)) {
        const errors = e.response?.data.errors
        const first = errors ? Object.values(errors)[0]?.[0] : undefined
        setPasswordError(first ?? tCommon("genericError"))
      } else {
        setPasswordError(tCommon("genericError"))
      }
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
          <div>
            <CardTitle>{t("profileCardTitle")}</CardTitle>
            <CardDescription>{t("profileCardDesc")}</CardDescription>
          </div>
          {!editingName ? (
            <Button type="button" variant="outline" size="sm" onClick={startEditName}>
              {tCommon("edit")}
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {nameSuccess ? <p className="text-sm text-green-600">{nameSuccess}</p> : null}

          {!editingName ? (
            <>
              <div className="space-y-2">
                <Label>{tCommon("name")}</Label>
                <div className="rounded-md border bg-background px-3 py-2 text-sm">
                  {user?.name ?? "—"}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{tCommon("email")}</Label>
                <div className="rounded-md border bg-background px-3 py-2 text-sm">
                  {user?.email ?? "—"}
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={onSaveName} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">{tCommon("name")}</Label>
                <Input
                  id="profile-name"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  minLength={2}
                  required
                  disabled={isSavingName}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label>{tCommon("email")}</Label>
                <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  {user?.email ?? "—"}
                </div>
              </div>

              {nameError ? <p className="text-sm text-destructive">{nameError}</p> : null}

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" disabled={isSavingName} onClick={cancelEditName}>
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" size="sm" disabled={isSavingName}>
                  {isSavingName ? tCommon("saving") : t("saveName")}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("changePassword")}</CardTitle>
          <CardDescription>{t("changePasswordDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
              <Input
                id="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("newPassword")}</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                minLength={8}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                minLength={8}
                required
              />
            </div>

            <Separator />

            {passwordSuccess ? <p className="text-sm text-foreground">{passwordSuccess}</p> : null}
            {passwordError ? <p className="text-sm text-destructive">{passwordError}</p> : null}

            <div className="flex items-center justify-end">
              <Button type="submit" disabled={isSavingPassword}>
                {isSavingPassword ? tCommon("saving") : t("updatePassword")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
