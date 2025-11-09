import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, Eye, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
const LikeShareBar = dynamic(() => import('@/components/articles/LikeShareBar.lazy'))
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { supabaseAdmin } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils/formatters'
import type { Metadata } from 'next'
const ArticleComments = dynamic(() => import('@/components/articles/ArticleComments.lazy'))
import ArticleViews from '@/components/articles/ArticleViews'
import ArticleBookmarkButton from '@/components/articles/ArticleBookmarkButton'
import { getLocale } from 'next-intl/server'
import { translateArticle, translateArticles, type ArticleLocale } from '@/lib/utils/article-translation'

interface ArticlePageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata(context: ArticlePageProps): Promise<Metadata> {
  const { slug } = await context.params
  const locale = (await getLocale()) as ArticleLocale
  
  const { data: liveArticle } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()
  let article = liveArticle || null
  
  if (!article) {
    return {
      title: 'Makale Bulunamadı | Airen.app',
      description: 'Aradığınız makale bulunamadı.'
    }
  }

  // Translate article for metadata
  article = translateArticle(article, locale)

  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt || undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      images: article.featured_image ? [article.featured_image] : [],
      type: 'article',
      publishedTime: article.published_at || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || '',
      images: article.featured_image ? [article.featured_image] : [],
    }
  }
}

export default async function ArticlePage(context: ArticlePageProps) {
  const { slug } = await context.params
  const locale = (await getLocale()) as ArticleLocale
  
  const articleRes = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()
  let article: any = articleRes.data || null

  if (!article) {
    notFound()
  }

  // Translate article to current locale
  article = translateArticle(article, locale)

  // Related articles (live only)
  let relatedArticles: any[] = []
  if (article.category_id) {
    const relRes = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('category_id', article.category_id)
      .neq('id', article.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3)
    relatedArticles = translateArticles(relRes.data || [], locale)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Fire view increment client-side */}
      { }
      <script
        dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var fired = sessionStorage.getItem('view_'+${JSON.stringify(article.id)})
              if(!fired){
                fetch('/api/articles/view',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({articleId:${JSON.stringify(article.id)}})}).catch(function(){})
                sessionStorage.setItem('view_'+${JSON.stringify(article.id)}, '1')
              }
            } catch(e){}
          })();
        `}}
      />
      {/* Modern Back Button */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <Button
          variant="secondary"
          size="sm"
          asChild
          className="group rounded-full border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-900 hover:text-white hover:border-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2"
        >
          <Link href={article.type === 'news' ? '/news' : '/articles'} className="flex items-center">
            <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 group-hover:bg-white group-hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </span>
            <span className="font-semibold">{article.type === 'news' ? 'Haberlere Dön' : 'Makalelere Dön'}</span>
          </Link>
        </Button>
      </div>

      <article className="container mx-auto px-4 pb-16">
        {/* Modern Article Header */}
        <div className="max-w-4xl mx-auto mb-12">
          {/* Category & Type Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {article.category && (
              <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-lg font-semibold px-4 py-2 text-sm rounded-full">
                {article.category.name}
              </Badge>
            )}
            <Badge className={`${article.type === 'news' ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'} text-white border-0 shadow-lg font-semibold px-4 py-2 text-sm rounded-full`}>
              {article.type === 'news' ? '📰 Haber' : '📝 Makale'}
            </Badge>
            {article.featured && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg font-semibold px-4 py-2 text-sm rounded-full">
                ⭐ Öne Çıkan
              </Badge>
            )}
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-[1.1] tracking-tight">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed font-medium">
              {article.excerpt}
            </p>
          )}

          {/* Modern Meta Section */}
          <div className="rounded-2xl border-2 border-gray-100 bg-white/80 backdrop-blur-sm shadow-lg p-6 mb-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Author Info */}
              {article.author && (
                <div className="flex items-center space-x-4">
                  <Avatar className="h-14 w-14 ring-4 ring-gray-100">
                    <AvatarImage src={article.author.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-lg font-bold">
                      {article.author.full_name?.charAt(0) || article.author.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {article.author.full_name || article.author.username}
                    </p>
                    {article.author.bio && (
                      <p className="text-sm text-gray-600 line-clamp-1">{article.author.bio}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Article Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {article.published_at && (
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    <span className="font-semibold text-gray-700">{formatDate(article.published_at)}</span>
                  </div>
                )}
                
                {article.reading_time && (
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                    <Clock className="h-4 w-4 text-indigo-600" />
                    <span className="font-semibold text-gray-700">{article.reading_time} dk</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                  <Eye className="h-4 w-4 text-indigo-600" />
                  <span className="font-semibold text-gray-700">
                    <ArticleViews articleId={article.id} initial={article.view_count} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <ArticleBookmarkButton articleId={article.id} />
            <LikeShareBar articleId={article.id} articleTitle={article.title} />
          </div>

          {/* Modern Featured Image */}
          {article.featured_image && (
            <div className="relative h-72 sm:h-96 lg:h-[32rem] rounded-3xl overflow-hidden mb-12 shadow-2xl group">
              <Image
                src={article.featured_image}
                alt={article.image_alt || article.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 896px, 896px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/10 transition-all duration-500" />
            </div>
          )}
        </div>

        {/* Modern Article Content */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border-2 border-gray-100 bg-white shadow-xl p-6 sm:p-10 lg:p-16 mb-12">
            <div
              className="article-content prose prose-lg lg:prose-xl max-w-none text-gray-800 prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-img:rounded-2xl prose-img:shadow-lg"
              dangerouslySetInnerHTML={{
                __html: article.content
                  .replace(/\n/g, '<br>')
                  .replace(/#+\s*/g, '<h2>')
                  .replace(/<h2>/g, '<h2 class=\"text-2xl lg:text-3xl font-bold text-gray-900 mt-10 mb-6 pb-3 border-b-2 border-indigo-100\">')
              }}
            />
          </div>

          

          {/* Modern Author Bio Card */}
          {article.author && (
            <div className="rounded-3xl border-2 border-gray-100 bg-gradient-to-br from-white to-indigo-50/30 shadow-xl p-8 mb-12">
              <div className="flex items-start space-x-6">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                  <AvatarImage src={article.author.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-2xl font-bold">
                    {article.author.full_name?.charAt(0) || article.author.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Yazar</span>
                  </div>
                  <h3 className="font-black text-gray-900 text-2xl mb-3">
                    {article.author.full_name || article.author.username}
                  </h3>
                  {article.author.bio && (
                    <p className="text-gray-700 mb-4 leading-relaxed">{article.author.bio}</p>
                  )}
                  {article.author.social_links && (
                    <div className="flex items-center gap-3">
                      {article.author.social_links.instagram && (
                        <a 
                          href={`https://instagram.com/${article.author.social_links.instagram.replace('@', '')}`}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span>📷</span>
                          {article.author.social_links.instagram}
                        </a>
                      )}
                      {article.author.social_links.twitter && (
                        <a 
                          href={`https://twitter.com/${article.author.social_links.twitter.replace('@', '')}`}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span>🐦</span>
                          {article.author.social_links.twitter}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Comments */}
          <div id="comments" className="mt-12 mb-12 sm:mb-16">
            <ArticleComments articleId={article.id} />
          </div>

          {/* Modern Related Articles Section */}
          {relatedArticles.length > 0 && (
            <section className="mt-16">
              <div className="mb-10">
                <div className="inline-flex items-center gap-3 mb-3">
                  <div className="h-10 w-1.5 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
                    İlgili Makaleler
                  </h2>
                </div>
                <p className="text-gray-600 ml-6">Bu konuyla ilgili diğer yazıları keşfedin</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {relatedArticles.map((relatedArticle) => (
                  <div key={relatedArticle.id} className="transform hover:-translate-y-2 transition-all duration-300">
                    <ArticleCard
                      article={relatedArticle}
                      variant="default"
                      theme="light"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </div>
  )
}
