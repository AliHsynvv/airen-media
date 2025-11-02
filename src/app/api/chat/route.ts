import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 })
    }

    const { messages } = await req.json()
    const userMessage = messages[messages.length - 1].content

    // Kullanıcının neyi sorduğunu anlamak için basit kontroller
    const lowerMessage = userMessage.toLowerCase()
    
    // Ülke önerisi mi istiyor? (ÇOK GENİŞ KEYWORD LİSTESİ)
    const countryKeywords = [
      'ülke', 'country', 'countries',
      'nereye', 'where',
      'gitmek', 'travel', 'trip', 'visit',
      'öneri', 'suggest', 'suggestion', 'recommend', 'recommendation',
      'tavsiye', 'advice',
      'information', 'info', 'about', 'tell me',
      'hakkında', 'bilgi',
      'destination', 'place',
      'tatil', 'holiday', 'vacation',
      'seyahat',
      // Soru kelimeleri (ülke isimleriyle birlikte kullanıldığında)
      'nece', 'nasıl', 'nedir', 'ne', 'kim', 'hangi', 'which', 'what', 'how'
    ]
    const isCountryQuery = countryKeywords.some(k => lowerMessage.includes(k))
    
    // Haber mi arıyor?
    const newsKeywords = ['haber', 'news', 'article', 'makale']
    const isNewsQuery = newsKeywords.some(k => lowerMessage.includes(k))

    // Context oluştur
    let context = ''
    let data = null

    // Ülke listesini belirle (keyword veya doğrudan ülke adı ile)
    let countries: any[] | null = null
    if (isCountryQuery) {
      const { data: res, error: countryError } = await supabaseAdmin
        .from('countries')
        .select('id, name, slug, flag_icon, featured_image, best_time_to_visit')
        // .eq('status', 'published') // Geçici olarak kaldırıldı
        .order('name', { ascending: true })
        .limit(30)
      if (countryError) console.error('❌ Country fetch error:', countryError)
      countries = res || []
      console.log('🔍 Country query detected via keywords')
    } else {
      // Cümledeki her kelimeyi tek tek kontrol et
      const words = lowerMessage.split(/\s+/).filter((w: string) => w.length > 3) // 3 karakterden uzun kelimeler
      let matchFound = false
      
      for (const word of words) {
        const { data: res, error: directErr } = await supabaseAdmin
          .from('countries')
          .select('id, name, slug, flag_icon, featured_image, best_time_to_visit')
          .or(`name.ilike.%${word}%,slug.ilike.%${word}%`)
          .order('name', { ascending: true })
          .limit(30)
        
        if (directErr) console.error('❌ Direct country match error:', directErr)
        
        if (res && res.length > 0) {
          console.log(`🔍 Country query detected via word match: "${word}"`)
          // Eşleşme bulunduysa TÜM ülkeleri çek (AI context'ine göndermeliyiz)
          const { data: allCountries } = await supabaseAdmin
            .from('countries')
            .select('id, name, slug, flag_icon, featured_image, best_time_to_visit')
            .order('name', { ascending: true })
            .limit(30)
          countries = allCountries || []
          matchFound = true
          break
        }
      }
    }

    if (countries && countries.length > 0) {
      console.log('📊 Countries found:', countries.length)
      // Her ülkeye index ekle (AI integer index döndürecek)
      const countriesWithIndex = countries.map((c, idx) => ({
        index: idx,
        name: c.name,
        slug: c.slug,
        id: c.id
      }))
      context = `\n\nMevcut ülkeler: ${JSON.stringify(countriesWithIndex)}\n\nÖNEMLİ: Ülke önerirken 'index' numarasını kullan!`
      data = countries
      console.log('📚 Countries with index sample:', countriesWithIndex.slice(0, 3))
      console.log('📊 Total countries loaded:', countries.length)
    } else if (isNewsQuery) {
      // Haberleri çek
      const { data: news } = await supabaseAdmin
        .from('articles')
        .select('id, title, slug, excerpt, category_id')
        .eq('type', 'news')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(5)
      
      context = `\n\nGüncel haberler: ${JSON.stringify(news)}`
      data = news
    }

    // OpenRouter'a gönder
    const systemPrompt = `Sen Airen AI'sın, bir seyahat asistanısın. Kullanıcılara seyahat önerileri sunuyorsun.

${context}

KURALLAR:
1. SADECE yukarıdaki JSON listesindeki ülkeleri öner! Listede olmayan ülkeleri ASLA önerme!
2. Eğer kullanıcı belirli bir ülke hakkında bilgi istiyorsa, o ülke yukarıdaki listede varsa MUTLAKA öner!
3. Ülke isimlerini bahsederken AYNEN yukarıdaki listedeki "name" değerini kullan (TEK KARAKTER BİLE DEĞİŞTİRME!)
4. Yanıtını Türkçe ver ama ülke isimlerini İngilizce olarak yukarıdaki listedeki gibi yaz
5. Eğer kullanıcının sorduğu ülke yukarıdaki listede YOKSA, o zaman "Şu an bu ülke hakkında bilgimiz bulunmuyor" de
6. Eğer genel öneri istiyorsa 2-3 ülke öner

ZORUNLU FORMAT:
Yanıtının SONUNDA mutlaka şu formatı ekle (INDEX numaralarını kullan):
COUNTRIES: [index1, index2, index3]

Örnek 1 (belirli ülke soruldu):
"**Azerbaijan**: Bakü'deki modern mimari ve Hazar Denizi kıyısı...

COUNTRIES: [10]"

Örnek 2 (genel öneri):
"Size şu ülkeleri öneriyorum:
1. **Turkey**: Güzel plajları var...
2. **Greece**: Akdeniz'in incisi...

COUNTRIES: [0, 5]"

ÇOK ÖNEMLİ: Listedeki ülkelerin 'index' numarasını kullan!
`

    // Timeout kontrolü ile fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 saniye
    
    let response
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://airen.app',
          'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || 'Airen',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error('❌ Fetch error:', error.message)
      
      if (error.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout - AI yanıt vermedi' }, { status: 504 })
      }
      
      return NextResponse.json({ 
        error: 'OpenRouter bağlantı hatası. Lütfen tekrar deneyin.',
        details: error.message 
      }, { status: 503 })
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter error:', errorText)
      return NextResponse.json({ error: 'AI response failed' }, { status: 500 })
    }

    const aiResponse = await response.json()
    const assistantMessage = aiResponse.choices[0]?.message?.content

    console.log('🤖 AI Response:', assistantMessage)

    if (!assistantMessage) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    // Index'leri extract et (artık ID değil, array index'i)
    const countryIndices: number[] = []
    const newsIds: number[] = []
    
    const countryMatch = assistantMessage.match(/COUNTRIES:\s*\[([^\]]+)\]/)
    const newsMatch = assistantMessage.match(/NEWS:\s*\[([^\]]+)\]/)
    
    if (countryMatch) {
      countryIndices.push(...countryMatch[1].split(',').map((idx: string) => parseInt(idx.trim())).filter((idx: number) => !isNaN(idx)))
    }
    
    if (newsMatch) {
      newsIds.push(...newsMatch[1].split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)))
    }
    
    console.log('📍 Extracted country indices:', countryIndices)

    // Index'lerden ülke ID'lerini al
    const countryUUIDs: string[] = []
    
    if (data && Array.isArray(data) && countryIndices.length > 0) {
      const allCountries = data as any[]
      console.log('🔄 Converting indices to UUIDs...')
      
      for (const index of countryIndices) {
        if (index >= 0 && index < allCountries.length) {
          const country = allCountries[index]
          if (country && country.id) {
            countryUUIDs.push(country.id)
            console.log(`✅ Index ${index} -> ${country.name} (ID: ${country.id})`)
          }
        } else {
          console.log(`⚠️ Invalid index: ${index} (max: ${allCountries.length - 1})`)
        }
      }
    }
    
    console.log('🎯 Final country UUIDs:', countryUUIDs)

    // Fallback: AI indeks döndürmediyse, kullanıcı veya asistan mesajındaki ülke adından eşleştir
    if (countryUUIDs.length === 0 && data && Array.isArray(data)) {
      const allCountries = data as any[]
      const cleanedAssistant = (assistantMessage || '').replace(/\*\*/g, '').toLowerCase()
      const cleanedUser = (userMessage || '').toLowerCase()
      console.log('🧭 Fallback name matching active...')
      console.log('🧾 User message:', cleanedUser)
      console.log('🤖 Assistant (cleaned):', cleanedAssistant)

      for (const c of allCountries) {
        const name = (c.name || '').toLowerCase()
        const slug = (c.slug || '').toLowerCase()
        if (!name && !slug) continue
        if (cleanedAssistant.includes(name) || cleanedAssistant.includes(slug) ||
            cleanedUser.includes(name) || cleanedUser.includes(slug)) {
          if (c.id && !countryUUIDs.includes(c.id)) {
            countryUUIDs.push(c.id)
            console.log(`✅ Fallback matched: ${c.name} (ID: ${c.id})`)
          }
        }
      }

      console.log('🎯 Fallback country UUIDs:', countryUUIDs)
    }

    // Eğer haber sorgusu yapılmışsa ama ID yoksa, mesajdan haber başlıklarını extract et
    if (isNewsQuery && newsIds.length === 0 && data) {
      const allNews = data as any[]
      for (const newsItem of allNews) {
        // Haber başlığının bir kısmını mesajda ara
        const words = newsItem.title.split(' ').slice(0, 3).join(' ')
        if (assistantMessage.includes(words)) {
          newsIds.push(newsItem.id)
        }
      }
    }

    // ID taglerini mesajdan temizle
    let cleanMessage = assistantMessage
      .replace(/COUNTRIES:\s*\[([^\]]+)\]/g, '')
      .replace(/NEWS:\s*\[([^\]]+)\]/g, '')
      .trim()

    // Detaylı bilgi için veritabanından çek
    let suggestions = null

    console.log('🔢 Extracted country UUIDs:', countryUUIDs)
    console.log('🔢 Extracted news IDs:', newsIds)

    if (countryUUIDs.length > 0) {
      const { data: suggestedCountries, error: fetchError } = await supabaseAdmin
        .from('countries')
        .select('id, name, slug, flag_icon, featured_image, best_time_to_visit')
        .in('id', countryUUIDs)
      
      console.log('🔍 Supabase query - UUIDs:', countryUUIDs)
      console.log('🗺️ Suggested countries:', suggestedCountries)
      console.log('❌ Fetch error:', fetchError)
      
      suggestions = {
        type: 'countries',
        items: suggestedCountries || []
      }
    } else if (newsIds.length > 0) {
      const { data: suggestedNews } = await supabaseAdmin
        .from('articles')
        .select('id, title, slug, excerpt, featured_image')
        .in('id', newsIds)
      
      suggestions = {
        type: 'news',
        items: suggestedNews || []
      }
      console.log('📰 Suggested news:', suggestedNews)
    }

    console.log('📤 Final response:', { message: cleanMessage, suggestions })

    return NextResponse.json({
      message: cleanMessage,
      suggestions
    })

  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: error?.message || 'Chat failed' }, { status: 500 })
  }
}

