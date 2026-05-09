"use client"

import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/components/utils"

export type WelcomeFlashDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  continueLabel: string
}

/**
 * In-app welcome message after auth — matches MARSA card/popover styling (not `window.alert`).
 */
export function WelcomeFlashDialog({
  open,
  onOpenChange,
  title,
  message,
  continueLabel,
}: WelcomeFlashDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className="fixed inset-0 z-[400] bg-background/60 backdrop-blur-sm transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
        />
        <Dialog.Popup
          className={cn(
            "fixed start-1/2 top-1/2 z-[401] w-[min(calc(100vw-2rem),24rem)] -translate-x-1/2 -translate-y-1/2",
            "rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10",
            "outline-none data-[ending-style]:scale-95 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
            "data-[open]:transition-[opacity,transform] data-[open]:duration-200 data-[closed]:duration-150"
          )}
        >
          <Dialog.Title className="font-[var(--font-heading)] text-xl font-semibold tracking-tight text-foreground">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {message}
          </Dialog.Description>
          <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Dialog.Close
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
                "w-full sm:w-auto sm:min-w-[9rem]"
              )}
            >
              {continueLabel}
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
