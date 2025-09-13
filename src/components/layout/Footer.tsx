import Link from 'next/link'
import { Globe, Instagram, Twitter, Youtube, Mail, MapPin } from 'lucide-react'
import { ROUTES, SITE_CONFIG } from '@/lib/utils/constants'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    platform: [
      { name: 'Ana Sayfa', href: ROUTES.HOME },
      { name: 'Haberler', href: ROUTES.NEWS },
      { name: 'Makaleler', href: ROUTES.ARTICLES },
      { name: 'Medya', href: ROUTES.MEDIA },
      { name: 'Ülkeler', href: ROUTES.COUNTRIES },
    ],
    community: [
      { name: 'Topluluk', href: ROUTES.COMMUNITY },
      { name: 'Hikayeni Paylaş', href: `${ROUTES.COMMUNITY}/stories/submit` },
      { name: 'Etkileşim', href: ROUTES.INTERACTION },
      { name: 'Airen Avatar', href: `${ROUTES.INTERACTION}/avatar` },
    ],
    company: [
      { name: 'Hakkımızda', href: ROUTES.ABOUT },
      { name: 'İletişim', href: ROUTES.CONTACT },
      { name: 'Gizlilik Politikası', href: '/privacy' },
      { name: 'Kullanım Şartları', href: '/terms' },
      { name: 'Çerez Politikası', href: '/cookies' },
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
              Yapay zekâ destekli kişiselleştirilmiş turizm deneyimleri sunan 
              dünya çapında lider platform.
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
            <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
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
            <h3 className="font-semibold text-gray-900 mb-4">Topluluk</h3>
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
            <h3 className="font-semibold text-gray-900 mb-4">Şirket</h3>
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
                <span>hello@airen.app</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>İstanbul, Türkiye</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500">
              © {currentYear} Airen Global. Tüm hakları saklıdır.
            </div>
            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <span>Made with ❤️ for travelers</span>
              <span>•</span>
              <span>Powered by AI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
