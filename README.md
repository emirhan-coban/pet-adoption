# 🐾 Hayvan Sahiplendirme Platformu — Supabase Kurulum Rehberi

## Dosya Sırası

Migration dosyalarını **bu sırayla** Supabase SQL Editor'da çalıştır:

| # | Dosya | İçerik | Zorunlu mu? |
|---|-------|---------|------------|
| 1 | `001_create_tables.sql` | Tüm tablolar, indeksler, enum tipler | ✅ Evet |
| 2 | `002_rls_policies.sql` | Row Level Security politikaları | ✅ Evet |
| 3 | `003_seed_dev.sql` | Örnek veri (geliştirme için) | ⚠️ Sadece dev |
| 4 | `004_storage_and_functions.sql` | Storage politikaları, trigger'lar, view'lar | ✅ Evet |

---

## Adım Adım Kurulum

### 1. Supabase Projesi Oluştur

1. [supabase.com](https://supabase.com) → **New Project**
2. Bölge: **Frankfurt (eu-central-1)** seç — Türkiye için en yakın
3. Proje adı: `patternpaw` (veya istediğin ad)
4. Güçlü bir veritabanı şifresi belirle, kaydet!

### 2. SQL Migration'ları Çalıştır

1. Supabase Dashboard → **SQL Editor** → **New Query**
2. `001_create_tables.sql` içeriğini yapıştır → **Run**
3. Yeşil "Success" mesajı gördükten sonra `002_rls_policies.sql` çalıştır
4. `004_storage_and_functions.sql` çalıştır
5. (Opsiyonel, sadece geliştirme için) `003_seed_dev.sql` çalıştır

### 3. Authentication Ayarları

Supabase Dashboard → **Authentication** → **Providers**:

- ✅ **Email** — Etkinleştir (Confirm email: açık bırak)
- ✅ **Google** — Client ID ve Secret gir (Google Cloud Console'dan al)
- ✅ **Apple** — Sadece iOS App Store'a çıkmadan önce gerekli

### 4. Storage Bucket'ları Oluştur

Supabase Dashboard → **Storage** → **New Bucket**:

**Bucket 1: `listing-media`**
- Public: ✅ Açık
- File size limit: 5MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

**Bucket 2: `avatars`**
- Public: ✅ Açık
- File size limit: 2MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

### 5. API Anahtarlarını Al

Supabase Dashboard → **Settings** → **API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://XXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **SERVICE_ROLE_KEY'i asla client'a gönderme!** Sadece Edge Functions ve server-side kod kullanır.

---

## Veritabanı Yapısı

```
users               → Tüm kullanıcılar (bireysel + kurumsal + admin)
  └── corporate_profiles  → Kurumsal kullanıcı detayları
  └── listings            → Kullanıcının ilanları
       └── listing_media  → İlan fotoğrafları
       └── applications   → İlana gelen başvurular
       └── messages       → İlan üzerinden mesajlaşma
  └── favorites      → Favori ilanlar
  └── reports        → Şikayetler
```

## JSONB Alan Örnekleri

### `listings.health_status`
```json
{
  "vaccinated": true,
  "neutered": false,
  "dewormed": true,
  "microchipped": false,
  "vet_checked": true
}
```

### `listings.traits`
```json
{
  "friendly": true,
  "indoor": true,
  "good_with_kids": true,
  "good_with_pets": false,
  "trained": false,
  "quiet": true
}
```

### `applications.form_responses`
```json
{
  "has_garden": true,
  "previous_pets": "2 kedi sahibiydim, birini kaybettim",
  "home_type": "apartment",
  "working_hours": "evden çalışıyorum",
  "family_members": 3
}
```

---

## RLS Test Etme

SQL Editor'da şu sorguları çalıştırarak RLS'nin çalıştığını doğrula:

```sql
-- Auth olmadan sadece aktif ilanlar gelmeli
SELECT * FROM listings LIMIT 5;

-- Tablo doğrudan erişilebilir olmamalı
SELECT * FROM messages LIMIT 5;
-- Sonuç: 0 satır (auth yok, RLS engelledi)
```

---

## Sıradaki Adım

Schema hazır! Şimdi sıra:
→ **Next.js web projesi kurulumu** (`apps/web/`)
→ Supabase bağlantısı + Auth akışı
→ İlan listeleme sayfası (SSR + SEO)
