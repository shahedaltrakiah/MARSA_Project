'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import type { PricingTier, SiteData } from '@/types/admin'

const EMPTY_TIER: PricingTier = { name: '', price: '', description: '', features: [] }

function featuresText(features: string[]): string {
  return features.join('\n')
}

function textToFeatures(text: string): string[] {
  return text.split('\n').filter((line) => line.trim() !== '')
}

interface TierSectionProps {
  label: string
  en: PricingTier
  ar: PricingTier
  onChangeEn: (updated: PricingTier) => void
  onChangeAr: (updated: PricingTier) => void
  onSave: () => void
  saveStatus: 'idle' | 'success' | 'error'
}

function TierSection({
  label,
  en,
  ar,
  onChangeEn,
  onChangeAr,
  onSave,
  saveStatus,
}: TierSectionProps) {
  const [activeTab, setActiveTab] = useState<'en' | 'ar'>('en')
  const tier = activeTab === 'en' ? en : ar
  const onChange = activeTab === 'en' ? onChangeEn : onChangeAr

  function update(field: keyof PricingTier, value: string | string[]) {
    onChange({ ...tier, [field]: value })
  }

  return (
    <div className="mb-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/40 flex items-center justify-between">
        <h2 className="font-medium">{label}</h2>
      </div>
      <div className="p-4">
        <div className="flex border-b mb-4">
          {(['en', 'ar'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'en' ? 'English' : 'Arabic'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              value={tier.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm bg-background"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Price</label>
            <input
              type="text"
              value={tier.price}
              onChange={(e) => update('price', e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm bg-background"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <input
              type="text"
              value={tier.description}
              onChange={(e) => update('description', e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm bg-background"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Features (one per line)</label>
            <textarea
              value={featuresText(tier.features)}
              onChange={(e) => update('features', textToFeatures(e.target.value))}
              rows={5}
              className="w-full border rounded px-3 py-2 text-sm bg-background"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={onSave}
            className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
          >
            Save {label}
          </button>
          {saveStatus === 'success' && (
            <p className="text-sm text-green-600 mt-2">Saved successfully.</p>
          )}
          {saveStatus === 'error' && (
            <p className="text-sm text-red-600 mt-2">Failed to save.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const [siteData, setSiteData] = useState<SiteData | null>(null)
  const [freeEn, setFreeEn] = useState<PricingTier>(EMPTY_TIER)
  const [freeAr, setFreeAr] = useState<PricingTier>(EMPTY_TIER)
  const [proEn, setProEn] = useState<PricingTier>(EMPTY_TIER)
  const [proAr, setProAr] = useState<PricingTier>(EMPTY_TIER)
  const [teamEn, setTeamEn] = useState<PricingTier>(EMPTY_TIER)
  const [teamAr, setTeamAr] = useState<PricingTier>(EMPTY_TIER)
  const [freeSave, setFreeSave] = useState<'idle' | 'success' | 'error'>('idle')
  const [proSave, setProSave] = useState<'idle' | 'success' | 'error'>('idle')
  const [teamSave, setTeamSave] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    async function load() {
      const res = await api.get('/site')
      const data: SiteData = res.data
      setSiteData(data)
      setFreeEn(data.blocks.pricing_free.en)
      setFreeAr(data.blocks.pricing_free.ar)
      setProEn(data.blocks.pricing_pro.en)
      setProAr(data.blocks.pricing_pro.ar)
      setTeamEn(data.blocks.pricing_team.en)
      setTeamAr(data.blocks.pricing_team.ar)
    }
    load()
  }, [])

  async function saveTier(
    key: string,
    en: PricingTier,
    ar: PricingTier,
    setStatus: (s: 'idle' | 'success' | 'error') => void,
  ) {
    setStatus('idle')
    try {
      await api.put(`/admin/content-blocks/${key}`, { content: { en, ar } })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (!siteData) {
    return <div className="text-muted-foreground">Loading…</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Pricing</h1>

      <TierSection
        label="Free"
        en={freeEn}
        ar={freeAr}
        onChangeEn={setFreeEn}
        onChangeAr={setFreeAr}
        onSave={() => saveTier('pricing_free', freeEn, freeAr, setFreeSave)}
        saveStatus={freeSave}
      />

      <TierSection
        label="Pro"
        en={proEn}
        ar={proAr}
        onChangeEn={setProEn}
        onChangeAr={setProAr}
        onSave={() => saveTier('pricing_pro', proEn, proAr, setProSave)}
        saveStatus={proSave}
      />

      <TierSection
        label="Team"
        en={teamEn}
        ar={teamAr}
        onChangeEn={setTeamEn}
        onChangeAr={setTeamAr}
        onSave={() => saveTier('pricing_team', teamEn, teamAr, setTeamSave)}
        saveStatus={teamSave}
      />
    </div>
  )
}
