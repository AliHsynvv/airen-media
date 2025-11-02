# OpenRouter API Kurulumu

Bu proje, otomatik çeviri için **OpenRouter** kullanıyor. OpenRouter, tek bir API ile birden fazla AI modeline (GPT-4, Claude, Llama vb.) erişim sağlayan bir platformdur.

## 🔑 OpenRouter API Key Alma

### Adım 1: Hesap Oluşturma
1. [OpenRouter.ai](https://openrouter.ai) adresine gidin
2. **Sign Up** butonuna tıklayın
3. Google, GitHub veya email ile hesap oluşturun

### Adım 2: API Key Alma
1. Hesabınıza giriş yapın
2. Sağ üst köşedeki profil menüsünden **Keys** seçin
3. **Create Key** butonuna tıklayın
4. Key'e bir isim verin (örn: "Airen Media Translate")
5. **Create** butonuna tıklayın
6. API key'i kopyalayın (örn: `sk-or-v1-...`)

### Adım 3: Kredi Yükleme
1. **Credits** sekmesine gidin
2. **Add Credits** butonuna tıklayın
3. Minimum $5 kredi ekleyin
   - **Maliyet**: ~$0.001 per ülke çevirisi
   - $5 ile ~5000 ülke çevirisi yapabilirsiniz

## ⚙️ Proje Kurulumu

### 1. Environment Variables (.env.local)
Projenin kök dizinindeki `.env.local` dosyasına ekleyin:

```bash
# OpenRouter API (Çeviri için)
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Site bilgileri (OpenRouter rankings için - isteğe bağlı)
NEXT_PUBLIC_SITE_URL=https://airen.media
NEXT_PUBLIC_SITE_NAME=Airen Media
```

### 2. Database Migration
Supabase SQL Editor'da çalıştırın:

```bash
sql/countries_multilingual.sql
```

Bu migration:
- `_i18n` JSONB kolonlarını ekler
- Mevcut verileri migrate eder
- Performance indekslerini oluşturur

### 3. Sunucuyu Yeniden Başlatın
```bash
npm run dev
```

## 🌐 Desteklenen Modeller

OpenRouter üzerinden kullanabileceğiniz modeller:

| Model | Kod | Fiyat | Hız | Kalite |
|-------|-----|-------|-----|--------|
| **GPT-4o Mini** | `openai/gpt-4o-mini` | $ | ⚡⚡⚡ | ⭐⭐⭐⭐ |
| GPT-4 Turbo | `openai/gpt-4-turbo` | $$$ | ⚡⚡ | ⭐⭐⭐⭐⭐ |
| Claude 3.5 Sonnet | `anthropic/claude-3.5-sonnet` | $$ | ⚡⚡ | ⭐⭐⭐⭐⭐ |
| Llama 3.1 70B | `meta-llama/llama-3.1-70b-instruct` | $ | ⚡⚡⚡ | ⭐⭐⭐ |

**Önerilen:** `openai/gpt-4o-mini` (varsayılan) - En iyi fiyat/performans oranı

### Model Değiştirme
`src/app/api/admin/translate/route.ts` dosyasında 52. satırı değiştirin:

```typescript
model: 'anthropic/claude-3.5-sonnet', // veya başka bir model
```

## 📊 Maliyet Tahmini

### GPT-4o Mini (Önerilen)
- **Input**: $0.15 / 1M tokens
- **Output**: $0.60 / 1M tokens
- **Ortalama çeviri**: ~300 tokens
- **Maliyet**: ~$0.0003 per alan
- **Tam ülke** (6 alan): ~$0.002 (2/10 cent)

### Örnek Senaryolar
- **10 ülke**: $0.02 (2 cent)
- **100 ülke**: $0.20 (20 cent)
- **1000 ülke**: $2.00 (2 dolar)

💡 **Not**: $5 krediyle ~2500 ülkeyi tamamen çevirebilirsiniz.

## 🎯 Kullanım

### Admin Panelden Çeviri
1. Admin panelde bir ülke düzenleyin: `/admin/countries/[id]/edit`
2. İngilizce içerik yazın (veya mevcut içerik varsa)
3. **"TR & RU'ya Çevir"** butonuna tıklayın
4. 2-3 saniye bekleyin
5. Otomatik doldurulan çevirileri kontrol edin/düzenleyin
6. **Save** edin

### Çeviri Alanları
Otomatik çeviri destekleyen alanlar:
- ✅ Genel Bilgiler / Culture Description
- ✅ Vize & Giriş Bilgileri
- ✅ Airen Tavsiyesi
- ✅ En İyi Ziyaret Zamanı
- ✅ İklim Bilgisi

## 🔍 Troubleshooting

### API Key Hatası
```
Error: OpenRouter API key not configured
```
**Çözüm**: `.env.local` dosyasına `OPENROUTER_API_KEY` ekleyin ve sunucuyu yeniden başlatın.

### Kredi Yetersiz
```
Error: Insufficient credits
```
**Çözüm**: OpenRouter hesabınıza kredi ekleyin.

### Rate Limit
```
Error: Rate limit exceeded
```
**Çözüm**: 
- Biraz bekleyin (free tier: 10 req/min)
- Veya OpenRouter'da daha yüksek limit satın alın

### Çeviri Boş Geliyor
```
Error: No translation received
```
**Çözüm**:
- Giriş metninin çok kısa olmadığından emin olun
- Model değiştirmeyi deneyin
- Console'da detaylı error mesajını kontrol edin

## 📚 Daha Fazla Bilgi

- [OpenRouter Docs](https://openrouter.ai/docs)
- [Model Karşılaştırması](https://openrouter.ai/models)
- [Pricing](https://openrouter.ai/pricing)
- [API Referansı](https://openrouter.ai/docs/api-reference)

## 🆘 Destek

Sorun yaşıyorsanız:
1. Console'u kontrol edin (F12 → Console)
2. Network tab'de API response'u inceleyin
3. OpenRouter dashboard'da kullanım loglarına bakın
4. [OpenRouter Discord](https://discord.gg/openrouter) topluluğuna sorun

---

✨ **İyi Çeviriler!**

