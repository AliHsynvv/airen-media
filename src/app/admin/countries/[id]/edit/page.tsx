'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import BusinessLocationPicker from '@/components/business/BusinessLocationPicker'
import { TranslateButton } from '@/components/admin/TranslateButton'

export default function AdminCountryEditPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
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
  const [currencyCode, setCurrencyCode] = useState('')
  const [timezone, setTimezone] = useState('')
  const [fetchingCurrency, setFetchingCurrency] = useState(false)
  const [bestTimeToVisit, setBestTimeToVisit] = useState('')
  const [climateInfo, setClimateInfo] = useState('')
  const [avgDaily, setAvgDaily] = useState<number | ''>('')
  const [avgWeekly, setAvgWeekly] = useState<number | ''>('')
  const [cultureDescription, setCultureDescription] = useState('')
  const [cultureDescriptionTr, setCultureDescriptionTr] = useState('')
  const [cultureDescriptionRu, setCultureDescriptionRu] = useState('')
  const [visaInfo, setVisaInfo] = useState('')
  const [visaInfoTr, setVisaInfoTr] = useState('')
  const [visaInfoRu, setVisaInfoRu] = useState('')
  const [entryRequirements, setEntryRequirements] = useState('')
  const [entryRequirementsTr, setEntryRequirementsTr] = useState('')
  const [entryRequirementsRu, setEntryRequirementsRu] = useState('')
  const [visaRequired, setVisaRequired] = useState<null | boolean>(null)
  const [popularActivities, setPopularActivities] = useState('')
  const [airenAdvice, setAirenAdvice] = useState('')
  const [airenAdviceTr, setAirenAdviceTr] = useState('')
  const [airenAdviceRu, setAirenAdviceRu] = useState('')
  const [bestTimeToVisitTr, setBestTimeToVisitTr] = useState('')
  const [bestTimeToVisitRu, setBestTimeToVisitRu] = useState('')
  const [climateInfoTr, setClimateInfoTr] = useState('')
  const [climateInfoRu, setClimateInfoRu] = useState('')
  const [historicalInfo, setHistoricalInfo] = useState('')
  const [historicalInfoTr, setHistoricalInfoTr] = useState('')
  const [historicalInfoRu, setHistoricalInfoRu] = useState('')
  const [foodDescription, setFoodDescription] = useState('')
  const [foodDescriptionTr, setFoodDescriptionTr] = useState('')
  const [foodDescriptionRu, setFoodDescriptionRu] = useState('')
  const [localCustoms, setLocalCustoms] = useState('')
  const [localCustomsTr, setLocalCustomsTr] = useState('')
  const [localCustomsRu, setLocalCustomsRu] = useState('')
  const [topPlaces, setTopPlaces] = useState('')
  const [popularCities, setPopularCities] = useState('')
  const [visitorsPerYear, setVisitorsPerYear] = useState<number | ''>('')
  const [visitorsUnit, setVisitorsUnit] = useState<'million' | 'thousand'>('million')
  const [featuredToggle, setFeaturedToggle] = useState(false)
  const [budgetLevel, setBudgetLevel] = useState<'Budget'|'Mid-range'|'Luxury'|''>('')
  const [latitude, setLatitude] = useState<number | ''>('')
  const [longitude, setLongitude] = useState<number | ''>('')
  const [negativesText, setNegativesText] = useState('')
  const [restaurantsText, setRestaurantsText] = useState('')
  const [hotelsText, setHotelsText] = useState('')
  const [restaurants, setRestaurants] = useState<Array<{name: string, image: string, url: string}>>([])
  const [hotels, setHotels] = useState<Array<{name: string, image: string, url: string}>>([])
  const [uploadingVenue, setUploadingVenue] = useState(false)

  const upload = async (file: File, bucket: string = 'Countries', folder: string = 'countries') => {
    const form = new FormData()
    form.append('file', file)
    form.append('folder', folder)
    form.append('bucket', bucket)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(json.error || 'Upload failed')
    return json.data.url as string
  }

  const uploadVenueImage = async (file: File) => {
    return await upload(file, 'Venues', 'venues')
  }

  const addRestaurant = () => {
    setRestaurants([...restaurants, { name: '', image: '', url: '' }])
  }

  const removeRestaurant = (index: number) => {
    setRestaurants(restaurants.filter((_, i) => i !== index))
  }

  const updateRestaurant = (index: number, field: keyof typeof restaurants[0], value: string) => {
    const updated = [...restaurants]
    updated[index] = { ...updated[index], [field]: value }
    setRestaurants(updated)
  }

  const addHotel = () => {
    setHotels([...hotels, { name: '', image: '', url: '' }])
  }

  const removeHotel = (index: number) => {
    setHotels(hotels.filter((_, i) => i !== index))
  }

  const updateHotel = (index: number, field: keyof typeof hotels[0], value: string) => {
    const updated = [...hotels]
    updated[index] = { ...updated[index], [field]: value }
    setHotels(updated)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await fetch(`/api/admin/countries/${id}`)
      const json = await res.json()
      if (res.ok && json.success) {
        const c = json.data
        setName(c.name || '')
        setSlug(c.slug || '')
        setIsoCode(c.iso_code || '')
        setFlagIcon(c.flag_icon || '')
        setCapital(c.capital || '')
        setPopulation(typeof c.population === 'number' ? c.population : '')
        setFeaturedImage(c.featured_image || '')
        setStatus(c.status || 'active')
        setOfficialLanguage(c.official_language || '')
        setCurrency(c.currency || '')
        setCurrencyCode(c.currency_code || '')
        setTimezone(c.timezone || '')
        setBestTimeToVisit(c.best_time_to_visit || '')
        setClimateInfo(c.climate_info || '')
        setAvgDaily(c.average_budget?.daily || '')
        setAvgWeekly(c.average_budget?.weekly || '')
        setBudgetLevel(c.budget_level || '')
        
        // İngilizce içerik (backward compatibility için hem yeni hem eski alanlardan oku)
        setCultureDescription(c.culture_description_i18n?.en || c.culture_description || '')
        setVisaInfo(c.visa_info_i18n?.en || c.visa_info || '')
        setEntryRequirements(c.entry_requirements_i18n?.en || c.entry_requirements || '')
        setAirenAdvice(c.airen_advice_i18n?.en || c.airen_advice || '')
        setBestTimeToVisit(c.best_time_to_visit_i18n?.en || c.best_time_to_visit || '')
        setClimateInfo(c.climate_info_i18n?.en || c.climate_info || '')
        
        // Türkçe içerik
        setCultureDescriptionTr(c.culture_description_i18n?.tr || '')
        setVisaInfoTr(c.visa_info_i18n?.tr || '')
        setEntryRequirementsTr(c.entry_requirements_i18n?.tr || '')
        setAirenAdviceTr(c.airen_advice_i18n?.tr || '')
        setBestTimeToVisitTr(c.best_time_to_visit_i18n?.tr || '')
        setClimateInfoTr(c.climate_info_i18n?.tr || '')
        
        // Rusça içerik
        setCultureDescriptionRu(c.culture_description_i18n?.ru || '')
        setVisaInfoRu(c.visa_info_i18n?.ru || '')
        setEntryRequirementsRu(c.entry_requirements_i18n?.ru || '')
        setAirenAdviceRu(c.airen_advice_i18n?.ru || '')
        setBestTimeToVisitRu(c.best_time_to_visit_i18n?.ru || '')
        setClimateInfoRu(c.climate_info_i18n?.ru || '')
        
        // Historical Info
        setHistoricalInfo(c.historical_info_i18n?.en || c.historical_info || '')
        setHistoricalInfoTr(c.historical_info_i18n?.tr || '')
        setHistoricalInfoRu(c.historical_info_i18n?.ru || '')
        
        // Food Description
        setFoodDescription(c.food_description_i18n?.en || c.food_description || '')
        setFoodDescriptionTr(c.food_description_i18n?.tr || '')
        setFoodDescriptionRu(c.food_description_i18n?.ru || '')
        
        // Local Customs
        setLocalCustoms(c.local_customs_i18n?.en || c.local_customs || '')
        setLocalCustomsTr(c.local_customs_i18n?.tr || '')
        setLocalCustomsRu(c.local_customs_i18n?.ru || '')
        
        setVisaRequired(c.visa_required === null ? null : c.visa_required)
        setPopularActivities(Array.isArray(c.popular_activities) ? c.popular_activities.join(', ') : '')
        setPopularCities(Array.isArray(c.popular_cities) ? c.popular_cities.join(', ') : '')
        setTopPlaces(Array.isArray(c.top_places) ? c.top_places.map((p: any) => `${p.name || ''}|${p.description || ''}`).join('\n') : '')
        // Set visitors and determine unit (stored in thousands in DB)
        console.log('📊 Loading visitors_per_year from DB (in thousands):', c.visitors_per_year)
        if (typeof c.visitors_per_year === 'number' && c.visitors_per_year > 0) {
          if (c.visitors_per_year < 1000) {
            // Less than 1000 thousands = Less than 1 million
            console.log('  → Showing as thousands:', c.visitors_per_year)
            setVisitorsPerYear(c.visitors_per_year)
            setVisitorsUnit('thousand')
          } else {
            // 1000+ thousands = 1+ million
            const millions = c.visitors_per_year / 1000
            console.log('  → Converting to millions:', millions)
            setVisitorsPerYear(millions)
            setVisitorsUnit('million')
          }
        } else {
          console.log('  → No visitor data, setting empty')
          setVisitorsPerYear('')
          setVisitorsUnit('million')
        }
        setFeaturedToggle(c.featured || false)
        setLatitude(typeof c.latitude === 'number' ? c.latitude : '')
        setLongitude(typeof c.longitude === 'number' ? c.longitude : '')
        setNegativesText(Array.isArray(c.negatives) ? c.negatives.join('\n') : '')
        setRestaurantsText(Array.isArray(c.popular_restaurants) ? c.popular_restaurants.map((v: any) => `${v.name || ''}|${v.image || ''}|${v.url || ''}`).join('\n') : '')
        setHotelsText(Array.isArray(c.popular_hotels) ? c.popular_hotels.map((v: any) => `${v.name || ''}|${v.image || ''}|${v.url || ''}`).join('\n') : '')
        setRestaurants(Array.isArray(c.popular_restaurants) ? c.popular_restaurants.map((v: any) => ({name: v.name || '', image: v.image || '', url: v.url || ''})) : [])
        setHotels(Array.isArray(c.popular_hotels) ? c.popular_hotels.map((v: any) => ({name: v.name || '', image: v.image || '', url: v.url || ''})) : [])
      } else {
        setMessage(json.error || 'Yüklenemedi')
      }
      setLoading(false)
    }
    if (id) load()
  }, [id])

  const fetchCurrencyFromAPI = async () => {
    if (!name) {
      setMessage('Lütfen önce ülke adını girin')
      return
    }
    setFetchingCurrency(true)
    setMessage(null)
    try {
      const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true`)
      if (!res.ok) throw new Error('Ülke bulunamadı')
      const data = await res.json()
      if (data && data[0]) {
        const country = data[0]
        
        // Currency (Para Birimi)
        if (country.currencies) {
          const currencyData = Object.values(country.currencies)[0] as any
          if (currencyData) {
            setCurrency(currencyData.name || '')
            setCurrencyCode(Object.keys(country.currencies)[0] || '')
          }
        }
        
        // Capital (Başkent)
        if (country.capital && country.capital[0]) {
          setCapital(country.capital[0])
        }
        
        // Timezone (Saat Dilimi)
        if (country.timezones && country.timezones[0]) {
          setTimezone(country.timezones[0])
        }
        
        // Languages (Diller)
        if (country.languages) {
          const langs = Object.values(country.languages).join(', ')
          setOfficialLanguage(langs)
        }
        
        // Coordinates (Enlem/Boylam)
        if (country.latlng && country.latlng.length === 2) {
          setLatitude(country.latlng[0])
          setLongitude(country.latlng[1])
        }
        
        // ISO Code
        if (country.cca2) {
          setIsoCode(country.cca2)
        }
        
        // Flag (Bayrak emoji)
        if (country.flag) {
          setFlagIcon(country.flag)
        }
        
        // Population (Nüfus)
        if (country.population) {
          setPopulation(country.population)
        }
        
        // Slug - ülke adından otomatik oluştur (eğer boşsa)
        if (!slug && country.name?.common) {
          const autoSlug = country.name.common.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
          setSlug(autoSlug)
        }
        
        // Popular Cities - başkent ve büyük şehirler (capital + capitalInfo)
        if (country.capital && country.capital.length > 0 && !popularCities) {
          const cities = [...country.capital]
          // Eğer başka büyük şehir bilgisi varsa eklenebilir
          setPopularCities(cities.join(', '))
        }
        
        // Climate Info - bölge bilgisinden iklim tahmini (eğer boşsa)
        if ((country.region || country.subregion) && !climateInfo) {
          const region = country.region || ''
          const subregion = country.subregion || ''
          
          let climate = ''
          // Basit iklim tahminleri
          if (region === 'Europe') {
            if (subregion.includes('Northern')) climate = 'Soğuk, nemli'
            else if (subregion.includes('Southern')) climate = 'Akdeniz iklimi'
            else climate = 'Ilıman'
          } else if (region === 'Africa') {
            if (subregion.includes('Northern')) climate = 'Kurak, sıcak'
            else climate = 'Tropikal'
          } else if (region === 'Asia') {
            if (subregion.includes('Southern')) climate = 'Tropikal, muson'
            else if (subregion.includes('Eastern')) climate = 'Ilıman, nemli'
            else if (subregion.includes('Western')) climate = 'Kurak, sıcak'
            else climate = 'Değişken'
          } else if (region === 'Americas') {
            if (subregion.includes('South')) climate = 'Tropikal-Ilıman'
            else if (subregion.includes('Central')) climate = 'Tropikal'
            else climate = 'Değişken'
          } else if (region === 'Oceania') {
            climate = 'Ilıman-Tropikal'
          }
          
          if (climate) {
            setClimateInfo(climate)
          }
        }
        
        setMessage('✅ Bilgiler API\'den başarıyla çekildi! (Para birimi, başkent, koordinatlar, dil, iklim, vs.)')
        
        // Haritaya otomatik scroll et
        setTimeout(() => {
          mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
      }
    } catch (err: any) {
      setMessage(`❌ Hata: ${err.message}`)
    } finally {
      setFetchingCurrency(false)
    }
  }

  const save = async () => {
    setMessage(null)
    
    // Store in thousands (bigint compatible)
    const visitorsValue = visitorsPerYear === '' ? null : (
      visitorsUnit === 'thousand' 
        ? Math.round(Number(visitorsPerYear)) // 120 thousand → 120
        : Math.round(Number(visitorsPerYear) * 1000) // 89 million → 89000
    )
    
    console.log('💾 Saving visitors_per_year (in thousands):', {
      input: visitorsPerYear,
      unit: visitorsUnit,
      calculated: visitorsValue
    })
    
    const res = await fetch(`/api/admin/countries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        slug,
        iso_code: isoCode || null,
        flag_icon: flagIcon || null,
        capital,
        population: population === '' ? null : Number(population),
        featured_image: featuredImage,
        status,
        official_language: officialLanguage || null,
        currency: currency || null,
        currency_code: currencyCode || null,
        timezone: timezone || null,
        best_time_to_visit: bestTimeToVisit || null,
        climate_info: climateInfo || null,
        average_budget: (avgDaily || avgWeekly) ? { daily: avgDaily === '' ? undefined : Number(avgDaily), weekly: avgWeekly === '' ? undefined : Number(avgWeekly) } : null,
        budget_level: budgetLevel || null,
        culture_description: cultureDescription || null,
        visa_info: visaInfo || null,
        entry_requirements: entryRequirements || null,
        visa_required: visaRequired,
        // Çoklu dil desteği (_i18n alanları)
        culture_description_i18n: {
          en: cultureDescription || null,
          tr: cultureDescriptionTr || null,
          ru: cultureDescriptionRu || null
        },
        visa_info_i18n: {
          en: visaInfo || null,
          tr: visaInfoTr || null,
          ru: visaInfoRu || null
        },
        entry_requirements_i18n: {
          en: entryRequirements || null,
          tr: entryRequirementsTr || null,
          ru: entryRequirementsRu || null
        },
        airen_advice_i18n: {
          en: airenAdvice || null,
          tr: airenAdviceTr || null,
          ru: airenAdviceRu || null
        },
        best_time_to_visit_i18n: {
          en: bestTimeToVisit || null,
          tr: bestTimeToVisitTr || null,
          ru: bestTimeToVisitRu || null
        },
        climate_info_i18n: {
          en: climateInfo || null,
          tr: climateInfoTr || null,
          ru: climateInfoRu || null
        },
        historical_info_i18n: {
          en: historicalInfo || null,
          tr: historicalInfoTr || null,
          ru: historicalInfoRu || null
        },
        food_description_i18n: {
          en: foodDescription || null,
          tr: foodDescriptionTr || null,
          ru: foodDescriptionRu || null
        },
        local_customs_i18n: {
          en: localCustoms || null,
          tr: localCustomsTr || null,
          ru: localCustomsRu || null
        },
        historical_info: historicalInfo || null,
        food_description: foodDescription || null,
        local_customs: localCustoms || null,
        popular_activities: popularActivities ? popularActivities.split(',').map(s => s.trim()).filter(Boolean) : [],
        popular_cities: popularCities ? popularCities.split(',').map(s => s.trim()).filter(Boolean) : [],
        visitors_per_year: visitorsValue,
        featured: featuredToggle,
        latitude: latitude === '' ? null : Number(latitude),
        longitude: longitude === '' ? null : Number(longitude),
        negatives: negativesText ? negativesText.split('\n').map(s => s.trim()).filter(Boolean) : [],
        popular_restaurants: restaurants.filter(r => r.name.trim()),
        popular_hotels: hotels.filter(h => h.name.trim()),
        airen_advice: airenAdvice || null,
        top_places: topPlaces
          ? topPlaces.split('\n').map(line => {
              const [name, description] = line.split('|')
              return { name: (name || '').trim(), description: (description || '').trim() }
            }).filter(p => p.name)
          : [],
      }),
    })
    const json = await res.json()
    console.log('📥 API Response:', json)
    if (!res.ok || !json.success) {
      console.error('❌ Save failed:', json.error)
      setMessage(json.error || 'Kaydedilemedi')
    } else {
      console.log('✅ Save successful! Saved visitors_per_year (in thousands):', json.data?.visitors_per_year)
      const displayValue = visitorsValue !== null 
        ? `${visitorsPerYear} ${visitorsUnit === 'thousand' ? 'Bin' : 'Milyon'} (DB: ${visitorsValue}K)` 
        : 'Yok'
      setMessage('✅ Kaydedildi - Ziyaretçi: ' + displayValue)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-white mb-4">Ülke Düzenle</h1>
      {loading ? (
        <div className="text-gray-300">Yükleniyor...</div>
      ) : (
        <div className="space-y-4 glass-card p-4 rounded-xl">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Ad</label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Slug</label>
            <div className="flex gap-2">
              <Input value={slug} onChange={e => setSlug(e.target.value)} className="flex-1" />
              <Button 
                type="button"
                onClick={() => {
                  if (!name) {
                    setMessage('❌ Önce ülke adını girin')
                    return
                  }
                  const autoSlug = name.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                  setSlug(autoSlug)
                  setMessage('✅ Slug otomatik oluşturuldu')
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 whitespace-nowrap"
              >
                🔗 Oluştur
              </Button>
            </div>
            {!slug && <div className="text-xs text-yellow-400 mt-1">⚠️ Slug boş! Lütfen oluştur butonuna tıklayın.</div>}
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Başkent</label>
            <Input value={capital} onChange={e => setCapital(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Kapak Görseli</label>
            <div className="mb-2 text-xs text-blue-300 bg-blue-900/20 border border-blue-500/30 rounded-md p-2">
              📐 <strong>Önerilen Boyutlar:</strong> 2560x1080px veya 1920x823px (21:9 sinematik)
              <br />
              💡 <strong>Format:</strong> JPG veya PNG, maksimum 2MB
              <br />
              ✨ <strong>Not:</strong> Ultra-wide sinematik format kullanın, resim tam görünecektir
            </div>
            <div className="flex items-center gap-3">
              <Input value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} className="flex-1" placeholder="https://..." />
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
            {featuredImage && (
              <div className="mt-2">
                <img src={featuredImage} alt="Preview" className="w-full h-32 object-cover rounded-md border border-gray-600" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Durum</label>
            <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-transparent border rounded-md px-3 py-2">
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
          {/* Auto-fetch from REST Countries API */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-blue-300">
                <strong>🌍 REST Countries API</strong> - Otomatik bilgi doldurma
              </div>
              <Button 
                onClick={fetchCurrencyFromAPI} 
                disabled={fetchingCurrency || !name}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {fetchingCurrency ? '⏳ Çekiliyor...' : '🚀 API\'den Çek'}
              </Button>
            </div>
            <div className="text-xs text-gray-400">
              <strong>API'den otomatik doldurulan alanlar:</strong><br/>
              💱 Para birimi (adı ve kodu) • 🏛️ Başkent • 🌐 Enlem/Boylam • 🗣️ Resmi Dil<br/>
              🏴 Bayrak emoji • 🔤 ISO Kodu • 👥 Nüfus • ⏰ Saat Dilimi<br/>
              🏙️ Popüler Şehirler (başkent bazlı) • 🌤️ İklim (bölge bazlı tahmin) • 🔗 Slug
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Resmi Dil</label>
              <Input value={officialLanguage} onChange={e => setOfficialLanguage(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Para Birimi (Adı)</label>
              <Input value={currency} onChange={e => setCurrency(e.target.value)} placeholder="örn: Turkish Lira" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Para Birimi (Kod) 💱</label>
              <Input value={currencyCode} onChange={e => setCurrencyCode(e.target.value.toUpperCase())} placeholder="örn: TRY" maxLength={3} />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Zaman Dilimi</label>
              <Input value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="GMT+3" />
            </div>
          </div>
          <div className="glass-card border border-blue-500/30 rounded-xl p-4 bg-gradient-to-br from-blue-900/10 to-cyan-900/10">
            <div className="flex items-center justify-between mb-3">
              <label className="text-base text-blue-300 font-bold">🌍 Genel Bilgiler / Culture Description</label>
              <TranslateButton 
                text={cultureDescription}
                field="culture_description"
                onTranslated={(translations) => {
                  setCultureDescriptionTr(translations.tr)
                  setCultureDescriptionRu(translations.ru)
                }}
                className="text-xs px-3 py-1"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇬🇧 English (Ana Dil)</label>
                <Textarea value={cultureDescription} onChange={e => setCultureDescription(e.target.value)} rows={3} placeholder="Cultural description in English..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇹🇷 Türkçe</label>
                <Textarea value={cultureDescriptionTr} onChange={e => setCultureDescriptionTr(e.target.value)} rows={3} placeholder="Türkçe açıklama..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇷🇺 Русский</label>
                <Textarea value={cultureDescriptionRu} onChange={e => setCultureDescriptionRu(e.target.value)} rows={3} placeholder="Описание на русском..." />
              </div>
            </div>
          </div>
          <div className="glass-card border border-green-500/30 rounded-xl p-4 bg-gradient-to-br from-green-900/10 to-emerald-900/10">
            <div className="flex items-center justify-between mb-3">
              <label className="text-base text-green-300 font-bold">✈️ Vize & Giriş Bilgileri / Visa Info</label>
              <TranslateButton 
                text={visaInfo}
                field="visa_info"
                onTranslated={(translations) => {
                  setVisaInfoTr(translations.tr)
                  setVisaInfoRu(translations.ru)
                }}
                className="text-xs px-3 py-1"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇬🇧 English</label>
                <Textarea value={visaInfo} onChange={e => setVisaInfo(e.target.value)} rows={3} placeholder="Visa information in English..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇹🇷 Türkçe</label>
                <Textarea value={visaInfoTr} onChange={e => setVisaInfoTr(e.target.value)} rows={3} placeholder="Vize bilgisi Türkçe..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇷🇺 Русский</label>
                <Textarea value={visaInfoRu} onChange={e => setVisaInfoRu(e.target.value)} rows={3} placeholder="Визовая информация..." />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Popüler Aktiviteler (virgülle)</label>
            <Input value={popularActivities} onChange={e => setPopularActivities(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">🌤️ Popüler Şehirler (Weather için - virgülle ayır)</label>
            <Input value={popularCities} onChange={e => setPopularCities(e.target.value)} placeholder="Istanbul, Ankara, Izmir, Antalya, Bodrum" />
            <div className="text-xs text-blue-300 mt-1">Bu şehirler weather widget'ta seçilebilir olacak</div>
          </div>
          <div className="glass-card border border-purple-500/30 rounded-xl p-4 bg-gradient-to-br from-purple-900/10 to-pink-900/10">
            <div className="flex items-center justify-between mb-3">
              <label className="text-base text-purple-300 font-bold">✨ Airen Tavsiyesi / AI Travel Advice</label>
              <TranslateButton 
                text={airenAdvice}
                field="airen_advice"
                onTranslated={(translations) => {
                  setAirenAdviceTr(translations.tr)
                  setAirenAdviceRu(translations.ru)
                }}
                className="text-xs px-3 py-1"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇬🇧 English</label>
                <Textarea value={airenAdvice} onChange={e => setAirenAdvice(e.target.value)} rows={2} placeholder="AI travel advice in English..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇹🇷 Türkçe</label>
                <Textarea value={airenAdviceTr} onChange={e => setAirenAdviceTr(e.target.value)} rows={2} placeholder="Airen tavsiyesi Türkçe..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇷🇺 Русский</label>
                <Textarea value={airenAdviceRu} onChange={e => setAirenAdviceRu(e.target.value)} rows={2} placeholder="Совет от Airen..." />
              </div>
            </div>
          </div>
          <div className="glass-card border border-amber-500/30 rounded-xl p-4 bg-gradient-to-br from-amber-900/10 to-yellow-900/10">
            <div className="flex items-center justify-between mb-3">
              <label className="text-base text-amber-300 font-bold">🏛️ Tarih & Miras / Historical Info</label>
              <TranslateButton 
                text={historicalInfo}
                field="historical_info"
                onTranslated={(translations) => {
                  setHistoricalInfoTr(translations.tr)
                  setHistoricalInfoRu(translations.ru)
                }}
                className="text-xs px-3 py-1"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇬🇧 English</label>
                <Textarea value={historicalInfo} onChange={e => setHistoricalInfo(e.target.value)} rows={3} placeholder="Historical information in English..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇹🇷 Türkçe</label>
                <Textarea value={historicalInfoTr} onChange={e => setHistoricalInfoTr(e.target.value)} rows={3} placeholder="Tarihsel bilgi Türkçe..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇷🇺 Русский</label>
                <Textarea value={historicalInfoRu} onChange={e => setHistoricalInfoRu(e.target.value)} rows={3} placeholder="Историческая информация..." />
              </div>
            </div>
          </div>
          <div className="glass-card border border-orange-500/30 rounded-xl p-4 bg-gradient-to-br from-orange-900/10 to-red-900/10">
            <div className="flex items-center justify-between mb-3">
              <label className="text-base text-orange-300 font-bold">🍲 Yemek & Mutfak / Food Description</label>
              <TranslateButton 
                text={foodDescription}
                field="food_description"
                onTranslated={(translations) => {
                  setFoodDescriptionTr(translations.tr)
                  setFoodDescriptionRu(translations.ru)
                }}
                className="text-xs px-3 py-1"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇬🇧 English</label>
                <Textarea value={foodDescription} onChange={e => setFoodDescription(e.target.value)} rows={3} placeholder="Food & cuisine description in English..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇹🇷 Türkçe</label>
                <Textarea value={foodDescriptionTr} onChange={e => setFoodDescriptionTr(e.target.value)} rows={3} placeholder="Yemek ve mutfak bilgisi Türkçe..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇷🇺 Русский</label>
                <Textarea value={foodDescriptionRu} onChange={e => setFoodDescriptionRu(e.target.value)} rows={3} placeholder="Описание еды и кухни..." />
              </div>
            </div>
          </div>
          <div className="glass-card border border-pink-500/30 rounded-xl p-4 bg-gradient-to-br from-pink-900/10 to-rose-900/10">
            <div className="flex items-center justify-between mb-3">
              <label className="text-base text-pink-300 font-bold">🎭 Yerel Gelenekler / Local Customs</label>
              <TranslateButton 
                text={localCustoms}
                field="local_customs"
                onTranslated={(translations) => {
                  setLocalCustomsTr(translations.tr)
                  setLocalCustomsRu(translations.ru)
                }}
                className="text-xs px-3 py-1"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇬🇧 English</label>
                <Textarea value={localCustoms} onChange={e => setLocalCustoms(e.target.value)} rows={3} placeholder="Local customs & culture in English..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇹🇷 Türkçe</label>
                <Textarea value={localCustomsTr} onChange={e => setLocalCustomsTr(e.target.value)} rows={3} placeholder="Yerel gelenekler Türkçe..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">🇷🇺 Русский</label>
                <Textarea value={localCustomsRu} onChange={e => setLocalCustomsRu(e.target.value)} rows={3} placeholder="Местные обычаи..." />
              </div>
            </div>
          </div>
          <div ref={mapRef} className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-2 border-green-500/30 rounded-lg p-4">
            <label className="block text-sm text-green-300 font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">🗺️</span>
              Harita (konum seç)
              <span className="text-xs font-normal text-gray-400">- API'den otomatik doldurulur</span>
            </label>
            <div className="space-y-2">
              <BusinessLocationPicker
                latitude={latitude === '' ? null : latitude}
                longitude={longitude === '' ? null : longitude}
                onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng) }}
                height={220}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Enlem (lat)" value={latitude} onChange={e => setLatitude(e.target.value as any)} />
                <Input placeholder="Boylam (lng)" value={longitude} onChange={e => setLongitude(e.target.value as any)} />
              </div>
            </div>
          </div>
          
          {/* Visitor Stats and Other Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Yıllık Ziyaretçi Sayısı</label>
              <div className="flex gap-2">
                <Input 
                  value={visitorsPerYear} 
                  onChange={e => setVisitorsPerYear(e.target.value as any)} 
                  placeholder={visitorsUnit === 'million' ? '89' : '500'} 
                  className="flex-1"
                  type="number"
                />
                <select 
                  value={visitorsUnit} 
                  onChange={e => setVisitorsUnit(e.target.value as 'million' | 'thousand')} 
                  className="w-28 bg-transparent border rounded-md px-2 py-2 text-sm text-gray-300"
                >
                  <option value="million">Milyon</option>
                  <option value="thousand">Bin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Bütçe Seviyesi</label>
              <select value={budgetLevel} onChange={e => setBudgetLevel(e.target.value as any)} className="w-full bg-transparent border rounded-md px-3 py-2 text-gray-300">
                <option value="">Seç</option>
                <option value="Budget">Budget</option>
                <option value="Mid-range">Mid-range</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">Menfi Tərəflər (her satır bir madde)</label>
            <Textarea value={negativesText} onChange={e => setNegativesText(e.target.value)} rows={3} placeholder="Kalabalık sezonlar\nYüksek fiyatlar" />
          </div>

          {/* Popular Restaurants */}
          <div className="glass-card border border-purple-500/30 rounded-xl p-4 bg-gradient-to-br from-purple-900/10 to-pink-900/10">
            <div className="flex items-center justify-between mb-4">
              <label className="text-base text-purple-300 font-bold flex items-center gap-2">
                <span className="text-2xl">🍽️</span>
                Popüler Restoranlar
              </label>
              <button 
                onClick={addRestaurant}
                className="neon-button neon-button-success px-4 py-2 rounded-lg text-sm font-semibold"
              >
                + Restoran Ekle
              </button>
            </div>
            <div className="space-y-3">
              {restaurants.map((restaurant, index) => (
                <div key={index} className="glass-card border border-purple-400/20 rounded-lg p-3 bg-black/20 hover:border-purple-400/40 transition-all">
                  <div className="flex items-start gap-3">
                    {/* Image Preview */}
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden border-2 border-purple-500/30 bg-black/40 flex-shrink-0 group">
                      {restaurant.image ? (
                        <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 text-xs gap-1">
                          <span className="text-2xl">🖼️</span>
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Form Fields */}
                    <div className="flex-1 space-y-2">
                      <Input 
                        value={restaurant.name} 
                        onChange={e => updateRestaurant(index, 'name', e.target.value)}
                        placeholder="🏷️ Restoran Adı" 
                        className="bg-black/30 border-purple-500/30 text-white placeholder:text-gray-500"
                      />
                      <div className="flex gap-2">
                        <Input 
                          value={restaurant.image} 
                          onChange={e => updateRestaurant(index, 'image', e.target.value)}
                          placeholder="🔗 Resim URL" 
                          className="flex-1 bg-black/30 border-purple-500/30 text-white text-xs placeholder:text-gray-500"
                        />
                        <label className="neon-button px-3 py-2 rounded-lg cursor-pointer text-xs whitespace-nowrap font-semibold">
                          📤 Upload
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0]
                              if (!f) return
                              setUploadingVenue(true)
                              try {
                                const url = await uploadVenueImage(f)
                                updateRestaurant(index, 'image', url)
                              } catch (err: any) {
                                setMessage(`Upload hatası: ${err.message}`)
                              } finally {
                                setUploadingVenue(false)
                              }
                            }}
                          />
                        </label>
                      </div>
                      <Input 
                        value={restaurant.url} 
                        onChange={e => updateRestaurant(index, 'url', e.target.value)}
                        placeholder="🌐 Website URL (opsiyonel)" 
                        className="bg-black/30 border-purple-500/30 text-white text-xs placeholder:text-gray-500"
                      />
                    </div>
                    
                    {/* Remove Button */}
                    <button 
                      onClick={() => removeRestaurant(index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                      title="Sil"
                    >
                      <span className="text-xl">🗑️</span>
                    </button>
                  </div>
                </div>
              ))}
              {restaurants.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8 border-2 border-dashed border-purple-500/20 rounded-lg">
                  <div className="text-4xl mb-2">🍽️</div>
                  <div>Henüz restoran eklenmedi</div>
                  <div className="text-xs text-gray-500 mt-1">Yukarıdaki butona tıklayarak ekleyin</div>
                </div>
              )}
            </div>
          </div>

          {/* Popular Hotels */}
          <div className="glass-card border border-teal-500/30 rounded-xl p-4 bg-gradient-to-br from-teal-900/10 to-cyan-900/10">
            <div className="flex items-center justify-between mb-4">
              <label className="text-base text-teal-300 font-bold flex items-center gap-2">
                <span className="text-2xl">🏨</span>
                Popüler Oteller
              </label>
              <button 
                onClick={addHotel}
                className="neon-button neon-button-success px-4 py-2 rounded-lg text-sm font-semibold"
              >
                + Otel Ekle
              </button>
            </div>
            <div className="space-y-3">
              {hotels.map((hotel, index) => (
                <div key={index} className="glass-card border border-teal-400/20 rounded-lg p-3 bg-black/20 hover:border-teal-400/40 transition-all">
                  <div className="flex items-start gap-3">
                    {/* Image Preview */}
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden border-2 border-teal-500/30 bg-black/40 flex-shrink-0 group">
                      {hotel.image ? (
                        <img src={hotel.image} alt={hotel.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 text-xs gap-1">
                          <span className="text-2xl">🖼️</span>
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Form Fields */}
                    <div className="flex-1 space-y-2">
                      <Input 
                        value={hotel.name} 
                        onChange={e => updateHotel(index, 'name', e.target.value)}
                        placeholder="🏷️ Otel Adı" 
                        className="bg-black/30 border-teal-500/30 text-white placeholder:text-gray-500"
                      />
                      <div className="flex gap-2">
                        <Input 
                          value={hotel.image} 
                          onChange={e => updateHotel(index, 'image', e.target.value)}
                          placeholder="🔗 Resim URL" 
                          className="flex-1 bg-black/30 border-teal-500/30 text-white text-xs placeholder:text-gray-500"
                        />
                        <label className="neon-button px-3 py-2 rounded-lg cursor-pointer text-xs whitespace-nowrap font-semibold">
                          📤 Upload
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0]
                              if (!f) return
                              setUploadingVenue(true)
                              try {
                                const url = await uploadVenueImage(f)
                                updateHotel(index, 'image', url)
                              } catch (err: any) {
                                setMessage(`Upload hatası: ${err.message}`)
                              } finally {
                                setUploadingVenue(false)
                              }
                            }}
                          />
                        </label>
                      </div>
                      <Input 
                        value={hotel.url} 
                        onChange={e => updateHotel(index, 'url', e.target.value)}
                        placeholder="🌐 Website URL (opsiyonel)" 
                        className="bg-black/30 border-teal-500/30 text-white text-xs placeholder:text-gray-500"
                      />
                    </div>
                    
                    {/* Remove Button */}
                    <button 
                      onClick={() => removeHotel(index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                      title="Sil"
                    >
                      <span className="text-xl">🗑️</span>
                    </button>
                  </div>
                </div>
              ))}
              {hotels.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8 border-2 border-dashed border-teal-500/20 rounded-lg">
                  <div className="text-4xl mb-2">🏨</div>
                  <div>Henüz otel eklenmedi</div>
                  <div className="text-xs text-gray-500 mt-1">Yukarıdaki butona tıklayarak ekleyin</div>
                </div>
              )}
          </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">En Çok Ziyaret Edilen Yerler (satır başına "Ad|Açıklama")</label>
            <Textarea value={topPlaces} onChange={e => setTopPlaces(e.target.value)} rows={3} />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">{message}</div>
            <Button onClick={save} variant="neon">Kaydet</Button>
          </div>
        </div>
      )}
    </div>
  )
}


