import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { defaultLocale, locales } from './config'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    return {
      locale: defaultLocale,
      messages: (await import(`@/i18n/messages/${defaultLocale}.json`)).default,
    }
  }

  return {
    locale,
    messages: (await import(`@/i18n/messages/${locale}.json`)).default,
  }
})

