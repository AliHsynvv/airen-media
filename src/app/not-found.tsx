import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4 px-4">
      <h1 className="text-3xl font-bold text-gray-900">Sayfa bulunamadı</h1>
      <p className="text-gray-600">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
      <Link href="/" className="inline-flex h-10 items-center rounded-md bg-black px-4 text-white hover:bg-black/90">Ana sayfaya dön</Link>
    </div>
  )
}


