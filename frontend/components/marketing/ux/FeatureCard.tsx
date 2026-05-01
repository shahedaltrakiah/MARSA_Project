"use client"

import * as React from "react"

import { cn } from "@/components/utils"
import { HoverCard, Reveal } from "@/components/marketing/motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type FeatureCardProps = {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
  index?: number
}

export default function FeatureCard({
  icon,
  title,
  description,
  className,
  index = 0,
}: FeatureCardProps) {
  return (
    <Reveal delay={index * 0.03}>
      <HoverCard>
        <Card
          className={cn(
            "h-full rounded-3xl bg-card/60 shadow-sm backdrop-blur transition-shadow hover:shadow-md",
            className
          )}
        >
          <CardHeader>
            <div className="inline-flex size-9 items-center justify-center rounded-2xl border bg-background">
              {icon}
            </div>
            <CardTitle className="mt-3 text-base">{title}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
        </Card>
      </HoverCard>
    </Reveal>
  )
}

