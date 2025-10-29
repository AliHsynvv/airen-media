# 🖼️ Resim Yükleme Kılavuzu

Bu dokümanda, Airen Media platformunda kullanılan farklı resim türleri için önerilen boyutlar ve formatlar bulunmaktadır.

## 📐 Ülke Kapak Görselleri (Country Featured Images)

### Önerilen Boyutlar
- **Birincil:** 2560x1080px (21:9 cinematic aspect ratio) ⭐
- **Alternatif:** 1920x823px (21:9 aspect ratio)
- **Minimum:** 1920x823px

### Neden Bu Boyutlar?
- **21:9 Sinematik Format:** Modern, profesyonel ve etkileyici görünüm
- Hero section CSS `aspect-ratio: 21/9` kullanıyor - TAM UYUM
- Mobil ve masaüstünde responsive görünüm
- Resmin önemli kısımları kesilmiyor (object-position optimize edilmiş)
- Ultra-wide ekranlarda mükemmel görünüm
- Sayfa yüklenme hızını optimize ediyor

### Object Position
- Hero section resmi `objectPosition: '50% 15%'` kullanıyor 🎯
- Bu sayede resmin **üst %15'i viewport merkezinde**, **üst %50 tam görünür** ⭐⭐⭐
- Gökyüzü, üst yapılar ve önemli detaylar TAM görünür
- Desktop'ta maksimum görünürlük için optimize edilmiştir
- İçeriğin hiçbir önemli kısmını kaybetmezsiniz

### Format ve Kalite
- **Format:** JPG (fotoğraflar için) veya PNG (grafikler için)
- **Maksimum Dosya Boyutu:** 2MB
- **Kalite:** 80-95% (JPG compression)
- **Renk Profili:** sRGB

### İpuçları
✅ **Yapılması Gerekenler:**
- **21:9 ultra-wide format** kullanın
- Ülkenin iconic yerlerini içeren görseller seçin
- Yüksek çözünürlüklü fotoğraflar kullanın
- **Önemli içerik resmin üst yarısında** olsun (dikey %10-55 arası)
- Güzel kompozisyon ve lighting'e dikkat edin
- **Gökyüzü ve üst detaylara** MAXIMUM önem verin - bunlar TAM görünür (%0-50) ⭐
- Telif hakkı olmayan veya lisanslı görseller kullanın

❌ **Yapılmaması Gerekenler:**
- Portre (dikey) format kullanmayın
- **Önemli detayları en üst veya en alt kenara** yerleştirmeyin
- Çok karanlık veya aşırı parlak görseller yüklemeyin
- Filigran (watermark) içeren görseller kullanmayın
- Düşük çözünürlüklü veya bulanık resimler yüklemeyin
- Aşırı büyük dosya boyutları (>2MB)

### 📐 Kompozisyon Kuralı
```
┌─────────────────────────────────┐
│  ✅✅✅ ÜST YARIM TAM GÖRÜNÜR   │ ← 0-50%  (Gökyüzü, üst detaylar) ⭐⭐⭐
│  ✅ ORTA ODAK NOKTA             │ ← 50-65% (Ana içerik burada!)
│  ⚠️  ORTA-ALT GÖRÜNÜR           │ ← 65-80% (Kısmen görünür)
│  ⚠️  ALT KISIM OVERLAY          │ ← 80-100% (Gradient overlay)
└─────────────────────────────────┘
```
Object position `50% 15%` kullanıldığı için:
- Resmin dikey %15'i viewport'un merkezinde gösteriliyor
- **Üst %50 TAM GÖRÜNÜR** ⭐⭐⭐ (MAKSIMUM görünürlük!)
- Alt %50 aşağıda (gradient overlay ile kaplı)
- Gökyüzü ve TÜM üst detaylar GARANTİLİ görünür
- Desktop'ta mükemmel, mobil'de de harika!

## 🎨 Diğer Resim Türleri

### İşletme (Business) Görselleri
- **Profil Resmi:** 400x400px (1:1 square)
- **Kapak Görseli:** 1200x400px (3:1)
- **Galeri Görselleri:** 1200x800px (3:2)

### Kullanıcı Avatar'ları
- **Boyut:** 200x200px (1:1 square)
- **Format:** JPG veya PNG
- **Max Size:** 500KB

### Makale (Article) Görselleri
- **Kapak Görseli:** 1200x630px (OG image standard)
- **İçerik Görselleri:** 1200x800px (3:2)

### Hikaye (Story) Görselleri
- **Boyut:** 1080x1920px (9:16 portrait)
- **Format:** JPG veya PNG
- **Max Size:** 3MB

## 🛠️ Resim Optimizasyon Araçları

### Online Araçlar
- [TinyPNG](https://tinypng.com/) - PNG ve JPG sıkıştırma
- [Squoosh](https://squoosh.app/) - Google'ın resim optimizasyon aracı
- [ImageOptim](https://imageoptim.com/) - Mac için
- [RIOT](https://riot-optimizer.com/) - Windows için

### Terminal Araçları
```bash
# ImageMagick ile 21:9 sinematik boyuta resize
convert input.jpg -resize 2560x1080^ -gravity center -extent 2560x1080 output.jpg

# Alternatif boyut (1920px genişlik)
convert input.jpg -resize 1920x823^ -gravity center -extent 1920x823 output.jpg

# JPG kalite optimizasyonu
convert input.jpg -quality 85 output.jpg

# Tek komutta resize ve optimize
convert input.jpg -resize 2560x1080^ -gravity center -extent 2560x1080 -quality 85 output.jpg
```

## 📊 Performans İpuçları

1. **Lazy Loading:** Sayfa dışı görseller lazy load edilir
2. **Responsive Images:** Next.js Image component otomatik optimize eder
3. **WebP Format:** Modern tarayıcılar için otomatik WebP dönüşümü
4. **CDN:** Görseller Supabase Storage üzerinden CDN ile sunulur

## 🔍 Sık Sorulan Sorular

**S: Resmim tam görünmüyor, ne yapmalıyım?**
C: Önerilen 2560x1080px veya 1920x823px boyutlarında yükleyin. 21:9 sinematik ultra-wide format kullanmayı unutmayın.

**S: Resim çok yavaş yükleniyor?**
C: Dosya boyutunu 2MB'ın altına düşürün. Sıkıştırma araçları kullanın.

**S: Hangi format daha iyi, JPG mi PNG mi?**
C: Fotoğraflar için JPG, grafikler ve şeffaf arka plan için PNG kullanın.

**S: Telif hakkı konusunda ne yapmalıyım?**
C: Ücretsiz stok fotoğraf siteleri kullanın:
- [Unsplash](https://unsplash.com/)
- [Pexels](https://pexels.com/)
- [Pixabay](https://pixabay.com/)

## 📝 Güncellemeler

- **2025-10-27:** 
  - İlk versiyon oluşturuldu
  - Hero section 21:9 sinematik ratio'ya güncellendi (2560x1080px)
  - CSS `aspect-ratio: 21/9` ile tam uyum sağlandı
  - Object position `50% 15%` olarak optimize edildi (üst %50 TAM görünür ⭐⭐⭐)
  - Desktop versiyonda MAKSIMUM görünürlük sağlandı
  - Admin paneline resim boyutu bilgilendirmesi eklendi
  - ImageMagick komutları 21:9 format için güncellendi
  - Kompozisyon kuralları ve ipuçları eklendi
  - Ultra-wide format için optimize edildi

