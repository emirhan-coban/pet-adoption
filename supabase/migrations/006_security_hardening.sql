-- ============================================================
-- HAYVAN SAHİPLENDİRME PLATFORMU
-- Migration 006: Güvenlik Sıkılaştırma
-- 005_auth_user_trigger.sql'den SONRA çalıştır
-- ============================================================

-- ============================================================
-- 1. ADMIN HELPER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. ADMIN OVERRIDE POLİTİKALARI
-- ============================================================

-- Reports: admin tüm raporları görebilir ve güncelleyebilir
CREATE POLICY "reports: admin okuyabilir"
  ON reports FOR SELECT
  USING (is_admin());

CREATE POLICY "reports: admin güncelleyebilir"
  ON reports FOR UPDATE
  USING (is_admin());

-- Reports: şikayet eden kendi raporunu silebilir
CREATE POLICY "reports: şikayet eden silebilir"
  ON reports FOR DELETE
  USING (auth.uid() = reporter_id);

-- Messages: admin flagged mesajları görebilir
CREATE POLICY "messages: admin okuyabilir"
  ON messages FOR SELECT
  USING (is_admin());

-- Messages: admin mesaj gizleyebilir (is_hidden güncelleme)
CREATE POLICY "messages: admin güncelleyebilir"
  ON messages FOR UPDATE
  USING (is_admin());

-- Corporate profiles: admin durum güncelleyebilir (onay/red)
CREATE POLICY "corporate: admin güncelleyebilir"
  ON corporate_profiles FOR UPDATE
  USING (is_admin());

-- Applications: admin tüm başvuruları görebilir
CREATE POLICY "applications: admin okuyabilir"
  ON applications FOR SELECT
  USING (is_admin());

-- Listings: admin tüm ilanları görebilir ve yönetebilir
CREATE POLICY "listings: admin okuyabilir"
  ON listings FOR SELECT
  USING (is_admin());

CREATE POLICY "listings: admin güncelleyebilir"
  ON listings FOR UPDATE
  USING (is_admin());

-- Users: admin tüm kullanıcıları görebilir ve yönetebilir
CREATE POLICY "users: admin güncelleyebilir"
  ON users FOR UPDATE
  USING (is_admin());

-- ============================================================
-- 3. EMAIL KISITLAMA (Column-Level Security)
-- email sadece Supabase Auth API'sinden erişilebilir
-- users tablosundan SELECT ile email okunamaz
-- ============================================================

REVOKE SELECT ON users FROM anon, authenticated;

-- Anon (giriş yapmamış): sadece public alanlar
GRANT SELECT (id, full_name, avatar_url, trust_score, role, is_active, created_at) ON users TO anon;

-- Authenticated (giriş yapmış): public alanlar + phone
-- (email Auth API'sinden gelir, tablodan okunmaz)
GRANT SELECT (id, full_name, avatar_url, trust_score, role, phone, is_active, created_at) ON users TO authenticated;

-- ============================================================
-- 4. VIEW COUNT RATE-LIMIT
-- Aynı kullanıcı/listing çifti günde max 1 kez artırabilir
-- ============================================================

CREATE TABLE IF NOT EXISTS view_count_tracker (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX idx_view_tracker_date ON view_count_tracker(viewed_at);

ALTER TABLE view_count_tracker ENABLE ROW LEVEL SECURITY;

-- Kullanıcı sadece kendi tracker kaydını oluşturabilir
CREATE POLICY "view_tracker: kendi kaydını ekleyebilir"
  ON view_count_tracker FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- view_count increment fonksiyonunu rate-limit ile güncelle
CREATE OR REPLACE FUNCTION increment_view_count(listing_uuid UUID)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  -- Giriş yapmamış kullanıcılar için rate-limit yok ama yine de artır
  IF v_user_id IS NULL THEN
    UPDATE listings SET view_count = view_count + 1 WHERE id = listing_uuid;
    RETURN;
  END IF;

  -- Bugün zaten artırmış mı kontrol et
  IF EXISTS (
    SELECT 1 FROM view_count_tracker
    WHERE user_id = v_user_id
      AND listing_id = listing_uuid
      AND viewed_at > now() - INTERVAL '24 hours'
  ) THEN
    RETURN; -- Bugün zaten artırmış, çık
  END IF;

  -- Tracker'a kaydet (UPSERT - 24 saatten eski kayıtlar güncellenir)
  INSERT INTO view_count_tracker (user_id, listing_id, viewed_at)
  VALUES (v_user_id, listing_uuid, now())
  ON CONFLICT (user_id, listing_id)
  DO UPDATE SET viewed_at = now()
  WHERE view_count_tracker.viewed_at < now() - INTERVAL '24 hours';

  -- Sadece başarılı upsert durumunda artır
  IF FOUND THEN
    UPDATE listings SET view_count = view_count + 1 WHERE id = listing_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eski tracker kayıtlarını temizle (günlük cron job ile çağrılabilir)
CREATE OR REPLACE FUNCTION cleanup_view_tracker()
RETURNS void AS $$
BEGIN
  DELETE FROM view_count_tracker
  WHERE viewed_at < now() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. İLAN LİMİTİ KONTROL FONKSİYONU
-- Bireysel: max 10 aktif ilan, Kurumsal: max 50
-- ============================================================

CREATE OR REPLACE FUNCTION check_listing_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
  v_count INT;
  v_max INT;
BEGIN
  SELECT role INTO v_role FROM users WHERE id = NEW.user_id;

  IF v_role = 'admin' THEN
    RETURN NEW; -- Admin için limit yok
  ELSIF v_role = 'corporate' THEN
    v_max := 50;
  ELSE
    v_max := 10;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM listings
  WHERE user_id = NEW.user_id AND status = 'active';

  IF v_count >= v_max THEN
    RAISE EXCEPTION 'İlan limiti aşıldı. Maksimum % aktif ilan oluşturabilirsiniz.', v_max;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_check_listing_limit
  BEFORE INSERT ON listings
  FOR EACH ROW
  EXECUTE FUNCTION check_listing_limit();

-- ============================================================
-- 6. MESAJ SCAM DETECTION TRIGGER
-- Mesaj gönderildiğinde şüpheli kelime kontrolü yapar
-- Tespit edilirse ai_flagged = true olarak işaretlenir
-- ============================================================

CREATE OR REPLACE FUNCTION check_message_safety()
RETURNS TRIGGER AS $$
DECLARE
  v_content_lower TEXT;
BEGIN
  v_content_lower := LOWER(NEW.content);

  -- Ödeme/dolandırıcılık keywords
  IF v_content_lower ~ '(ödeme|öde|kapora|depozito|deposit|havale|eft|iban|western\s*union|wire\s*transfer|bitcoin|kripto|crypto)'
  THEN
    NEW.ai_flagged := true;
  END IF;

  -- IBAN pattern tespiti (TR + 24 digit)
  IF NEW.content ~ 'TR\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}' THEN
    NEW.ai_flagged := true;
  END IF;

  -- URL tespiti (mesajda link gönderme uyarısı)
  IF NEW.content ~ 'https?://[^\s]+' THEN
    NEW.ai_flagged := true;
  END IF;

  -- Para birimi sembolleri + rakam kombinasyonu (örn: $500, 500₺, 1000 TL)
  IF v_content_lower ~ '(\$\s*\d+|\d+\s*₺|\d+\s*tl\b|\d+\s*dolar\b|\d+\s*euro\b|\d+\s*usd\b)' THEN
    NEW.ai_flagged := true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_message_safety
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION check_message_safety();

-- ============================================================
-- 7. MİNİMUM YAŞ KONTROL TRIGGER
-- Köpek: min 2 ay, Kedi: min 3 ay, Diğer: min 1 ay
-- ============================================================

CREATE OR REPLACE FUNCTION check_minimum_age()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.age_months IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.pet_type = 'dog' AND NEW.age_months < 2 THEN
    RAISE EXCEPTION 'Köpek yavruları en az 2 aylık (8 haftalık) olmalıdır.';
  ELSIF NEW.pet_type = 'cat' AND NEW.age_months < 3 THEN
    RAISE EXCEPTION 'Kedi yavruları en az 3 aylık (12 haftalık) olmalıdır.';
  ELSIF NEW.age_months < 1 THEN
    RAISE EXCEPTION 'Hayvan en az 1 aylık olmalıdır.';
  END IF;

  IF NEW.age_months > 360 THEN
    RAISE EXCEPTION 'Geçersiz yaş değeri. Maksimum 360 ay (30 yıl) girebilirsiniz.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_minimum_age
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION check_minimum_age();

-- ============================================================
-- 8. AÇIKLAMA ALANINDA TİCARİ SATIŞ TESPİTİ
-- İlan açıklamasında ücret/fiyat/satılık kelimeleri kontrol edilir
-- ============================================================

CREATE OR REPLACE FUNCTION check_listing_commercial()
RETURNS TRIGGER AS $$
DECLARE
  v_desc_lower TEXT;
BEGIN
  IF NEW.description IS NULL THEN
    RETURN NEW;
  END IF;

  v_desc_lower := LOWER(NEW.description);

  IF v_desc_lower ~ '(satılık|satilik|fiyatı|fiyati|ücretli|ucretli|tl\b|dolar|euro|\$\d|\d+\s*tl|\d+\s*₺|kapora|pazarlıklı|pazarlikli|ciddi alıcı|ciddi alici)' THEN
    RAISE EXCEPTION 'Bu platform ticari satış için değildir. Sadece ücretsiz sahiplendirme yapılabilir. İlan açıklamasından fiyat/ücret bilgilerini kaldırın.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_listing_commercial
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION check_listing_commercial();
