"use client"

import * as React from "react"

import api, { isValidationError } from "@/lib/api"
import type { ApiResponse } from "@/types/api"
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
  const { user } = useAuth()
  const [form, setForm] = React.useState<PasswordForm>({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  async function onChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (form.password.length < 8) {
      setError("New password must be at least 8 characters.")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("New password and confirm password must match.")
      return
    }

    setIsSaving(true)
    try {
      await api.post<ApiResponse<unknown>>("/auth/change-password", {
        current_password: form.currentPassword,
        password: form.password,
        password_confirmation: form.confirmPassword,
      })
      setSuccess("Password updated.")
      setForm({ currentPassword: "", password: "", confirmPassword: "" })
    } catch (e) {
      if (isValidationError(e)) {
        const errors = e.response?.data.errors
        const first = errors ? Object.values(errors)[0]?.[0] : undefined
        setError(first ?? "Something went wrong.")
      } else {
        setError("Something went wrong.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account info</CardTitle>
          <CardDescription>Your account details (read-only).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <div className="rounded-md border bg-background px-3 py-2 text-sm">
              {user?.name ?? "—"}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="rounded-md border bg-background px-3 py-2 text-sm">
              {user?.email ?? "—"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
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
              <Label htmlFor="confirmPassword">Confirm new password</Label>
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

            {success ? <p className="text-sm text-foreground">{success}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex items-center justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

