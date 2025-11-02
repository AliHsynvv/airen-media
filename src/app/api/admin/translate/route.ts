import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text, sourceLang, targetLang, field } = await req.json()
    
    if (!text || !targetLang) {
      return NextResponse.json({ 
        success: false, 
        error: 'Text and target language required' 
      }, { status: 400 })
    }

    // OpenRouter API kullanarak çeviri
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://airen.media'
    const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Airen Media'
    
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'OpenRouter API key not configured' 
      }, { status: 500 })
    }

    const systemPrompts: Record<string, string> = {
      'culture_description': 'You are translating cultural descriptions for a travel website. Maintain the tone and style.',
      'visa_info': 'You are translating visa information. Keep it clear and factual.',
      'airen_advice': 'You are translating travel advice. Keep it friendly and helpful.',
      'top_places': 'You are translating tourist attraction names and descriptions. Keep names recognizable.',
      'popular_activities': 'You are translating activity names. Keep them concise.',
      'default': 'You are translating travel-related content. Maintain clarity and accuracy.'
    }

    const systemPrompt = systemPrompts[field] || systemPrompts.default

    const targetLangNames: Record<string, string> = {
      'en': 'English',
      'tr': 'Turkish',
      'ru': 'Russian'
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini', // OpenRouter formatında model adı
        messages: [
          {
            role: 'system',
            content: `${systemPrompt} Translate the following text to ${targetLangNames[targetLang] || targetLang}. Return ONLY the translation, no explanations.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3, // Daha tutarlı çeviriler için düşük
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenRouter API Error:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Translation failed' 
      }, { status: 500 })
    }

    const data = await response.json()
    const translatedText = data.choices[0]?.message?.content?.trim()

    if (!translatedText) {
      return NextResponse.json({ 
        success: false, 
        error: 'No translation received' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      translation: translatedText,
      tokensUsed: data.usage?.total_tokens || 0
    })

  } catch (err: any) {
    console.error('Translation error:', err)
    return NextResponse.json({ 
      success: false, 
      error: err?.message || 'Unexpected error' 
    }, { status: 500 })
  }
}

