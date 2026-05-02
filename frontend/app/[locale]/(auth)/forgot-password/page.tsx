"use client"

import * as React from "react"
import Link from "next/link"

import AuthSplitLayout from "@/components/auth/AuthSplitLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [isSending, setIsSending] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSending(true)
    try {
      console.log({ email })
      setSent(true)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <AuthSplitLayout
      title="Reset your password."
      subtitle="Enter your email and we’ll send a reset link. (UI only — wiring comes later.)"
      bottom={
        <div className="text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Back to login
          </Link>
        </div>
      }
    >
      <Card className="rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Forgot password</CardTitle>
          <CardDescription>We’ll email you a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSending}
                className="transition-shadow focus-visible:ring-4 focus-visible:ring-ring/30"
              />
            </div>

            <Button type="submit" className="w-full transition-transform hover:-translate-y-0.5" disabled={isSending}>
              {isSending ? "Sending…" : "Send reset link"}
            </Button>

            {sent ? <p className="text-sm text-muted-foreground">If an account exists, a reset link was sent.</p> : null}
          </form>
        </CardContent>
      </Card>
    </AuthSplitLayout>
  )
}

