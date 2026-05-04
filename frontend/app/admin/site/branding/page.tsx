'use client'

import { useEffect, useRef, useState } from 'react'
import api from '@/lib/api'
import type { SiteData } from '@/types/admin'

export default function BrandingPage() {
  const [siteData, setSiteData] = useState<SiteData | null>(null)
  const [primaryColor, setPrimaryColor] = useState('#000000')
  const [secondaryColor, setSecondaryColor] = useState('#000000')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [logoStatus, setLogoStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function fetchSiteData() {
    const res = await api.get('/site')
    const data: SiteData = res.data
    setSiteData(data)
    setPrimaryColor(data.settings.primary_color)
    setSecondaryColor(data.settings.secondary_color)
  }

  useEffect(() => { fetchSiteData() }, [])

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoStatus('idle')
    const formData = new FormData()
    formData.append('logo', file)
    try {
      await api.post('/admin/site-settings/logo', formData)
      await fetchSiteData()
      setLogoStatus('success')
    } catch {
      setLogoStatus('error')
    }
  }

  async function handleSaveColors() {
    setSaveStatus('idle')
    try {
      await api.put('/admin/site-settings', {
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      })
      setSaveStatus('success')
    } catch {
      setSaveStatus('error')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Branding</h1>

      {/* Logo Section */}
      <section className="mb-8 p-6 rounded-lg border">
        <h2 className="text-lg font-medium mb-4">Logo</h2>
        <div className="mb-4">
          {siteData?.settings.logo_url ? (
            <img
              src={siteData.settings.logo_url}
              alt="Current logo"
              className="h-16 object-contain mb-2"
            />
          ) : (
            <p className="text-sm text-muted-foreground mb-2">No logo set</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Upload New Logo</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="block text-sm"
          />
        </div>
        {logoStatus === 'success' && (
          <p className="text-sm text-green-600 mt-2">Logo uploaded successfully.</p>
        )}
        {logoStatus === 'error' && (
          <p className="text-sm text-red-600 mt-2">Failed to upload logo.</p>
        )}
      </section>

      {/* Colors Section */}
      <section className="p-6 rounded-lg border">
        <h2 className="text-lg font-medium mb-4">Brand Colors</h2>
        <div className="space-y-4 mb-6">
          <div className="space-y-1">
            <label className="text-sm font-medium">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="border rounded px-3 py-2 text-sm bg-background w-32"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="border rounded px-3 py-2 text-sm bg-background w-32"
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleSaveColors}
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
        >
          Save Colors
        </button>
        {saveStatus === 'success' && (
          <p className="text-sm text-green-600 mt-2">Saved successfully.</p>
        )}
        {saveStatus === 'error' && (
          <p className="text-sm text-red-600 mt-2">Failed to save.</p>
        )}
      </section>
    </div>
  )
}
