import type { ReachPillar } from "@/types/api"

export type PillarTabDef<P extends string> = {
  pillar: P
  tabLabel: string
  fields: { key: string; label: string }[]
}

export const REACH_TABS: PillarTabDef<ReachPillar>[] = [
  {
    pillar: "business_model",
    tabLabel: "Business Model",
    fields: [
      { key: "revenue_streams", label: "Revenue Streams" },
      { key: "pricing_model", label: "Pricing Model" },
      { key: "cost_structure", label: "Cost Structure" },
      { key: "key_activities", label: "Key Activities" },
    ],
  },
  {
    pillar: "branding",
    tabLabel: "Branding",
    fields: [
      { key: "brand_identity", label: "Brand Identity" },
      { key: "brand_voice", label: "Brand Voice" },
      { key: "visual_identity", label: "Visual Identity" },
      { key: "brand_positioning", label: "Brand Positioning" },
    ],
  },
  {
    pillar: "marketing",
    tabLabel: "Marketing",
    fields: [
      { key: "marketing_channels", label: "Marketing Channels" },
      { key: "content_strategy", label: "Content Strategy" },
      { key: "campaigns", label: "Campaigns" },
      { key: "seo_strategy", label: "SEO Strategy" },
    ],
  },
  {
    pillar: "sales",
    tabLabel: "Sales",
    fields: [
      { key: "sales_process", label: "Sales Process" },
      { key: "sales_team", label: "Sales Team" },
      { key: "pipeline", label: "Pipeline" },
      { key: "conversion_tactics", label: "Conversion Tactics" },
    ],
  },
]
