-- ============================================================
-- HAYVAN SAHİPLENDİRME PLATFORMU
-- Migration 004: Storage Bucket Politikaları
-- Supabase Dashboard > Storage > listing-media bucket
-- oluşturduktan SONRA bu SQL'i çalıştır
-- ============================================================

-- ============================================================
-- STORAGE POLİTİKALARI
-- Bucket adı: listing-media
-- ============================================================

-- Herkes fotoğrafları görebilir (public okuma)
CREATE POLICY "storage: listing-media herkese açık"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-media');

-- Giriş yapmış kullanıcı kendi klasörüne yükleyebilir
-- Klasör yapısı: {user_id}/{listing_id}/{dosya_adı}
CREATE POLICY "storage: üye yükleyebilir"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Sadece dosyayı yükleyen kişi silebilir
CREATE POLICY "storage: sadece sahibi silebilir"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listing-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- KULLANICI AVATARLARI İÇİN AYRI BUCKET POLİTİKALARI
-- Bucket adı: avatars
-- ============================================================

CREATE POLICY "storage: avatarlar herkese açık"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "storage: üye avatar yükleyebilir"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage: üye avatar güncelleyebilir"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- TRUST SCORE OTOMATİK DÜŞÜRME FONKSİYONU
-- Bir kullanıcı 3+ şikayet aldığında trust_score düşer
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_report()
RETURNS TRIGGER AS $$
DECLARE
  report_count INT;
BEGIN
  -- Bu kullanıcıya karşı açık kaç şikayet var?
  SELECT COUNT(*) INTO report_count
  FROM reports
  WHERE reported_user_id = NEW.reported_user_id
    AND status = 'open';

  -- 3 veya daha fazla şikayet varsa trust_score'u düşür
  IF report_count >= 3 THEN
    UPDATE users
    SET trust_score = GREATEST(0, trust_score - 10)
    WHERE id = NEW.reported_user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_report_trust_score
  AFTER INSERT ON reports
  FOR EACH ROW
  WHEN (NEW.reported_user_id IS NOT NULL)
  EXECUTE FUNCTION handle_new_report();

-- ============================================================
-- VIEW_COUNT OTOMATİK ARTTIRMA FONKSİYONU
-- (Edge Function'dan çağrılır, doğrudan SQL'den de çalışır)
-- ============================================================

CREATE OR REPLACE FUNCTION increment_view_count(listing_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET view_count = view_count + 1
  WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- KONUŞMA LİSTESİ VIEW'I
-- Kullanıcının tüm konuşmalarını özet olarak getirir
-- ============================================================

CREATE OR REPLACE VIEW conversation_summaries AS
SELECT DISTINCT ON (
    LEAST(sender_id, receiver_id),
    GREATEST(sender_id, receiver_id),
    listing_id
  )
  m.id            AS last_message_id,
  m.listing_id,
  m.sender_id,
  m.receiver_id,
  m.content       AS last_message,
  m.created_at    AS last_message_at,
  m.is_read,
  l.pet_type,
  l.name          AS pet_name,
  l.city,
  lm.media_url    AS pet_photo
FROM messages m
JOIN listings l ON l.id = m.listing_id
LEFT JOIN listing_media lm ON lm.listing_id = m.listing_id AND lm.is_primary = true
ORDER BY
  LEAST(sender_id, receiver_id),
  GREATEST(sender_id, receiver_id),
  listing_id,
  m.created_at DESC;
