/**
 * Article Translation Utility
 * Handles multi-language article content based on user's locale
 */

import type { Article } from '@/types'

export type ArticleLocale = 'tr' | 'en' | 'ru'

export interface ArticleTranslations {
  tr?: { title: string; content: string; excerpt: string }
  en?: { title: string; content: string; excerpt: string }
  ru?: { title: string; content: string; excerpt: string }
}

/**
 * Get the appropriate translation for an article based on locale
 * Falls back to default language if translation doesn't exist
 */
export function getArticleTranslation(
  article: Article,
  locale: ArticleLocale
): {
  title: string
  content: string
  excerpt: string
} {
  // If no translations field, return original content
  if (!article.translations || typeof article.translations !== 'object') {
    return {
      title: article.title || '',
      content: article.content || '',
      excerpt: article.excerpt || ''
    }
  }

  const translations = article.translations as ArticleTranslations
  const defaultLang = (article.default_language || 'tr') as ArticleLocale

  // Try to get translation for requested locale
  const localeTranslation = translations[locale]
  
  // If translation exists and has content, use it
  if (localeTranslation?.title?.trim()) {
    return {
      title: localeTranslation.title,
      content: localeTranslation.content || '',
      excerpt: localeTranslation.excerpt || ''
    }
  }

  // Fall back to default language (if different from requested locale)
  if (defaultLang !== locale) {
    const defaultTranslation = translations[defaultLang]
    if (defaultTranslation?.title?.trim()) {
      return {
        title: defaultTranslation.title,
        content: defaultTranslation.content || '',
        excerpt: defaultTranslation.excerpt || ''
      }
    }
  }

  // Last resort: use the original fields (from database title/content/excerpt columns)
  return {
    title: article.title || '',
    content: article.content || '',
    excerpt: article.excerpt || ''
  }
}

/**
 * Apply translations to a single article
 */
export function translateArticle(
  article: Article,
  locale: ArticleLocale
): Article {
  const translation = getArticleTranslation(article, locale)
  
  return {
    ...article,
    title: translation.title,
    content: translation.content,
    excerpt: translation.excerpt
  }
}

/**
 * Apply translations to an array of articles
 */
export function translateArticles<T extends Partial<Article>>(
  articles: T[],
  locale: ArticleLocale
): T[] {
  return articles.map(article => translateArticle(article as Article, locale) as T)
}

