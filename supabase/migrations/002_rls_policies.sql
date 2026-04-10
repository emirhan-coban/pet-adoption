-- ============================================================
-- HAYVAN SAHİPLENDİRME PLATFORMU
-- Migration 002: Row Level Security (RLS) Politikaları
-- 001_create_tables.sql'den SONRA çalıştır
-- ============================================================

-- ============================================================
-- RLS'yi tüm tablolarda etkinleştir
-- ============================================================

ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_media      ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports            ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS POLİTİKALARI
-- ============================================================

-- Herkes herkesi görebilir (ad, avatar - hassas alan yok)
CREATE POLICY "users: herkes okuyabilir"
  ON users FOR SELECT
  USING (true);

-- Sadece kendi profilini güncelleyebilir
CREATE POLICY "users: sadece kendini güncelleyebilir"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Yeni kullanıcı kaydı (auth ile eşleşmeli)
CREATE POLICY "users: kayıt olabilir"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- CORPORATE PROFILES POLİTİKALARI
-- ============================================================

-- Herkes kurumsal profilleri görebilir (güven için şeffaflık)
CREATE POLICY "corporate: herkes okuyabilir"
  ON corporate_profiles FOR SELECT
  USING (true);

-- Sadece kendi kurumsal profilini oluşturabilir/güncelleyebilir
CREATE POLICY "corporate: sadece kendisi yazabilir"
  ON corporate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "corporate: sadece kendisi güncelleyebilir"
  ON corporate_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- LISTINGS POLİTİKALARI
-- ============================================================

-- Herkes aktif ilanları görebilir
CREATE POLICY "listings: aktif ilanlar herkese açık"
  ON listings FOR SELECT
  USING (
    status = 'active'
    OR auth.uid() = user_id  -- ilan sahibi kendi pasif ilanlarını da görebilir
  );

-- Giriş yapmış kullanıcı ilan oluşturabilir
CREATE POLICY "listings: üye ilan oluşturabilir"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sadece ilan sahibi güncelleyebilir
CREATE POLICY "listings: sadece sahibi güncelleyebilir"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Sadece ilan sahibi silebilir
CREATE POLICY "listings: sadece sahibi silebilir"
  ON listings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- LISTING MEDIA POLİTİKALARI
-- ============================================================

-- Herkes ilan fotoğraflarını görebilir
CREATE POLICY "listing_media: herkes okuyabilir"
  ON listing_media FOR SELECT
  USING (true);

-- Sadece ilan sahibi fotoğraf ekleyebilir
CREATE POLICY "listing_media: ilan sahibi ekleyebilir"
  ON listing_media FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM listings WHERE id = listing_id
    )
  );

-- Sadece ilan sahibi fotoğraf silebilir
CREATE POLICY "listing_media: ilan sahibi silebilir"
  ON listing_media FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM listings WHERE id = listing_id
    )
  );

-- ============================================================
-- MESSAGES POLİTİKALARI
-- ============================================================

-- Mesajları sadece gönderen veya alıcı görebilir
CREATE POLICY "messages: sadece taraflar okuyabilir"
  ON messages FOR SELECT
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Giriş yapmış kullanıcı mesaj gönderebilir (kendi adına)
CREATE POLICY "messages: üye gönderebilir"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Mesajı sadece alıcı "okundu" olarak işaretleyebilir
CREATE POLICY "messages: alıcı güncelleyebilir"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- ============================================================
-- APPLICATIONS POLİTİKALARI
-- ============================================================

-- Başvuruyu sadece ilan sahibi veya başvuran görebilir
CREATE POLICY "applications: taraflar okuyabilir"
  ON applications FOR SELECT
  USING (
    auth.uid() = applicant_id
    OR auth.uid() IN (
      SELECT user_id FROM listings WHERE id = listing_id
    )
  );

-- Giriş yapmış kullanıcı başvuru yapabilir (kendi adına)
CREATE POLICY "applications: üye başvurabilir"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

-- İlan sahibi başvuru durumunu güncelleyebilir (kabul/red)
CREATE POLICY "applications: ilan sahibi güncelleyebilir"
  ON applications FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM listings WHERE id = listing_id
    )
  );

-- ============================================================
-- REPORTS POLİTİKALARI
-- ============================================================

-- Şikayetleri sadece şikayet eden görebilir (admin ayrıca yönetir)
CREATE POLICY "reports: sadece şikayet eden okuyabilir"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Giriş yapmış kullanıcı şikayet oluşturabilir
CREATE POLICY "reports: üye şikayet edebilir"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- ============================================================
-- FAVORITES POLİTİKALARI
-- ============================================================

-- Sadece kendi favorilerini görebilir
CREATE POLICY "favorites: sadece kendisi görebilir"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Kendi favorilerine ekleyebilir
CREATE POLICY "favorites: kendisi ekleyebilir"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Kendi favorilerinden çıkarabilir
CREATE POLICY "favorites: kendisi çıkarabilir"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
