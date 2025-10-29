'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ArrowLeftRight, TrendingUp, X, Loader2, AlertCircle } from 'lucide-react'

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
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', country: 'United States' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', country: 'European Union' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', country: 'United Kingdom' },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷', country: 'Turkey' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', country: 'Japan' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', country: 'Australia' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', country: 'Canada' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', country: 'Switzerland' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', country: 'China' },
  { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪', country: 'Sweden' },
  { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿', country: 'New Zealand' },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽', country: 'Mexico' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', country: 'Singapore' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰', country: 'Hong Kong' },
  { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴', country: 'Norway' },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷', country: 'South Korea' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', country: 'India' },
  { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺', country: 'Russia' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷', country: 'Brazil' },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', country: 'South Africa' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', country: 'UAE' },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', country: 'Saudi Arabia' },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭', country: 'Thailand' },
  { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩', country: 'Indonesia' },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾', country: 'Malaysia' },
  { code: 'PLN', name: 'Polish Zloty', flag: '🇵🇱', country: 'Poland' },
  { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰', country: 'Denmark' },
  { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿', country: 'Czech Republic' },
  { code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺', country: 'Hungary' },
  { code: 'ILS', name: 'Israeli Shekel', flag: '🇮🇱', country: 'Israel' },
  { code: 'CLP', name: 'Chilean Peso', flag: '🇨🇱', country: 'Chile' },
  { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭', country: 'Philippines' },
  { code: 'ARS', name: 'Argentine Peso', flag: '🇦🇷', country: 'Argentina' },
  { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬', country: 'Egypt' },
  { code: 'VND', name: 'Vietnamese Dong', flag: '🇻🇳', country: 'Vietnam' },
  { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰', country: 'Pakistan' },
  { code: 'BGN', name: 'Bulgarian Lev', flag: '🇧🇬', country: 'Bulgaria' },
  { code: 'RON', name: 'Romanian Leu', flag: '🇷🇴', country: 'Romania' },
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

  const calculateExchange = (targetCurrency: string): string => {
    if (!rates || !amount) return '0.00'
    const numAmount = parseFloat(amount) || 0
    const rate = rates[targetCurrency] || 0
    return (numAmount * rate).toFixed(2)
  }

  const toggleCurrency = (code: string) => {
    if (selectedCurrencies.includes(code)) {
      setSelectedCurrencies(selectedCurrencies.filter(c => c !== code))
    } else {
      setSelectedCurrencies([...selectedCurrencies, code])
    }
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
      {/* Currency Info */}
      <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
          <span className="text-lg">💱</span>
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Currency</div>
          <div className="text-sm font-bold text-gray-900 mt-0.5">
            {displayName} {displayCurrency !== 'N/A' && `(${displayCurrency})`}
          </div>
        </div>
      </div>
      
      {/* Exchange Button - Modern & Professional */}
      <button
        onClick={() => setOpen(true)}
        className="group relative w-full overflow-hidden rounded-xl mt-3 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 group-hover:from-blue-700 group-hover:via-indigo-700 group-hover:to-purple-700 transition-all duration-300"></div>
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
        
        {/* Content */}
        <div className="relative flex items-center justify-center gap-3 px-6 py-4">
          {/* Left Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
            <ArrowLeftRight className="h-5 w-5 text-white group-hover:rotate-180 transition-transform duration-500" />
          </div>
          
          {/* Text */}
          <div className="flex-1 text-left">
            <div className="text-base font-bold text-white flex items-center gap-2">
              Exchange Calculator
              <svg className="h-4 w-4 text-white/80 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div className="text-xs text-white/80 mt-0.5">Live rates • Real-time conversion</div>
          </div>
          
          {/* Right Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm">
            <TrendingUp className="h-5 w-5 text-white animate-pulse" />
          </div>
        </div>
        
        {/* Bottom Shine */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      </button>
      
      {/* Add shimmer animation to global CSS or inline style */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Currency Exchange</h3>
              <p className="text-sm text-gray-500 mt-0.5">{countryName}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {!hasValidCode ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600">Currency code not available for this country.</p>
            </div>
          ) : (
            <>
              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount to Convert
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-16 px-6 pr-20 text-3xl font-bold bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all"
                    placeholder="100"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
                    <span className="text-2xl">{allCurrencies.find(c => c.code === currencyCode)?.flag || '💱'}</span>
                    <span className="text-lg font-bold text-gray-900">{currencyCode}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  💡 Enter any amount to see live conversion rates
                </div>
              </div>

          {/* Exchange Rates */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && rates && (
            <div className="space-y-4">
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-green-700">Live Exchange Rates</span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 text-xs">Real-time API</span>
                </div>
              </div>

              {/* Currency Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-700">
                    Select Currencies to Compare
                  </div>
                  <button
                    onClick={() => setShowAllCurrencies(!showAllCurrencies)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showAllCurrencies ? '− Hide' : '+ Show All'}
                  </button>
                </div>

                {/* Quick Popular Buttons */}
                <div className="flex flex-wrap gap-2">
                  {popularCurrencies
                    .filter(curr => curr.code !== currencyCode)
                    .map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => toggleCurrency(currency.code)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedCurrencies.includes(currency.code)
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{currency.flag}</span>
                        <span>{currency.code}</span>
                      </button>
                    ))}
                </div>

                {/* All Currencies Dropdown */}
                {showAllCurrencies && (
                  <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
                    {/* Search */}
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="🔍 Search currency, code or country..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    {/* Currency Grid */}
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {filteredCurrencies.map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => toggleCurrency(currency.code)}
                          className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all ${
                            selectedCurrencies.includes(currency.code)
                              ? 'bg-blue-100 border-2 border-blue-500'
                              : 'bg-white border border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <span className="text-xl">{currency.flag}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{currency.code}</div>
                            <div className="text-xs text-gray-500 truncate">{currency.country}</div>
                          </div>
                          {selectedCurrencies.includes(currency.code) && (
                            <div className="text-blue-600">✓</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Currency Results */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-700">
                  Conversion Results ({selectedCurrencies.length})
                </div>
                {selectedCurrencies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-2">💱</div>
                    <div className="text-sm">Select currencies above to see conversion rates</div>
                  </div>
                ) : (
                  selectedCurrencies.map((code) => {
                    const currency = allCurrencies.find(c => c.code === code)
                    if (!currency) return null
                    return (
                      <div
                        key={code}
                        className="group flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50 border-2 border-gray-200 hover:border-blue-400 rounded-xl transition-all hover:shadow-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{currency.flag}</div>
                          <div>
                            <div className="font-bold text-gray-900">{currency.code}</div>
                            <div className="text-xs text-gray-500">{currency.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {calculateExchange(code)}
                          </div>
                          <div className="text-xs text-gray-500">
                            1 {currencyCode} = {rates[code]?.toFixed(4)}
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
        </DialogContent>
      </Dialog>
    </>
  )
}

