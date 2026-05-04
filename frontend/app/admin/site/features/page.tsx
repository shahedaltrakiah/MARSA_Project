'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import type { FeatureItem, SiteData } from '@/types/admin'

const FEATURE_COUNT = 6

function makeEmptyFeatures(): FeatureItem[] {
  return Array.from({ length: FEATURE_COUNT }, () => ({
    title: '',
    description: '',
    bullets: ['', '', ''],
  }))
}

function buildInitialFeatures(items: FeatureItem[] | undefined): FeatureItem[] {
  if (!items || items.length === 0) return makeEmptyFeatures()
  return items.map((item) => ({
    ...item,
    bullets: item.bullets.length >= 3 ? item.bullets : [...item.bullets, '', '', ''].slice(0, 3),
  }))
}

export default function FeaturesPage() {
  const [siteData, setSiteData] = useState<SiteData | null>(null)
  const [activeTab, setActiveTab] = useState<'en' | 'ar'>('en')
  const [featuresEn, setFeaturesEn] = useState<FeatureItem[]>(makeEmptyFeatures())
  const [featuresAr, setFeaturesAr] = useState<FeatureItem[]>(makeEmptyFeatures())
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    async function load() {
      const res = await api.get('/site')
      const data: SiteData = res.data
      setSiteData(data)
      setFeaturesEn(buildInitialFeatures(data.blocks.features.en))
      setFeaturesAr(buildInitialFeatures(data.blocks.features.ar))
    }
    load()
  }, [])

  function updateFeature(
    lang: 'en' | 'ar',
    idx: number,
    field: keyof FeatureItem,
    value: string | string[],
  ) {
    const setter = lang === 'en' ? setFeaturesEn : setFeaturesAr
    setter((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    )
  }

  function updateBullet(lang: 'en' | 'ar', idx: number, bulletIdx: number, value: string) {
    const setter = lang === 'en' ? setFeaturesEn : setFeaturesAr
    setter((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item
        const bullets = item.bullets.map((b, bi) => (bi === bulletIdx ? value : b))
        return { ...item, bullets }
      }),
    )
  }

  async function handleSave() {
    setSaveStatus('idle')
    try {
      await api.put('/admin/content-blocks/features', {
        content: { en: featuresEn, ar: featuresAr },
      })
      setSaveStatus('success')
    } catch {
      setSaveStatus('error')
    }
  }

  function renderFeatureCards(lang: 'en' | 'ar') {
    const features = lang === 'en' ? featuresEn : featuresAr
    return (
      <div className="space-y-4">
        {features.map((feature, idx) => (
          <div key={idx} className="p-4 border rounded-lg space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Feature {idx + 1}</h3>
            <div className="space-y-1">
              <label className="text-sm font-medium">Title</label>
              <input
                type="text"
                value={feature.title}
                onChange={(e) => updateFeature(lang, idx, 'title', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={feature.description}
                onChange={(e) => updateFeature(lang, idx, 'description', e.target.value)}
                rows={2}
                className="w-full border rounded px-3 py-2 text-sm bg-background"
              />
            </div>
            {[0, 1, 2].map((bulletIdx) => (
              <div key={bulletIdx} className="space-y-1">
                <label className="text-sm font-medium">Bullet {bulletIdx + 1}</label>
                <input
                  type="text"
                  value={feature.bullets[bulletIdx] ?? ''}
                  onChange={(e) => updateBullet(lang, idx, bulletIdx, e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm bg-background"
                />
              </div>
            ))}
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
      <h1 className="text-2xl font-semibold mb-6">Features</h1>

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

      {renderFeatureCards(activeTab)}

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
