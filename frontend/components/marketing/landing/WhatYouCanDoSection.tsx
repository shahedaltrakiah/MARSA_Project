"use client"

import { Brain, LayoutGrid, Lightbulb, LineChart, ListChecks } from "lucide-react"

import FeatureCard from "@/components/marketing/ux/FeatureCard"
import SectionWrapper from "@/components/marketing/ux/SectionWrapper"

export default function WhatYouCanDoSection() {
  const features = [
    {
      icon: <Lightbulb className="size-4" />,
      title: "Build your idea",
      description: "Clarify the problem, customer, and value proposition with guided prompts.",
    },
    {
      icon: <LayoutGrid className="size-4" />,
      title: "Structure your business model",
      description: "Map pricing, channels, costs, and key activities in a clean, connected framework.",
    },
    {
      icon: <LineChart className="size-4" />,
      title: "Plan your finances",
      description: "Track burn, runway, and targets — and keep assumptions explicit.",
    },
    {
      icon: <ListChecks className="size-4" />,
      title: "Manage your tasks",
      description: "Turn strategy into weekly execution so your plan becomes progress.",
    },
    {
      icon: <Brain className="size-4" />,
      title: "Get AI recommendations",
      description: "Context-aware suggestions that reduce decision fatigue and keep momentum high.",
    },
    {
      icon: <LayoutGrid className="size-4" />,
      title: "Align your team",
      description: "Keep decisions, assumptions, and next actions shared — so everyone executes the same plan.",
    },
  ]

  return (
    <SectionWrapper
      eyebrow="What you can do"
      title="A clear workflow for founders."
      description="Each feature answers a specific question — so you always know what to do next."
    >
      <div className="relative grid gap-8 lg:grid-cols-12">
        {/* Inspired by image 1: funnel rings */}
        <div className="relative hidden lg:col-span-6 lg:block">
          <div aria-hidden className="absolute -left-12 top-6 h-[380px] w-[380px] rounded-full border-[18px] border-[color-mix(in_oklab,var(--primary)_22%,transparent)]" />
          <div aria-hidden className="absolute -left-2 top-16 h-[330px] w-[330px] rounded-full border-[16px] border-[color-mix(in_oklab,var(--primary)_14%,transparent)]" />
          <div aria-hidden className="absolute left-20 top-32 h-[240px] w-[240px] rounded-full border-[14px] border-[color-mix(in_oklab,var(--secondary)_26%,transparent)]" />
          <div aria-hidden className="absolute left-44 top-50 h-[170px] w-[170px] rounded-full border-[12px] border-[color-mix(in_oklab,var(--secondary)_18%,transparent)]" />

          {/* icon tiles riding the arcs (like the reference) */}
          <div className="absolute left-2 top-10 flex items-center gap-4">
            {features.slice(0, 5).map((f, idx) => (
              <div
                key={f.title}
                className={[
                  "inline-flex size-12 items-center justify-center rounded-2xl border bg-background/70 shadow-sm backdrop-blur",
                  "transition will-change-transform hover:-translate-y-0.5",
                  idx % 2 === 0
                    ? "border-[color-mix(in_oklab,var(--primary)_22%,transparent)]"
                    : "border-[color-mix(in_oklab,var(--secondary)_26%,transparent)]",
                ].join(" ")}
              >
                {f.icon}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f, idx) => (
              <FeatureCard key={f.title} {...f} index={idx} />
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}

