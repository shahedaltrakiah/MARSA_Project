export type AdminRole = 'user' | 'admin' | 'super_admin'

export interface AdminUser {
  id: number
  name: string
  email: string
  role: AdminRole
  project_count: number
  created_at: string
}

export interface AdminUserDetail {
  id: number
  name: string
  email: string
  role: AdminRole
  created_at: string
  startup_profile: Record<string, string | null> | null
  projects: { id: number; name: string; created_at: string }[]
}

export interface SiteSettingsData {
  logo_url: string | null
  primary_color: string
  secondary_color: string
}

export interface HeroBlock {
  badge: string
  headline_start: string
  headline_end: string
  subtitle: string
  cta_primary: string
  cta_secondary: string
}

export interface FeatureItem {
  title: string
  description: string
  bullets: string[]
}

export interface PricingTier {
  name: string
  price: string
  description: string
  features: string[]
}

export interface SiteData {
  settings: SiteSettingsData
  blocks: {
    hero: { en: HeroBlock; ar: HeroBlock }
    features: { en: FeatureItem[]; ar: FeatureItem[] }
    pricing_free: { en: PricingTier; ar: PricingTier }
    pricing_pro: { en: PricingTier; ar: PricingTier }
    pricing_team: { en: PricingTier; ar: PricingTier }
  }
}
