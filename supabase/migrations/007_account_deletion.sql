-- ============================================================
-- HAYVAN SAHİPLENDİRME PLATFORMU
-- Migration 007: Hesap Silme Fonksiyonu
-- 006_security_hardening.sql'den SONRA çalıştır
-- ============================================================

-- ============================================================
-- 1. HESAP SİLME FONKSİYONU
-- Kullanıcı hesabını ve tüm ilişkili verileri siler
-- Storage dosyaları ayrıca temizlenmelidir
-- ============================================================

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_listing_ids UUID[];
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Kullanıcı bulunamadı';
  END IF;

  -- Admin hesapları silinemez
  IF EXISTS (SELECT 1 FROM users WHERE id = v_user_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Admin hesapları silinemez';
  END IF;

  -- Kullanıcının tüm ilan ID'lerini al
  SELECT ARRAY_AGG(id) INTO v_listing_ids FROM listings WHERE user_id = v_user_id;

  -- İlan medya kayıtlarını sil
  IF v_listing_ids IS NOT NULL THEN
    DELETE FROM listing_media WHERE listing_id = ANY(v_listing_ids);
  END IF;

  -- İlanları sil (cascade ile listing_media da silinir ama garanti olsun)
  DELETE FROM listings WHERE user_id = v_user_id;

  -- Mesajları sil (gönderen veya alan)
  DELETE FROM messages WHERE sender_id = v_user_id OR receiver_id = v_user_id;

  -- Favorileri sil
  DELETE FROM favorites WHERE user_id = v_user_id;

  -- Başvuruları sil
  DELETE FROM applications WHERE applicant_id = v_user_id;

  -- Raporları sil (kullanıcının yaptığı raporlar)
  DELETE FROM reports WHERE reporter_id = v_user_id;

  -- Kullanıcıya yapılan raporları sil
  DELETE FROM reports WHERE reported_user_id = v_user_id;

  -- View tracker'ı sil
  DELETE FROM view_count_tracker WHERE user_id = v_user_id;

  -- Kurumsal profili sil (varsa)
  DELETE FROM corporate_profiles WHERE user_id = v_user_id;

  -- Kullanıcıyı sil
  DELETE FROM users WHERE id = v_user_id;

  -- Auth kullanıcısını sil (Supabase Auth API ile yapılmalı)
  -- NOT: Bu kısım uygulama tarafında supabase.auth.admin.deleteUser() ile yapılmalı
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. HESAP SİLME İÇİN RLS POLİTİKASI
-- Sadece kendi hesabını silebilir
-- ============================================================

CREATE POLICY "users: kendi hesabını silebilir"
  ON users FOR DELETE
  USING (auth.uid() = id);
