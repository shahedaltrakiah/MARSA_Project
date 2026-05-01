"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { CollaboratorRole, ProjectCollaborator, User } from "@/types/api"

interface Props {
  collaborators: ProjectCollaborator[]
  owner: User
  onInvite: (email: string, role: CollaboratorRole) => Promise<void>
  onRemove: (userId: number) => Promise<void>
}

export default function CollaboratorsPanel({ collaborators, owner, onInvite, onRemove }: Props) {
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<CollaboratorRole>("viewer")
  const [isInviting, setIsInviting] = React.useState(false)
  const [inviteError, setInviteError] = React.useState<string | null>(null)
  const [removingId, setRemovingId] = React.useState<number | null>(null)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteError(null)
    setIsInviting(true)
    try {
      await onInvite(email, role)
      setEmail("")
    } catch {
      setInviteError("Could not invite collaborator. Check the email and try again.")
    } finally {
      setIsInviting(false)
    }
  }

  async function handleRemove(userId: number) {
    setRemovingId(userId)
    try {
      await onRemove(userId)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{owner.name}</span>
          <Badge variant="secondary">Owner</Badge>
        </div>

        {collaborators.map((c) => (
          <div key={c.id} className="flex items-center justify-between text-sm">
            <div className="min-w-0">
              <div className="truncate font-medium">{c.name}</div>
              <div className="truncate text-xs text-muted-foreground">{c.email}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{c.role}</Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={removingId === c.id}
                onClick={() => void handleRemove(c.id)}
                aria-label={`Remove ${c.name}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <form onSubmit={(e) => void handleInvite(e)} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="invite-email">Invite by email</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isInviting}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="invite-role">Role</Label>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value as CollaboratorRole)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
        </div>
        {inviteError && <p className="text-sm text-destructive">{inviteError}</p>}
        <Button type="submit" size="sm" disabled={isInviting}>
          {isInviting ? "Inviting…" : "Invite"}
        </Button>
      </form>
    </div>
  )
}
