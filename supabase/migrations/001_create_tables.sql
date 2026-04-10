-- ============================================================
-- HAYVAN SAHİPLENDİRME PLATFORMU
-- Migration 001: Ana Tablolar
-- Supabase SQL Editor'da bu dosyayı çalıştır
-- ============================================================

-- -----------------------
-- ENUM TİPLERİ
-- -----------------------

CREATE TYPE user_role AS ENUM ('individual', 'corporate', 'admin');
CREATE TYPE corporate_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE pet_type AS ENUM ('cat', 'dog', 'bird', 'rabbit', 'other');
CREATE TYPE pet_gender AS ENUM ('male', 'female', 'unknown');
CREATE TYPE listing_status AS ENUM ('active', 'adopted', 'hidden');
CREATE TYPE adoption_mode AS ENUM ('bulletin', 'application_form');
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');
CREATE TYPE report_status AS ENUM ('open', 'investigating', 'resolved');

-- -----------------------
-- USERS
-- -----------------------

CREATE TABLE users (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  role          user_role DEFAULT 'individual',
  full_name     VARCHAR(255),
  phone         VARCHAR(20),
  avatar_url    VARCHAR(500),
  trust_score   SMALLINT DEFAULT 100 CHECK (trust_score BETWEEN 0 AND 100),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON COLUMN users.trust_score IS '0-100 arası güven skoru. Şikayetlerle düşer.';

-- -----------------------
-- CORPORATE PROFILES
-- -----------------------

CREATE TABLE corporate_profiles (
  user_id           UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  organization_name VARCHAR(255) NOT NULL,
  tax_id            VARCHAR(20),
  derbis_no         VARCHAR(50),               -- Dernek kütük numarası
  address           TEXT,
  document_url      VARCHAR(500),              -- e-Devlet faaliyet belgesi PDF
  status            corporate_status DEFAULT 'pending',
  reviewed_at       TIMESTAMP WITH TIME ZONE,
  reviewed_by       UUID REFERENCES users(id)  -- Admin kullanıcı
);

COMMENT ON COLUMN corporate_profiles.derbis_no IS 'Hayvan barınağı/dernek kütük numarası';
COMMENT ON COLUMN corporate_profiles.document_url IS 'e-Devlet''ten alınan faaliyet belgesi';

-- -----------------------
-- LISTINGS (İLANLAR)
-- -----------------------

CREATE TABLE listings (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_type        pet_type NOT NULL,
  breed           VARCHAR(100),
  name            VARCHAR(100),
  age_months      SMALLINT CHECK (age_months >= 0),
  gender          pet_gender DEFAULT 'unknown',
  city            VARCHAR(100) NOT NULL,
  district        VARCHAR(100),
  health_status   JSONB DEFAULT '{}',          -- {vaccinated: true, neutered: false, ...}
  traits          JSONB DEFAULT '{}',          -- {friendly: true, indoor: true, ...}
  description     TEXT,
  petvet_chip_id  VARCHAR(20),                 -- PETVET mikroçip numarası (opsiyonel)
  adoption_mode   adoption_mode DEFAULT 'bulletin',
  status          listing_status DEFAULT 'active',
  view_count      INT DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON COLUMN listings.health_status IS 'Örnek: {"vaccinated": true, "neutered": false, "dewormed": true}';
COMMENT ON COLUMN listings.traits IS 'Örnek: {"friendly": true, "indoor": true, "good_with_kids": false}';
COMMENT ON COLUMN listings.adoption_mode IS 'bulletin: direkt iletişim, application_form: başvuru formu';

-- Performans indeksleri
CREATE INDEX idx_listings_city         ON listings(city);
CREATE INDEX idx_listings_pet_type     ON listings(pet_type, status);
CREATE INDEX idx_listings_user         ON listings(user_id);
CREATE INDEX idx_listings_status       ON listings(status);
CREATE INDEX idx_listings_created_at   ON listings(created_at DESC);

-- -----------------------
-- LISTING MEDIA (FOTOĞRAFLAR)
-- -----------------------

CREATE TABLE listing_media (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  media_url   VARCHAR(500) NOT NULL,
  is_primary  BOOLEAN DEFAULT false,
  order_index SMALLINT DEFAULT 0
);

CREATE INDEX idx_listing_media_listing ON listing_media(listing_id);

-- -----------------------
-- MESSAGES (MESAJLAŞMA)
-- -----------------------

CREATE TABLE messages (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  is_read       BOOLEAN DEFAULT false,
  ai_flagged    BOOLEAN DEFAULT false,   -- AI moderasyon bayrağı
  is_hidden     BOOLEAN DEFAULT false,   -- Moderatör tarafından gizlendi
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON COLUMN messages.ai_flagged IS 'GPT-4o-mini tarafından şüpheli bulunan mesajlar';

CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, listing_id);
CREATE INDEX idx_messages_receiver     ON messages(receiver_id, is_read);
CREATE INDEX idx_messages_listing      ON messages(listing_id);
CREATE INDEX idx_messages_flagged      ON messages(ai_flagged) WHERE ai_flagged = true;

-- -----------------------
-- APPLICATIONS (BAŞVURULAR)
-- -----------------------

CREATE TABLE applications (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id     UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  applicant_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  form_responses JSONB DEFAULT '{}',    -- Dinamik form cevapları
  status         application_status DEFAULT 'pending',
  note           TEXT,                  -- İlan sahibinin notu
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bir kullanıcı bir ilana sadece bir kez başvurabilir
CREATE UNIQUE INDEX idx_one_application ON applications(listing_id, applicant_id);
CREATE INDEX idx_applications_listing   ON applications(listing_id);
CREATE INDEX idx_applications_applicant ON applications(applicant_id);

-- -----------------------
-- REPORTS (ŞİKAYETLER)
-- -----------------------

CREATE TABLE reports (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  listing_id       UUID REFERENCES listings(id) ON DELETE SET NULL,
  reason           VARCHAR(100) NOT NULL,
  description      TEXT,
  status           report_status DEFAULT 'open',
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_reports_status        ON reports(status);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id);

-- -----------------------
-- FAVORITES (FAVORİLER)
-- -----------------------

CREATE TABLE favorites (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

-- -----------------------
-- updated_at OTOMATİK GÜNCELLEME
-- -----------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
