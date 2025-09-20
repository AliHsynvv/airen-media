import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, Eye, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LikeShareBar from '@/components/articles/LikeShareBar'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { supabaseAdmin } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils/formatters'
import type { Metadata } from 'next'
import ArticleComments from '@/components/articles/ArticleComments'
import ArticleViews from '@/components/articles/ArticleViews'
import ArticleBookmarkButton from '@/components/articles/ArticleBookmarkButton'

interface ArticlePageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata(context: ArticlePageProps): Promise<Metadata> {
  const { slug } = await context.params
  const { data: liveArticle } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()
  const article = liveArticle || null
  
  if (!article) {
    return {
      title: 'Makale Bulunamadı | Airen.app',
      description: 'Aradığınız makale bulunamadı.'
    }
  }

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
  const articleRes = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()
  const article: any = articleRes.data || null

  if (!article) {
    notFound()
  }

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
    relatedArticles = relRes.data || []
  }

  return (
    <div className="min-h-screen py-8 bg-white">
      {/* Fire view increment client-side */}
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
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
      {/* Back Button */}
      <div className="container mx-auto px-4 mb-8">
        <Button
          variant="secondary"
          size="sm"
          asChild
          className="rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50 shadow-sm focus-visible:ring-2 focus-visible:ring-black/10 px-3"
        >
          <Link href={article.type === 'news' ? '/news' : '/articles'} className="flex items-center text-black">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-700">
              <ArrowLeft className="h-4 w-4" />
            </span>
            {article.type === 'news' ? 'Haberlere Dön' : 'Makalelere Dön'}
          </Link>
        </Button>
      </div>

      <article className="container mx-auto px-4">
        {/* Article Header */}
        <div className="max-w-4xl mx-auto mb-12">
          {/* Category & Type */}
          <div className="flex items-center space-x-3 mb-6">
            {article.category && (
              <Badge variant="neon">
                {article.category.name}
              </Badge>
            )}
            <Badge variant={article.type === 'news' ? 'destructive' : 'default'}>
              {article.type === 'news' ? 'Haber' : 'Makale'}
            </Badge>
            {article.featured && (
              <Badge variant="glass" className="text-yellow-400 border-yellow-400/30">
                ⭐ Öne Çıkan
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-xl text-black mb-8 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Article Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center space-x-4">
              {article.author && (
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={article.author.avatar_url || undefined} />
                    <AvatarFallback className="bg-gray-100 text-gray-700">
                      {article.author.full_name?.charAt(0) || article.author.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {article.author.full_name || article.author.username}
                    </p>
                    {article.author.bio && (
                      <p className="text-sm text-gray-500">{article.author.bio}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-black">
              {article.published_at && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.published_at)}</span>
                </div>
              )}
              
              {article.reading_time && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{article.reading_time} dk okuma</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <ArticleViews articleId={article.id} initial={article.view_count} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 mb-8">
            <ArticleBookmarkButton articleId={article.id} />
            <LikeShareBar articleId={article.id} articleTitle={article.title} />
          </div>

          {/* Featured Image */}
          {article.featured_image && (
            <div className="relative h-64 lg:h-96 rounded-xl overflow-hidden mb-12 group">
              <Image
                src={article.featured_image}
                alt={article.image_alt || article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-gray-200 bg-white p-8 lg:p-12 mb-12">
            <div
              className="article-content prose prose-lg max-w-none text-black prose-headings:text-black prose-a:text-blue-700"
              dangerouslySetInnerHTML={{
                __html: article.content
                  .replace(/\n/g, '<br>')
                  .replace(/#+\s*/g, '<h2>')
                  .replace(/<h2>/g, '<h2 class=\"text-2xl font-bold text-black mt-8 mb-4\">')
              }}
            />
          </div>

          

          {/* Author Bio */}
          {article.author && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 mb-12">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={article.author.avatar_url || undefined} />
                  <AvatarFallback className="bg-gray-100 text-gray-700 text-xl">
                    {article.author.full_name?.charAt(0) || article.author.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-black text-lg mb-2">
                    {article.author.full_name || article.author.username}
                  </h3>
                  {article.author.bio && (
                    <p className="text-black mb-3">{article.author.bio}</p>
                  )}
                  {article.author.social_links && (
                    <div className="flex items-center space-x-3">
                      {article.author.social_links.instagram && (
                        <a 
                          href={`https://instagram.com/${article.author.social_links.instagram.replace('@', '')}`}
                          className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {article.author.social_links.instagram}
                        </a>
                      )}
                      {article.author.social_links.twitter && (
                        <a 
                          href={`https://twitter.com/${article.author.social_links.twitter.replace('@', '')}`}
                          className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
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

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <span className="w-1 h-6 bg-blue-600 mr-3 rounded-full"></span>
                İlgili Makaleler
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <ArticleCard
                    key={relatedArticle.id}
                    article={relatedArticle}
                    variant="default"
                    theme="light"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </div>
  )
}
