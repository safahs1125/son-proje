# 🚀 Vercel Deployment Rehberi - TYT-AYT Koçluk Sistemi

## 📋 HAZIRLIK AŞAMASI

### 1️⃣ Gerekli Hesaplar

**Vercel Hesabı:**
- https://vercel.com adresine gidin
- "Sign Up" ile ücretsiz hesap oluşturun
- GitHub, GitLab veya Email ile kayıt yapabilirsiniz

**GitHub Hesabı (Önerilen):**
- https://github.com adresine gidin
- Ücretsiz hesap oluşturun
- Vercel ile entegrasyon için GitHub kullanmak en kolay yöntemdir

---

## 🔧 PROJE YAPILANDIRMA

### 2️⃣ Environment Variables (Çevre Değişkenleri)

Vercel'e deploy etmeden önce, aşağıdaki environment variable'ları hazır bulundurun:

```
SUPABASE_URL=https://blrlfmskgyfzjsvkgciu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
COACH_EMAIL=safa_boyaci15@erdogan.edu.tr
COACH_PASSWORD=coach2025
COACH_PASSWORD_HASH=$2b$12$erzSRC6ZG12hEHmPzXkBXO...
EMERGENT_LLM_KEY=sk-emergent-081991cF1Bf0c8a0d1
REACT_APP_BACKEND_URL=https://your-project.vercel.app
```

⚠️ **ÖNEMLİ:** Bu değerler `/app/backend/.env` dosyasında mevcut.

---

## 📤 GITHUB'A YÜKLEME

### 3️⃣ GitHub Repository Oluşturma

**Adım 1: Yeni Repository Oluştur**
```bash
# GitHub'da:
1. https://github.com/new adresine gidin
2. Repository adı: "tyt-ayt-coaching-system" (veya istediğiniz bir isim)
3. "Public" veya "Private" seçin
4. "Create repository" butonuna tıklayın
```

**Adım 2: Projeyi GitHub'a Push Edin**
```bash
# Terminalden:
cd /app

# Git başlat (eğer başlatılmamışsa)
git init

# Dosyaları ekle
git add .

# Commit yap
git commit -m "Initial commit for Vercel deployment"

# GitHub repository'nizi ekleyin (YOUR_USERNAME'i kendi kullanıcı adınızla değiştirin)
git remote add origin https://github.com/YOUR_USERNAME/tyt-ayt-coaching-system.git

# Push yapın
git branch -M main
git push -u origin main
```

---

## 🌐 VERCEL'E DEPLOY

### 4️⃣ Vercel'de Proje Oluşturma

**Adım 1: Import Project**
```
1. https://vercel.com/dashboard adresine gidin
2. "Add New..." → "Project" seçeneğine tıklayın
3. "Import Git Repository" bölümünde GitHub hesabınızı bağlayın
4. "tyt-ayt-coaching-system" repository'sini seçin
5. "Import" butonuna tıklayın
```

**Adım 2: Project Configuration**
```
1. Framework Preset: "Create React App" seçin
2. Root Directory: Boş bırakın (varsayılan: repo root)
3. Build & Output Settings:
   - Build Command: cd frontend && yarn build
   - Output Directory: frontend/build
   - Install Command: cd frontend && yarn install
```

**Adım 3: Environment Variables Ekleyin**
```
Vercel dashboard'da "Environment Variables" bölümüne gidin:

1. SUPABASE_URL = https://blrlfmskgyfzjsvkgciu.supabase.co
2. SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (tam key)
3. COACH_EMAIL = safa_boyaci15@erdogan.edu.tr
4. COACH_PASSWORD_HASH = $2b$12$erzSRC6ZG12hEHmPzXkBXO... (tam hash)
5. EMERGENT_LLM_KEY = sk-emergent-081991cF1Bf0c8a0d1
6. REACT_APP_BACKEND_URL = https://[proje-adiniz].vercel.app

⚠️ Her birini ayrı ayrı ekleyin: "Add" butonuna basın
⚠️ "Production", "Preview", "Development" seçeneklerinin hepsini işaretleyin
```

**Adım 4: Deploy Butonuna Basın**
```
1. "Deploy" butonuna tıklayın
2. Deployment başlayacak (yaklaşık 2-5 dakika sürer)
3. Build loglarını takip edin
4. ✅ "Deployment Successful" mesajını bekleyin
```

---

## ✅ DEPLOYMENT SONRASI

### 5️⃣ Domain ve URL Ayarları

**Vercel Size Otomatik Bir URL Verir:**
```
https://tyt-ayt-coaching-system.vercel.app
(veya benzeri bir URL)
```

**REACT_APP_BACKEND_URL Güncelleme:**
```
1. Vercel Dashboard → Settings → Environment Variables
2. REACT_APP_BACKEND_URL değerini bulun
3. Yeni URL'inizi buraya girin (örn: https://tyt-ayt-coaching-system.vercel.app)
4. "Save" butonuna basın
5. Deployments sekmesinden "Redeploy" yapın
```

---

## 🧪 TEST ETME

### 6️⃣ Uygulamanızı Test Edin

**Frontend Test:**
```
1. https://[proje-adiniz].vercel.app adresine gidin
2. Ana sayfa yüklenmeli
3. Öğrenci Girişi butonunu test edin
```

**Backend API Test:**
```bash
curl -X POST https://[proje-adiniz].vercel.app/api/coach/login \
  -H "Content-Type: application/json" \
  -d '{"email":"safa_boyaci15@erdogan.edu.tr","password":"coach2025"}'

# Başarılı response:
{"success":true,"token":"coach-token-12345","email":"safa_boyaci15@erdogan.edu.tr"}
```

**Coach Girişi Test:**
```
1. https://[proje-adiniz].vercel.app/coach/login
2. Email: safa_boyaci15@erdogan.edu.tr
3. Şifre: coach2025
4. Giriş başarılı olmalı
```

---

## 🔄 GÜNCELLEME YAPARKEN

### 7️⃣ Kod Değişikliklerini Deploy Etme

**GitHub'a Push Yaptığınızda Otomatik Deploy Olur:**
```bash
# Değişikliklerinizi yapın

# Git commit
git add .
git commit -m "Fix: Bug düzeltildi"

# GitHub'a push
git push origin main

# Vercel otomatik olarak yeni deployment başlatır
```

---

## ⚠️ SORUN GİDERME

### 8️⃣ Yaygın Hatalar ve Çözümleri

**1. Build Hatası:**
```
Sorun: "Module not found" hatası
Çözüm: 
  - package.json'da tüm bağımlılıkların olduğundan emin olun
  - Vercel logs'ları kontrol edin
  - yarn.lock dosyasının commit edildiğinden emin olun
```

**2. API 404 Hatası:**
```
Sorun: /api/... endpoint'leri çalışmıyor
Çözüm:
  - vercel.json dosyasının root'ta olduğundan emin olun
  - Backend routes'ların /api prefix'i ile başladığından emin olun
  - Deployment logs'ları kontrol edin
```

**3. Environment Variables Hatası:**
```
Sorun: "SUPABASE_URL is not defined"
Çözüm:
  - Vercel Dashboard → Settings → Environment Variables
  - Tüm değişkenlerin eklendiğini kontrol edin
  - Redeploy yapın
```

**4. CORS Hatası:**
```
Sorun: "CORS policy" hatası
Çözüm:
  - Backend server.py'da CORS_ORIGINS="*" olduğundan emin olun
  - Vercel.json'da routes doğru yapılandırılmış mı kontrol edin
```

---

## 📊 VERCEL DASHBOARD ÖZELLİKLERİ

### 9️⃣ Önemli Vercel Özellikleri

**Analytics (Analitik):**
- Ziyaretçi sayıları
- Sayfa yükleme süreleri
- Kullanıcı lokasyonları

**Logs (Loglar):**
- Runtime logs
- Build logs
- Function logs (API calls)

**Domains (Domain Yönetimi):**
- Kendi domain'inizi ekleyebilirsiniz
- Örn: www.tyt-ayt-sistem.com

**Deployments:**
- Tüm deployment geçmişi
- Her deployment için ayrı preview URL
- Rollback (geri alma) özelliği

---

## 💰 MALIYET

### 🔟 Vercel Pricing (Ücretsiz Plan)

**Hobby Plan (Ücretsiz):**
```
✅ 100 GB bandwidth/ay
✅ 100 deployments/gün
✅ Serverless Functions
✅ Otomatik HTTPS
✅ Sınırsız projeler

Bu projeniz için ücretsiz plan yeterlidir!
```

---

## 📞 DESTEK

**Vercel Dokümantasyonu:**
- https://vercel.com/docs

**Vercel Community:**
- https://github.com/vercel/vercel/discussions

**Status Page:**
- https://www.vercel-status.com

---

## ✨ BONUS: Custom Domain Ekleme

**Kendi Domain'inizi Bağlama:**
```
1. Vercel Dashboard → Settings → Domains
2. "Add" butonuna tıklayın
3. Domain adınızı girin (örn: tyt-sistem.com)
4. Vercel size DNS ayarlarını verecek
5. Domain sağlayıcınızda (GoDaddy, Namecheap vb.) bu ayarları yapın:
   - A Record: 76.76.21.21
   - CNAME Record: cname.vercel-dns.com
6. DNS propagation bekleyin (5-30 dakika)
7. ✅ Domain hazır!
```

---

## 🎉 TEBRIKLER!

Projeniz artık Vercel'de live! 🚀

**Sonraki Adımlar:**
- ✅ Tüm özellikleri test edin
- ✅ Arkadaşlarınızla paylaşın
- ✅ Feedback toplayın
- ✅ Geliştirmeye devam edin

---

**Sorularınız mı var?**
Bu rehberde eksik olan bir şey mi var? Bana bildirin!