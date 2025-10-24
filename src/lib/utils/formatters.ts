import { format, formatDistanceToNow, parseISO, type Locale } from 'date-fns'
import { tr, enUS } from 'date-fns/locale'

const locales: Record<string, Locale> = {
  en: enUS,
  tr: tr,
}

export function formatDate(date: string | Date, formatStr: string = 'PPP', locale: string = 'en') {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: locales[locale] || enUS })
}

export function formatRelativeTime(date: string | Date, locale: string = 'en') {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: locales[locale] || enUS })
}

export function formatNumber(num: number, compact = false) {
  if (compact) {
    return Intl.NumberFormat('en', { 
      notation: 'compact', 
      maximumFractionDigits: 1 
    }).format(num)
  }
  return Intl.NumberFormat('en').format(num)
}

export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

export function formatSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncateText(text: string, length: number = 150) {
  if (text.length <= length) return text
  return text.substring(0, length).trim() + '...'
}

export function generateExcerpt(content: string, length: number = 160) {
  // Remove HTML tags and markdown formatting
  const plainText = content
    .replace(/<[^>]*>/g, '')
    .replace(/[#*_`]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  
  return truncateText(plainText, length)
}
