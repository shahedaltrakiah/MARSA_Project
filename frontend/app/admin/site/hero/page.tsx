'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import type { HeroBlock, SiteData } from '@/types/admin'

const EMPTY_HERO: HeroBlock = {
  badge: '',
  headline_start: '',
  headline_end: '',
  subtitle: '',
  cta_primary: '',
  cta_secondary: '',
}

export default function HeroPage() {
  const [siteData, setSiteData] = useState<SiteData | null>(null)
  const [activeTab, setActiveTab] = useState<'en' | 'ar'>('en')
  const [heroEn, setHeroEn] = useState<HeroBlock>(EMPTY_HERO)
  const [heroAr, setHeroAr] = useState<HeroBlock>(EMPTY_HERO)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    async function load() {
      const res = await api.get('/site')
      const data: SiteData = res.data
      setSiteData(data)
      setHeroEn(data.blocks.hero.en)
      setHeroAr(data.blocks.hero.ar)
    }
    load()
  }, [])

  function updateHeroField(
    lang: 'en' | 'ar',
    field: keyof HeroBlock,
    value: string,
  ) {
    if (lang === 'en') {
      setHeroEn((prev) => ({ ...prev, [field]: value }))
    } else {
      setHeroAr((prev) => ({ ...prev, [field]: value }))
    }
  }

  async function handleSave() {
    setSaveStatus('idle')
    try {
      await api.put('/admin/content-blocks/hero', {
        content: { en: heroEn, ar: heroAr },
      })
      setSaveStatus('success')
    } catch {
      setSaveStatus('error')
    }
  }

  function renderFields(lang: 'en' | 'ar') {
    const hero = lang === 'en' ? heroEn : heroAr
    const fields: { label: string; field: keyof HeroBlock; multiline?: boolean }[] = [
      { label: 'Badge', field: 'badge' },
      { label: 'Headline Start', field: 'headline_start' },
      { label: 'Headline End', field: 'headline_end' },
      { label: 'Subtitle', field: 'subtitle', multiline: true },
      { label: 'CTA Primary', field: 'cta_primary' },
      { label: 'CTA Secondary', field: 'cta_secondary' },
    ]
    return (
      <div className="space-y-4">
        {fields.map(({ label, field, multiline }) => (
          <div key={field} className="space-y-1">
            <label className="text-sm font-medium">{label}</label>
            {multiline ? (
              <textarea
                value={hero[field]}
                onChange={(e) => updateHeroField(lang, field, e.target.value)}
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm bg-background"
              />
            ) : (
              <input
                type="text"
                value={hero[field]}
                onChange={(e) => updateHeroField(lang, field, e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm bg-background"
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  if (!siteData) {
    return <div className="text-muted-foreground">Loading…</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Hero Section</h1>

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

      {renderFields(activeTab)}

      <div className="mt-6">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
        >
          Save
        </button>
        {saveStatus === 'success' && (
          <p className="text-sm text-green-600 mt-2">Saved successfully.</p>
        )}
        {saveStatus === 'error' && (
          <p className="text-sm text-red-600 mt-2">Failed to save.</p>
        )}
      </div>
    </div>
  )
}
