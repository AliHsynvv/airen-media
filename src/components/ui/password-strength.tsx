'use client'

import { useMemo } from 'react'
import { Check, X } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
  className?: string
}

export function PasswordStrength({ password, className = '' }: PasswordStrengthProps) {
  const analysis = useMemo(() => {
    if (!password) return null

    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;'`~]/.test(password)
    const length = password.length

    // Calculate strength score
    let score = 0
    if (length >= 8) score += 1
    if (length >= 12) score += 1
    if (hasUpperCase) score += 1
    if (hasLowerCase) score += 1
    if (hasNumber) score += 1
    if (hasSpecialChar) score += 1

    // Determine strength level
    let strength: 'weak' | 'medium' | 'strong' = 'weak'
    let color = 'red'
    let label = 'Zayıf'
    let percentage = 0

    if (score >= 5) {
      strength = 'strong'
      color = 'green'
      label = 'Güçlü'
      percentage = 100
    } else if (score >= 3) {
      strength = 'medium'
      color = 'yellow'
      label = 'Orta'
      percentage = 60
    } else {
      strength = 'weak'
      color = 'red'
      label = 'Zayıf'
      percentage = 30
    }

    return {
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      length,
      strength,
      color,
      label,
      percentage,
      score
    }
  }, [password])

  if (!analysis || !password) return null

  const getColorClasses = () => {
    switch (analysis.color) {
      case 'green':
        return {
          bg: 'bg-green-500',
          text: 'text-green-700',
          bgLight: 'bg-green-50',
          border: 'border-green-200'
        }
      case 'yellow':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-700',
          bgLight: 'bg-yellow-50',
          border: 'border-yellow-200'
        }
      default:
        return {
          bg: 'bg-red-500',
          text: 'text-red-700',
          bgLight: 'bg-red-50',
          border: 'border-red-200'
        }
    }
  }

  const colors = getColorClasses()

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 font-medium">Şifre Gücü</span>
          <span className={`font-semibold ${colors.text}`}>
            {analysis.label}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colors.bg} transition-all duration-300 ease-out`}
            style={{ width: `${analysis.percentage}%` }}
          />
        </div>
      </div>

      {/* Character Requirements */}
      <div className={`p-3 rounded-lg ${colors.bgLight} ${colors.border} border`}>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            {analysis.length >= 8 ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <X className="w-3.5 h-3.5 text-gray-400" />
            )}
            <span className={analysis.length >= 8 ? 'text-green-700' : 'text-gray-600'}>
              Min. 8 karakter
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {analysis.hasUpperCase ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <X className="w-3.5 h-3.5 text-gray-400" />
            )}
            <span className={analysis.hasUpperCase ? 'text-green-700' : 'text-gray-600'}>
              Büyük harf (A-Z)
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {analysis.hasLowerCase ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <X className="w-3.5 h-3.5 text-gray-400" />
            )}
            <span className={analysis.hasLowerCase ? 'text-green-700' : 'text-gray-600'}>
              Küçük harf (a-z)
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {analysis.hasNumber ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <X className="w-3.5 h-3.5 text-gray-400" />
            )}
            <span className={analysis.hasNumber ? 'text-green-700' : 'text-gray-600'}>
              Rakam (0-9)
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 col-span-2">
            {analysis.hasSpecialChar ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <X className="w-3.5 h-3.5 text-gray-400" />
            )}
            <span className={analysis.hasSpecialChar ? 'text-green-700' : 'text-gray-600'}>
              Özel karakter (!@#$%^&*)
            </span>
          </div>
        </div>
      </div>

      {/* Character Count */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>Karakter sayısı</span>
        <span className="font-semibold">{analysis.length}</span>
      </div>
    </div>
  )
}

