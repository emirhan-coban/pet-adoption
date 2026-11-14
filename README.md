# 🐾 Pet Adoption Platform

Pet adoption platform with a **Next.js web app** and a **React Native (Expo) mobile app** sharing one **Supabase** backend (Postgres, Auth, Storage, Row Level Security).

| Part | Stack |
|---|---|
| `apps/web` | Next.js, TypeScript |
| `apps/mobile` | React Native, Expo, TypeScript |
| `supabase` | SQL migrations, RLS policies, storage rules, auth triggers |

The sections below (Turkish) describe the Supabase setup order.

---

# 🐾 Hayvan Sahiplendirme Platformu — Supabase Kurulum Rehberi

## Dosya Sırası

Migration dosyalarını **bu sırayla** Supabase SQL Editor'da çalıştır:

| # | Dosya | İçerik | Zorunlu mu? |
|---|-------|---------|------------|
| 1 | `001_create_tables.sql` | Tüm tablolar, indeksler, enum tipler | ✅ Evet |
| 2 | `002_rls_policies.sql` | Row Level Security politikaları | ✅ Evet |
| 3 | `003_seed_dev.sql` | Örnek veri (geliştirme için) | ⚠️ Sadece dev |
| 4 | `004_storage_and_functions.sql` | Storage politikaları, trigger'lar, view'lar | ✅ Evet |
| 5 | `005_auth_user_trigger.sql` | Auth kullanıcı trigger'ı | ✅ Evet |
| 6 | `006_security_hardening.sql` | Admin/RLS ve güvenlik kontrolleri | ✅ Evet |
| 7 | `007_account_deletion.sql` | Hesap silme | ✅ Evet |
| 8 | `008_emergency_authorization.sql` | Acil yetki ve hassas profil kısıtları | ✅ Üretimde zorunlu |
| 9 | `009_data_integrity_and_abuse_controls.sql` | Mesaj, rapor ve ilan bütünlüğü | ✅ Üretimde zorunlu |
| 10 | `010_storage_and_rate_limits.sql` | Storage kısıtları ve rate limit | ✅ Üretimde zorunlu |
| 11 | `011_message_application_integrity.sql` | Mesaj ve başvuru bütünlüğü | ✅ Üretimde zorunlu |

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
5. `005_auth_user_trigger.sql`, `006_security_hardening.sql` ve `007_account_deletion.sql` çalıştır
6. Üretimde mevcut veriler için yedek aldıktan sonra `008`, `009`, `010` ve `011` migration'larını sırayla çalıştır
7. (Opsiyonel, sadece geliştirme için) `003_seed_dev.sql` çalıştır

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
CRON_SECRET=uzun-rastgele-vercel-cron-sirri
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

> **Not:** `corporate_profiles` ve `applications` tabloları şu an web/mobile
> UI'da kullanılmıyor — şema gelecekteki "kurumsal hesap" ve "başvuru formu"
> özellikleri için hazır bekletiliyor, henüz bir sayfa/route bunlara referans
> vermiyor.

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
