import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-white mb-2">İçerik Bulunamadı</h1>
      <p className="text-gray-400 mb-6">Aradığınız haber/makale yayında olmayabilir veya slug hatalı.</p>
      <Button asChild variant="neon">
        <Link href="/news">Haberler sayfasına dön</Link>
      </Button>
    </div>
  )
}


