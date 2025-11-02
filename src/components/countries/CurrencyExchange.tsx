'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ArrowLeftRight, X, Loader2, AlertCircle, RefreshCw, ChevronDown, Search, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CurrencyExchangeProps {
  currencyCode?: string | null
  currencyName?: string | null
  countryName?: string
}

interface ExchangeRates {
  [key: string]: number
}

interface ExchangeAPIResponse {
  rates: ExchangeRates
  base: string
  date?: string
  time_last_updated?: number
}

const popularCurrencies = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
]

const allCurrencies = [
  // Major Currencies
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', country: 'United States' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', country: 'European Union' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', country: 'United Kingdom' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', country: 'Japan' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', country: 'Switzerland' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', country: 'Canada' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', country: 'Australia' },
  { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿', country: 'New Zealand' },
  
  // Asia-Pacific
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', country: 'China' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰', country: 'Hong Kong' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', country: 'Singapore' },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷', country: 'South Korea' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', country: 'India' },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭', country: 'Thailand' },
  { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩', country: 'Indonesia' },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾', country: 'Malaysia' },
  { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭', country: 'Philippines' },
  { code: 'VND', name: 'Vietnamese Dong', flag: '🇻🇳', country: 'Vietnam' },
  { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰', country: 'Pakistan' },
  { code: 'BDT', name: 'Bangladeshi Taka', flag: '🇧🇩', country: 'Bangladesh' },
  { code: 'LKR', name: 'Sri Lankan Rupee', flag: '🇱🇰', country: 'Sri Lanka' },
  { code: 'NPR', name: 'Nepalese Rupee', flag: '🇳🇵', country: 'Nepal' },
  { code: 'MMK', name: 'Myanmar Kyat', flag: '🇲🇲', country: 'Myanmar' },
  { code: 'KHR', name: 'Cambodian Riel', flag: '🇰🇭', country: 'Cambodia' },
  { code: 'LAK', name: 'Lao Kip', flag: '🇱🇦', country: 'Laos' },
  { code: 'BND', name: 'Brunei Dollar', flag: '🇧🇳', country: 'Brunei' },
  
  // Middle East & Caucasus
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷', country: 'Turkey' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', country: 'UAE' },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', country: 'Saudi Arabia' },
  { code: 'ILS', name: 'Israeli Shekel', flag: '🇮🇱', country: 'Israel' },
  { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦', country: 'Qatar' },
  { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼', country: 'Kuwait' },
  { code: 'BHD', name: 'Bahraini Dinar', flag: '🇧🇭', country: 'Bahrain' },
  { code: 'OMR', name: 'Omani Rial', flag: '🇴🇲', country: 'Oman' },
  { code: 'JOD', name: 'Jordanian Dinar', flag: '🇯🇴', country: 'Jordan' },
  { code: 'LBP', name: 'Lebanese Pound', flag: '🇱🇧', country: 'Lebanon' },
  { code: 'IQD', name: 'Iraqi Dinar', flag: '🇮🇶', country: 'Iraq' },
  { code: 'IRR', name: 'Iranian Rial', flag: '🇮🇷', country: 'Iran' },
  { code: 'AZN', name: 'Azerbaijani Manat', flag: '🇦🇿', country: 'Azerbaijan' },
  { code: 'GEL', name: 'Georgian Lari', flag: '🇬🇪', country: 'Georgia' },
  { code: 'AMD', name: 'Armenian Dram', flag: '🇦🇲', country: 'Armenia' },
  
  // Europe
  { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪', country: 'Sweden' },
  { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴', country: 'Norway' },
  { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰', country: 'Denmark' },
  { code: 'PLN', name: 'Polish Zloty', flag: '🇵🇱', country: 'Poland' },
  { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿', country: 'Czech Republic' },
  { code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺', country: 'Hungary' },
  { code: 'RON', name: 'Romanian Leu', flag: '🇷🇴', country: 'Romania' },
  { code: 'BGN', name: 'Bulgarian Lev', flag: '🇧🇬', country: 'Bulgaria' },
  { code: 'HRK', name: 'Croatian Kuna', flag: '🇭🇷', country: 'Croatia' },
  { code: 'RSD', name: 'Serbian Dinar', flag: '🇷🇸', country: 'Serbia' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', flag: '🇺🇦', country: 'Ukraine' },
  { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺', country: 'Russia' },
  { code: 'BYN', name: 'Belarusian Ruble', flag: '🇧🇾', country: 'Belarus' },
  { code: 'MDL', name: 'Moldovan Leu', flag: '🇲🇩', country: 'Moldova' },
  { code: 'ISK', name: 'Icelandic Króna', flag: '🇮🇸', country: 'Iceland' },
  { code: 'MKD', name: 'Macedonian Denar', flag: '🇲🇰', country: 'North Macedonia' },
  { code: 'ALL', name: 'Albanian Lek', flag: '🇦🇱', country: 'Albania' },
  { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', flag: '🇧🇦', country: 'Bosnia' },
  
  // Americas
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽', country: 'Mexico' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷', country: 'Brazil' },
  { code: 'ARS', name: 'Argentine Peso', flag: '🇦🇷', country: 'Argentina' },
  { code: 'CLP', name: 'Chilean Peso', flag: '🇨🇱', country: 'Chile' },
  { code: 'COP', name: 'Colombian Peso', flag: '🇨🇴', country: 'Colombia' },
  { code: 'PEN', name: 'Peruvian Sol', flag: '🇵🇪', country: 'Peru' },
  { code: 'UYU', name: 'Uruguayan Peso', flag: '🇺🇾', country: 'Uruguay' },
  { code: 'PYG', name: 'Paraguayan Guarani', flag: '🇵🇾', country: 'Paraguay' },
  { code: 'BOB', name: 'Bolivian Boliviano', flag: '🇧🇴', country: 'Bolivia' },
  { code: 'VES', name: 'Venezuelan Bolívar', flag: '🇻🇪', country: 'Venezuela' },
  { code: 'CRC', name: 'Costa Rican Colón', flag: '🇨🇷', country: 'Costa Rica' },
  { code: 'GTQ', name: 'Guatemalan Quetzal', flag: '🇬🇹', country: 'Guatemala' },
  { code: 'DOP', name: 'Dominican Peso', flag: '🇩🇴', country: 'Dominican Republic' },
  { code: 'JMD', name: 'Jamaican Dollar', flag: '🇯🇲', country: 'Jamaica' },
  { code: 'TTD', name: 'Trinidad & Tobago Dollar', flag: '🇹🇹', country: 'Trinidad & Tobago' },
  
  // Africa
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', country: 'South Africa' },
  { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬', country: 'Egypt' },
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', country: 'Nigeria' },
  { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', country: 'Kenya' },
  { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭', country: 'Ghana' },
  { code: 'TZS', name: 'Tanzanian Shilling', flag: '🇹🇿', country: 'Tanzania' },
  { code: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬', country: 'Uganda' },
  { code: 'ETB', name: 'Ethiopian Birr', flag: '🇪🇹', country: 'Ethiopia' },
  { code: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦', country: 'Morocco' },
  { code: 'TND', name: 'Tunisian Dinar', flag: '🇹🇳', country: 'Tunisia' },
  { code: 'DZD', name: 'Algerian Dinar', flag: '🇩🇿', country: 'Algeria' },
  { code: 'AOA', name: 'Angolan Kwanza', flag: '🇦🇴', country: 'Angola' },
  { code: 'MUR', name: 'Mauritian Rupee', flag: '🇲🇺', country: 'Mauritius' },
  { code: 'BWP', name: 'Botswana Pula', flag: '🇧🇼', country: 'Botswana' },
  { code: 'ZMW', name: 'Zambian Kwacha', flag: '🇿🇲', country: 'Zambia' },
  
  // Central Asia
  { code: 'KZT', name: 'Kazakhstani Tenge', flag: '🇰🇿', country: 'Kazakhstan' },
  { code: 'UZS', name: 'Uzbekistani Som', flag: '🇺🇿', country: 'Uzbekistan' },
  { code: 'KGS', name: 'Kyrgyzstani Som', flag: '🇰🇬', country: 'Kyrgyzstan' },
  { code: 'TJS', name: 'Tajikistani Somoni', flag: '🇹🇯', country: 'Tajikistan' },
  { code: 'TMT', name: 'Turkmenistani Manat', flag: '🇹🇲', country: 'Turkmenistan' },
  { code: 'MNT', name: 'Mongolian Tögrög', flag: '🇲🇳', country: 'Mongolia' },
  { code: 'AFN', name: 'Afghan Afghani', flag: '🇦🇫', country: 'Afghanistan' },
]

export default function CurrencyExchange({ currencyCode, currencyName, countryName }: CurrencyExchangeProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState<string>('100')
  const [rates, setRates] = useState<ExchangeRates | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(['USD', 'EUR', 'TRY'])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAllCurrencies, setShowAllCurrencies] = useState(false)
  const [reversedCurrencies, setReversedCurrencies] = useState<Set<string>>(new Set())

  const hasValidCode = currencyCode && currencyCode !== 'N/A' && currencyCode.length === 3

  useEffect(() => {
    if (open && hasValidCode) {
      fetchRates()
    }
  }, [open, hasValidCode, currencyCode])

  const fetchRates = async () => {
    if (!currencyCode) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Using exchangerate-api.com (free tier, real-time rates)
      // This API provides live currency exchange rates updated every 24 hours
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currencyCode}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates')
      }
      
      const data: ExchangeAPIResponse = await response.json()
      setRates(data.rates)
      
      // Set last updated time
      if (data.date) {
        setLastUpdated(new Date(data.date).toLocaleString('tr-TR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }))
      } else if (data.time_last_updated) {
        setLastUpdated(new Date(data.time_last_updated * 1000).toLocaleString('tr-TR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }))
      } else {
        setLastUpdated(new Date().toLocaleString('tr-TR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }))
      }
    } catch (err) {
      setError('Unable to load real-time exchange rates')
      console.error('Exchange rate fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (value: number | string, fractionDigits = 2) => {
    const num = typeof value === 'string' ? parseFloat(value || '0') : value
    if (Number.isNaN(num)) return '0'
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(num)
  }

  const calculateExchange = (targetCurrency: string): string => {
    if (!rates || !amount) return '0.00'
    const numAmount = parseFloat(amount) || 0
    const rate = rates[targetCurrency] || 0
    return (numAmount * rate).toFixed(2)
  }

  const calculateReverseExchange = (targetCurrency: string): string => {
    if (!rates || !amount) return '0.00'
    const numAmount = parseFloat(amount) || 0
    const rate = rates[targetCurrency] || 0
    if (rate === 0) return '0.00'
    return (numAmount / rate).toFixed(2)
  }

  const toggleCurrency = (code: string) => {
    if (selectedCurrencies.includes(code)) {
      setSelectedCurrencies(selectedCurrencies.filter(c => c !== code))
    } else {
      setSelectedCurrencies([...selectedCurrencies, code])
    }
  }

  const toggleReverse = (code: string) => {
    setReversedCurrencies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(code)) {
        newSet.delete(code)
      } else {
        newSet.add(code)
      }
      return newSet
    })
  }

  const filteredCurrencies = allCurrencies.filter(curr => 
    curr.code !== currencyCode &&
    (curr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     curr.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
     curr.country.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const displayCurrency = currencyCode || 'N/A'
  const displayName = currencyName || 'Currency'

  return (
    <>
      {/* Para Birimi Bilgisi */}
      <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-black transition-colors">
        <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center">
          <ArrowLeftRight className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Para Birimi</div>
          <div className="text-sm font-bold text-black mt-0.5">
            {displayName} {displayCurrency !== 'N/A' && `(${displayCurrency})`}
          </div>
        </div>
      </div>
      
      {/* Kur Dönüştürücü Açma */}
      <Button 
        onClick={() => setOpen(true)} 
        size="lg" 
        className="w-full mt-3 bg-black hover:bg-gray-800 text-white border-0"
      >
        <ArrowLeftRight className="h-4 w-4 mr-2" /> Kur Dönüştürücü
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-xl border-2 border-black">
          {/* Header - Minimalist Black & White */}
          <div className="bg-white border-b-2 border-black px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-black flex items-center justify-center">
                  <ArrowLeftRight className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black">Kur Dönüştürücü</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{countryName} {currencyCode ? `• ${currencyCode}` : ''}</p>
                  {lastUpdated && (
                    <p className="text-xs text-gray-500 mt-1">Son Güncelleme: {lastUpdated}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={fetchRates} 
                  size="sm" 
                  disabled={loading || !hasValidCode} 
                  className="bg-black hover:bg-gray-800 text-white border-0"
                >
                  <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                  Yenile
                </Button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Kapat"
                >
                  <X className="h-5 w-5 text-black" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 bg-gray-50">
            {!hasValidCode ? (
              <div className="p-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-white border-2 border-black mb-4">
                  <AlertCircle className="h-8 w-8 text-black" />
                </div>
                <p className="text-gray-700 font-medium">Bu ülke için para birimi kodu bulunamadı.</p>
              </div>
            ) : (
              <>
                {/* Loading / Error */}
                {loading && (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-black" />
                  </div>
                )}
                {error && (
                  <div className="p-4 bg-white border-2 border-black rounded-lg text-sm text-black font-medium mb-4">
                    ⚠ {error}
                  </div>
                )}

                {!loading && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Inputs & Selection */}
                    <div className="space-y-6">
                      {/* Amount */}
                      <div>
                        <label className="block text-xs font-bold text-black uppercase tracking-wider mb-3">Dönüştürülecek Tutar</label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full h-16 px-6 pr-32 text-3xl font-bold bg-white border-2 border-gray-300 focus:border-black rounded-lg"
                            placeholder="100"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-black text-white px-3 py-2 rounded-md">
                            <span className="text-lg font-bold">{currencyCode}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600 font-medium">Canlı dönüşüm oranları ile hesaplanır</div>
                      </div>

                      {rates && (
                        <>
                          {/* Info */}
                          <div className="bg-white border-2 border-black rounded-lg p-3">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                                <span className="font-bold text-black">Canlı Kurlar</span>
                              </div>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-600 text-xs font-medium">Gerçek zamanlı API</span>
                            </div>
                          </div>

                          {/* Selection */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-bold text-black uppercase tracking-wider">Karşılaştırılacak Para Birimleri</div>
                              <button
                                onClick={() => setShowAllCurrencies(!showAllCurrencies)}
                                className="text-xs text-black hover:text-gray-700 font-bold flex items-center gap-1"
                              >
                                {showAllCurrencies ? (
                                  <>Gizle <ChevronDown className="h-3 w-3 rotate-180" /></>
                                ) : (
                                  <>Tümünü Göster <ChevronDown className="h-3 w-3" /></>
                                )}
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {popularCurrencies
                                .filter(curr => curr.code !== currencyCode)
                                .map((currency) => (
                                  <button
                                    key={currency.code}
                                    onClick={() => toggleCurrency(currency.code)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all border-2 ${
                                      selectedCurrencies.includes(currency.code)
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-black border-gray-300 hover:border-black'
                                    }`}
                                  >
                                    <span>{currency.code}</span>
                                    {selectedCurrencies.includes(currency.code) && (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </button>
                                ))}
                            </div>

                            {showAllCurrencies && (
                              <div className="border-2 border-black rounded-lg p-4 space-y-3 bg-white">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Para birimi, kod veya ülke ara..."
                                    className="w-full pl-10 border-2 border-gray-300 focus:border-black"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                  {filteredCurrencies.map((currency) => (
                                    <button
                                      key={currency.code}
                                      onClick={() => toggleCurrency(currency.code)}
                                      className={`flex items-center gap-2 p-3 rounded-lg text-left text-sm transition-all border-2 ${
                                        selectedCurrencies.includes(currency.code)
                                          ? 'bg-black text-white border-black'
                                          : 'bg-white text-black border-gray-300 hover:border-black'
                                      }`}
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="font-bold truncate">{currency.code}</div>
                                        <div className={`text-xs truncate ${selectedCurrencies.includes(currency.code) ? 'text-gray-300' : 'text-gray-500'}`}>
                                          {currency.country}
                                        </div>
                                      </div>
                                      {selectedCurrencies.includes(currency.code) && (
                                        <Check className="h-4 w-4 flex-shrink-0" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Right: Results */}
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="text-xs font-bold text-black uppercase tracking-wider">Dönüşüm Sonuçları ({selectedCurrencies.length})</div>
                      {selectedCurrencies.length === 0 ? (
                        <div className="text-center py-16 text-gray-600 bg-white rounded-lg border-2 border-dashed border-gray-300">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gray-100 mb-3">
                            <ArrowLeftRight className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="text-sm font-medium">Para birimi seçin</div>
                        </div>
                      ) : (
                        selectedCurrencies.map((code) => {
                          const currency = allCurrencies.find(c => c.code === code)
                          if (!currency) return null
                          const isReversed = reversedCurrencies.has(code)
                          return (
                            <div
                              key={code}
                              className="group bg-white border-2 border-gray-300 hover:border-black rounded-lg transition-all overflow-hidden"
                            >
                              <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                      {isReversed ? currencyCode?.charAt(0) : currency.code.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-bold text-black">
                                      {isReversed ? currencyCode : currency.code}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">
                                      {isReversed ? currencyName : currency.name}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => toggleReverse(code)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    aria-label="Dönüşümü ters çevir"
                                  >
                                    <ArrowLeftRight className="h-5 w-5 text-gray-600 hover:text-black" />
                                  </button>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-black">
                                      {isReversed 
                                        ? formatNumber(calculateReverseExchange(code))
                                        : formatNumber(calculateExchange(code))
                                      }
                                    </div>
                                    <div className="text-xs text-gray-600 font-medium mt-0.5">
                                      {isReversed
                                        ? `1 ${code} = ${rates?.[code] ? formatNumber(1 / rates[code], 4) : '-'} ${currencyCode}`
                                        : `1 ${currencyCode} = ${rates?.[code] ? formatNumber(rates[code], 4) : '-'} ${code}`
                                      }
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t-2 border-black bg-white flex justify-end">
            <Button 
              onClick={() => setOpen(false)}
              className="bg-white hover:bg-gray-100 text-black border-2 border-black font-bold"
            >
              Kapat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

