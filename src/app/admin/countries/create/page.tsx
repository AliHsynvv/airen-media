'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function AdminCountryCreatePage() {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [isoCode, setIsoCode] = useState('')
  const [flagIcon, setFlagIcon] = useState('')
  const [capital, setCapital] = useState('')
  const [population, setPopulation] = useState<number | ''>('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [officialLanguage, setOfficialLanguage] = useState('')
  const [currency, setCurrency] = useState('')
  const [timezone, setTimezone] = useState('')
  const [bestTimeToVisit, setBestTimeToVisit] = useState('')
  const [climateInfo, setClimateInfo] = useState('')
  const [avgDaily, setAvgDaily] = useState<number | ''>('')
  const [avgWeekly, setAvgWeekly] = useState<number | ''>('')
  const [cultureDescription, setCultureDescription] = useState('')
  const [visaInfo, setVisaInfo] = useState('')
  const [entryRequirements, setEntryRequirements] = useState('')
  const [visaRequired, setVisaRequired] = useState<null | boolean>(null)
  const [popularActivities, setPopularActivities] = useState('')
  const [airenAdvice, setAirenAdvice] = useState('')
  const [topPlaces, setTopPlaces] = useState('Kapadokya|Peri bacaları ve balon turları\nİstanbul|Tarihi yarımada ve Boğaz')
  const [visitorsPerYear, setVisitorsPerYear] = useState<number | ''>('')
  const [featuredToggle, setFeaturedToggle] = useState(false)
  const [budgetLevel, setBudgetLevel] = useState<'Budget'|'Mid-range'|'Luxury'|''>('')
  const [message, setMessage] = useState<string | null>(null)

  const upload = async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    form.append('folder', 'countries')
    form.append('bucket', 'Countries')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(json.error || 'Upload failed')
    return json.data.url as string
  }

  const submit = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: slug || undefined,
          iso_code: isoCode || null,
          flag_icon: flagIcon || null,
          capital: capital || null,
          population: population === '' ? null : Number(population),
          featured_image: featuredImage || null,
          status,
          official_language: officialLanguage || null,
          currency: currency || null,
          timezone: timezone || null,
          best_time_to_visit: bestTimeToVisit || null,
          climate_info: climateInfo || null,
          average_budget: (avgDaily || avgWeekly) ? { daily: avgDaily === '' ? undefined : Number(avgDaily), weekly: avgWeekly === '' ? undefined : Number(avgWeekly) } : null,
          budget_level: budgetLevel || null,
          culture_description: cultureDescription || null,
          visa_info: visaInfo || null,
          entry_requirements: entryRequirements || null,
          visa_required: visaRequired,
          popular_activities: popularActivities ? popularActivities.split(',').map(s => s.trim()).filter(Boolean) : [],
          airen_advice: airenAdvice || null,
          top_places: topPlaces
            ? topPlaces.split('\n').map(line => {
                const [name, description] = line.split('|')
                return { name: (name || '').trim(), description: (description || '').trim() }
              }).filter(p => p.name)
            : [],
          visitors_per_year: visitorsPerYear === '' ? null : Number(visitorsPerYear),
          featured: featuredToggle,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Hata')
      setMessage('Ülke oluşturuldu!')
      setName('')
      setSlug('')
      setIsoCode('')
      setFlagIcon('')
      setCapital('')
      setPopulation('')
      setFeaturedImage('')
      setStatus('active')
      setOfficialLanguage('')
      setCurrency('')
      setTimezone('')
      setBestTimeToVisit('')
      setClimateInfo('')
      setAvgDaily('')
      setAvgWeekly('')
      setCultureDescription('')
      setVisaInfo('')
      setEntryRequirements('')
      setVisaRequired(null)
      setPopularActivities('')
      setAirenAdvice('')
      setTopPlaces('')
      setVisitorsPerYear('')
      setFeaturedToggle(false)
      setBudgetLevel('')
    } catch (e: any) {
      setMessage(`Hata: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Ülke Ekle</h1>
      <div className="space-y-4 bg-white border border-gray-200 p-4 rounded-xl">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Ad</label>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Resmi Dil</label>
            <Input value={officialLanguage} onChange={e => setOfficialLanguage(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Para Birimi</label>
            <Input value={currency} onChange={e => setCurrency(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Zaman Dilimi</label>
            <Input value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="GMT+3" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">ISO Kodu</label>
            <Input value={isoCode} maxLength={3} onChange={e => setIsoCode(e.target.value.toUpperCase())} placeholder="FR" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Bayrak (emoji veya kısaltma)</label>
            <Input value={flagIcon} onChange={e => setFlagIcon(e.target.value)} placeholder="🇫🇷" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nüfus</label>
            <Input value={population} onChange={e => setPopulation(e.target.value as any)} placeholder="67800000" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Genel Bilgiler</label>
          <Textarea value={cultureDescription} onChange={e => setCultureDescription(e.target.value)} rows={3} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Vize & Giriş</label>
          <Textarea value={visaInfo} onChange={e => setVisaInfo(e.target.value)} rows={3} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Giriş Şartları</label>
          <Textarea value={entryRequirements} onChange={e => setEntryRequirements(e.target.value)} rows={2} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Vize Gerekli mi?</label>
            <select value={visaRequired === null ? '' : visaRequired ? 'yes' : 'no'} onChange={e => setVisaRequired(e.target.value === '' ? null : e.target.value === 'yes')} className="w-full bg-white border rounded-md px-3 py-2">
              <option value="">Belirsiz</option>
              <option value="yes">Evet</option>
              <option value="no">Hayır</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Yıllık Ziyaretçi (milyon)</label>
            <Input value={visitorsPerYear} onChange={e => setVisitorsPerYear(e.target.value as any)} placeholder="89" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Bütçe Seviyesi</label>
            <select value={budgetLevel} onChange={e => setBudgetLevel(e.target.value as any)} className="w-full bg-white border rounded-md px-3 py-2">
              <option value="">Seç</option>
              <option value="Budget">Budget</option>
              <option value="Mid-range">Mid-range</option>
              <option value="Luxury">Luxury</option>
            </select>
          </div>
        </div>
        <div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={featuredToggle} onChange={e => setFeaturedToggle(e.target.checked)} />
            Featured
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Ziyaret İçin En İyi Zaman</label>
            <Input value={bestTimeToVisit} onChange={e => setBestTimeToVisit(e.target.value)} placeholder="Nisan-Haziran" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">İklim</label>
            <Input value={climateInfo} onChange={e => setClimateInfo(e.target.value)} placeholder="Ilıman" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Bütçe (Günlük/Haftalık)</label>
            <div className="grid grid-cols-2 gap-2">
              <Input value={avgDaily} onChange={e => setAvgDaily(e.target.value as any)} placeholder="80" />
              <Input value={avgWeekly} onChange={e => setAvgWeekly(e.target.value as any)} placeholder="500" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Popüler Aktiviteler (virgülle)</label>
          <Input value={popularActivities} onChange={e => setPopularActivities(e.target.value)} placeholder="Tarih turları, Lezzet turu, Doğa yürüyüşleri" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Airen Tavsiyesi</label>
          <Textarea value={airenAdvice} onChange={e => setAirenAdvice(e.target.value)} rows={2} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">En Çok Ziyaret Edilen Yerler (satır başına "Ad|Açıklama")</label>
          <Textarea value={topPlaces} onChange={e => setTopPlaces(e.target.value)} rows={3} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Slug (opsiyonel)</label>
          <Input value={slug} onChange={e => setSlug(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Başkent</label>
          <Input value={capital} onChange={e => setCapital(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Kapak Görseli</label>
          <div className="flex items-center gap-3">
            <Input value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} className="flex-1" />
            <label className="neon-button px-3 py-2 rounded-md cursor-pointer text-sm">
              Yükle
              <input type="file" accept="image/*" className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  setLoading(true)
                  try {
                    const url = await upload(f)
                    setFeaturedImage(url)
                  } catch (err: any) {
                    setMessage(`Upload hatası: ${err.message}`)
                  } finally {
                    setLoading(false)
                  }
                }}
              />
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Durum</label>
          <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-white border rounded-md px-3 py-2">
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">{message}</div>
          <Button onClick={submit} variant="neon" disabled={loading || !name}>
            {loading ? 'Yükleniyor...' : 'Oluştur'}
          </Button>
        </div>
      </div>
    </div>
  )
}


