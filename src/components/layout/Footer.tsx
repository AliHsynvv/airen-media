'use client'

import Link from 'next/link'
import { Globe, Instagram, Twitter, Youtube, Mail, MapPin } from 'lucide-react'
import { ROUTES, SITE_CONFIG } from '@/lib/utils/constants'
import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('footer')
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    platform: [
      { name: t('platform.home'), href: ROUTES.HOME },
      { name: t('platform.news'), href: ROUTES.NEWS },
      { name: t('platform.articles'), href: ROUTES.ARTICLES },
      { name: t('platform.media'), href: ROUTES.MEDIA },
      { name: t('platform.countries'), href: ROUTES.COUNTRIES },
    ],
    community: [
      { name: t('community.community'), href: ROUTES.COMMUNITY },
      { name: t('community.shareStory'), href: `${ROUTES.COMMUNITY}/stories/submit` },
      { name: t('community.interaction'), href: ROUTES.INTERACTION },
      { name: t('community.avatar'), href: `${ROUTES.INTERACTION}/avatar` },
    ],
    company: [
      { name: t('company.about'), href: ROUTES.ABOUT },
      { name: t('company.contact'), href: ROUTES.CONTACT },
      { name: t('company.privacy'), href: '/privacy' },
      { name: t('company.terms'), href: '/terms' },
      { name: t('company.cookies'), href: '/cookies' },
    ],
  }

  const socialLinks = [
    { 
      name: 'Instagram', 
      href: SITE_CONFIG.links.instagram, 
      icon: Instagram,
      handle: '@airen_app'
    },
    { 
      name: 'Twitter', 
      href: SITE_CONFIG.links.twitter, 
      icon: Twitter,
      handle: '@airen_app'
    },
    { 
      name: 'YouTube', 
      href: 'https://youtube.com/@airen_app', 
      icon: Youtube,
      handle: '@airen_app'
    },
  ]

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-7 w-7 text-gray-700" />
              <span className="text-xl font-semibold text-gray-900">
                Airen
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t('brand.description')}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-gray-500 hover:text-gray-900 transition-colors focus-ring rounded-lg p-1"
                    title={social.handle}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('platform.title')}</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm focus-ring rounded-lg"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('community.title')}</h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm focus-ring rounded-lg"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links & Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('company.title')}</h3>
            <ul className="space-y-3 mb-6">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm focus-ring rounded-lg"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{t('contact.email')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{t('contact.location')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500">
              {t('copyright', { year: currentYear })}
            </div>
            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <span>{t('tagline')}</span>
              <span>•</span>
              <span>{t('poweredBy')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
