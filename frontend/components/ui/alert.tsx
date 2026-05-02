import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/components/utils"

const alertVariants = cva(
  "flex gap-3 rounded-xl border p-4 text-sm [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-border bg-muted/60 text-foreground",
        success:
          "border-[color-mix(in_oklab,var(--secondary)_40%,var(--border))] bg-[color-mix(in_oklab,var(--secondary)_10%,var(--background))] text-foreground",
        destructive:
          "border-destructive/35 bg-destructive/10 text-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("font-semibold leading-snug tracking-tight", className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-sm leading-relaxed text-muted-foreground", className)} {...props} />
}

export { Alert, AlertDescription, alertVariants, AlertTitle }
