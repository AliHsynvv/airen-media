'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import BusinessLocationPicker from '@/components/business/BusinessLocationPicker'

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
  const [currencyCode, setCurrencyCode] = useState('')
  const [timezone, setTimezone] = useState('')
  const [fetchingCurrency, setFetchingCurrency] = useState(false)
  const [bestTimeToVisit, setBestTimeToVisit] = useState('')
  const [climateInfo, setClimateInfo] = useState('')
  const [avgDaily, setAvgDaily] = useState<number | ''>('')
  const [avgWeekly, setAvgWeekly] = useState<number | ''>('')
  const [cultureDescription, setCultureDescription] = useState('')
  const [visaInfo, setVisaInfo] = useState('')
  const [entryRequirements, setEntryRequirements] = useState('')
  const [visaRequired, setVisaRequired] = useState<null | boolean>(null)
  const [popularActivities, setPopularActivities] = useState('')
  const [popularCities, setPopularCities] = useState('')
  const [airenAdvice, setAirenAdvice] = useState('')
  const [topPlaces, setTopPlaces] = useState('Kapadokya|Peri bacaları ve balon turları\nİstanbul|Tarihi yarımada ve Boğaz')
  const [visitorsPerYear, setVisitorsPerYear] = useState<number | ''>('')
  const [featuredToggle, setFeaturedToggle] = useState(false)
  const [budgetLevel, setBudgetLevel] = useState<'Budget'|'Mid-range'|'Luxury'|''>('')
  const [message, setMessage] = useState<string | null>(null)
  const [latitude, setLatitude] = useState<number | ''>('')
  const [longitude, setLongitude] = useState<number | ''>('')
  const [negativesText, setNegativesText] = useState('')
  const [restaurantsText, setRestaurantsText] = useState('')
  const [hotelsText, setHotelsText] = useState('')
  const [restaurants, setRestaurants] = useState<Array<{name: string, image: string, url: string}>>([])
  const [hotels, setHotels] = useState<Array<{name: string, image: string, url: string}>>([])
  const [uploadingVenue, setUploadingVenue] = useState(false)

  // Extended fields
  const [mapZoom, setMapZoom] = useState<number | ''>('')
  const [negativeAspects, setNegativeAspects] = useState('')
  const [famousFoods, setFamousFoods] = useState('')
  const [totalRestaurants, setTotalRestaurants] = useState<number | ''>('')
  const [totalHotels, setTotalHotels] = useState<number | ''>('')
  const [avgMealPrice, setAvgMealPrice] = useState<number | ''>('')
  const [avgHotelPrice, setAvgHotelPrice] = useState<number | ''>('')
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
        // Currency
        if (country.currencies) {
          const currencyData = Object.values(country.currencies)[0] as any
          if (currencyData) {
            setCurrency(currencyData.name || '')
            setCurrencyCode(Object.keys(country.currencies)[0] || '')
          }
        }
        // Bonus: diğer bilgileri de doldur
        if (country.capital && country.capital[0]) setCapital(country.capital[0])
        if (country.timezones && country.timezones[0]) setTimezone(country.timezones[0])
        if (country.languages) {
          const langs = Object.values(country.languages).join(', ')
          setOfficialLanguage(langs)
        }
        if (country.latlng && country.latlng.length === 2) {
          setLatitude(country.latlng[0])
          setLongitude(country.latlng[1])
        }
        if (country.cca2) setIsoCode(country.cca2)
        if (country.flag) setFlagIcon(country.flag)
        if (country.population) setPopulation(country.population)
        setMessage('✅ Bilgiler API\'den başarıyla çekildi!')
      }
    } catch (err: any) {
      setMessage(`❌ Hata: ${err.message}`)
    } finally {
      setFetchingCurrency(false)
    }
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
          popular_activities: popularActivities ? popularActivities.split(',').map(s => s.trim()).filter(Boolean) : [],
          popular_cities: popularCities ? popularCities.split(',').map(s => s.trim()).filter(Boolean) : [],
          airen_advice: airenAdvice || null,
          top_places: topPlaces
            ? topPlaces.split('\n').map(line => {
                const [name, description] = line.split('|')
                return { name: (name || '').trim(), description: (description || '').trim() }
              }).filter(p => p.name)
            : [],
          visitors_per_year: visitorsPerYear === '' ? null : Number(visitorsPerYear),
          featured: featuredToggle,
          latitude: latitude === '' ? null : Number(latitude),
          longitude: longitude === '' ? null : Number(longitude),
          map_zoom_level: mapZoom === '' ? null : Number(mapZoom),
          negative_aspects: negativeAspects
            ? negativeAspects.split('\n').map(line => {
                const [title, description, severity, category] = line.split('|')
                return {
                  title: (title || '').trim(),
                  description: (description || '').trim() || undefined,
                  severity: (severity || '').trim() || undefined,
                  category: (category || '').trim() || undefined,
                }
              }).filter(p => p.title)
            : [],
          famous_foods: famousFoods
            ? famousFoods.split('\n').map(line => {
                const [name, description, image_url, price_range] = line.split('|')
                return {
                  name: (name || '').trim(),
                  description: (description || '').trim() || undefined,
                  image_url: (image_url || '').trim() || undefined,
                  price_range: (price_range || '').trim() || undefined,
                }
              }).filter(p => p.name)
            : [],
          restaurants: restaurantsText
            ? restaurantsText.split('\n').map(line => {
                const [name, description, image] = line.split('|')
                return {
                  name: (name || '').trim(),
                  description: (description || '').trim() || undefined,
                  images: image ? [image.trim()] : undefined,
                }
              }).filter(p => p.name)
            : [],
          hotels: hotelsText
            ? hotelsText.split('\n').map(line => {
                const [name, description, image] = line.split('|')
                return {
                  name: (name || '').trim(),
                  description: (description || '').trim() || undefined,
                  images: image ? [image.trim()] : undefined,
                }
              }).filter(p => p.name)
            : [],
          total_restaurants: totalRestaurants === '' ? null : Number(totalRestaurants),
          total_hotels: totalHotels === '' ? null : Number(totalHotels),
          average_meal_price: avgMealPrice === '' ? null : Number(avgMealPrice),
          average_hotel_price: avgHotelPrice === '' ? null : Number(avgHotelPrice),
          negatives: negativesText
            ? negativesText.split('\n').map(s => s.trim()).filter(Boolean)
            : [],
          popular_restaurants: restaurants.filter(r => r.name.trim()),
          popular_hotels: hotels.filter(h => h.name.trim()),
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
      setLatitude('')
      setLongitude('')
      setMapZoom('')
      setNegativeAspects('')
      setFamousFoods('')
      setRestaurantsText('')
      setHotelsText('')
      setTotalRestaurants('')
      setTotalHotels('')
      setAvgMealPrice('')
      setAvgHotelPrice('')
      setNegativesText('')
      setNegativesText('')
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

        {/* Auto-fetch from REST Countries API */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-blue-700">
              <strong>🌍 REST Countries API</strong> - Otomatik bilgi doldurma
            </div>
            <Button 
              onClick={fetchCurrencyFromAPI} 
              disabled={fetchingCurrency || !name}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {fetchingCurrency ? '⏳ Çekiliyor...' : '🚀 API\'den Çek'}
            </Button>
          </div>
          <div className="text-xs text-gray-600">
            Ülke adına göre currency, capital, timezone, language, flag, ISO code, population ve koordinatları otomatik doldurur
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Resmi Dil</label>
            <Input value={officialLanguage} onChange={e => setOfficialLanguage(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Para Birimi (Adı)</label>
            <Input value={currency} onChange={e => setCurrency(e.target.value)} placeholder="örn: Turkish Lira" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Para Birimi (Kod) 💱</label>
            <Input value={currencyCode} onChange={e => setCurrencyCode(e.target.value.toUpperCase())} placeholder="örn: TRY" maxLength={3} />
          </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Zaman Dilimi</label>
            <Input value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="GMT+3" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Harita Enlem (latitude)</label>
            <Input value={latitude} onChange={e => setLatitude(e.target.value as any)} placeholder="40.4093" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Harita Boylam (longitude)</label>
            <Input value={longitude} onChange={e => setLongitude(e.target.value as any)} placeholder="49.8671" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Harita Yakınlık (zoom)</label>
            <Input value={mapZoom} onChange={e => setMapZoom(e.target.value as any)} placeholder="6" />
          </div>
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
          <label className="block text-sm text-gray-700 mb-1">🌤️ Popüler Şehirler (Weather için - virgülle ayır)</label>
          <Input value={popularCities} onChange={e => setPopularCities(e.target.value)} placeholder="Istanbul, Ankara, Izmir, Antalya, Bodrum" />
          <div className="text-xs text-blue-600 mt-1">Bu şehirler weather widget'ta seçilebilir olacak</div>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Airen Tavsiyesi</label>
          <Textarea value={airenAdvice} onChange={e => setAirenAdvice(e.target.value)} rows={2} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Harita (konum seç)</label>
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
        <div>
          <label className="block text-sm text-gray-700 mb-1">Menfi Tərəflər (her satır bir madde)</label>
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
          <label className="block text-sm text-gray-700 mb-1">En Çok Ziyaret Edilen Yerler (satır başına "Ad|Açıklama")</label>
          <Textarea value={topPlaces} onChange={e => setTopPlaces(e.target.value)} rows={3} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Mənfi tərəflər (satır: Başlık|Açıklama|severity(optional)|category(optional))</label>
          <Textarea value={negativeAspects} onChange={e => setNegativeAspects(e.target.value)} rows={3} placeholder="Pahalı|Konaklama fiyatları yüksek|high|cost" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">En məşhur yemeklər (satır: Ad|Açıklama|ResimURL|FiyatAralığı)</label>
          <Textarea value={famousFoods} onChange={e => setFamousFoods(e.target.value)} rows={3} placeholder="Plov|Milli yemək|https://.../plov.jpg|10-20 AZN" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Restoranlar (sadece görsel destekli) satır: Ad|Açıklama|ResimURL</label>
          <Textarea value={restaurantsText} onChange={e => setRestaurantsText(e.target.value)} rows={3} placeholder="Firuze|Yerel mətbəx|https://.../rest.jpg" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Oteller (sadece görsel destekli) satır: Ad|Açıklama|ResimURL</label>
          <Textarea value={hotelsText} onChange={e => setHotelsText(e.target.value)} rows={3} placeholder="Four Seasons|5 yıldızlı|https://.../hotel.jpg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Toplam Restoran</label>
            <Input value={totalRestaurants} onChange={e => setTotalRestaurants(e.target.value as any)} placeholder="120" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Toplam Otel</label>
            <Input value={totalHotels} onChange={e => setTotalHotels(e.target.value as any)} placeholder="80" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Ortalama Yemek Fiyatı</label>
            <Input value={avgMealPrice} onChange={e => setAvgMealPrice(e.target.value as any)} placeholder="35" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Ortalama Otel Gecelik</label>
            <Input value={avgHotelPrice} onChange={e => setAvgHotelPrice(e.target.value as any)} placeholder="120" />
          </div>
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
          <div className="mb-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-3">
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
              <img src={featuredImage} alt="Preview" className="w-full h-32 object-cover rounded-md border border-gray-300" />
            </div>
          )}
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


