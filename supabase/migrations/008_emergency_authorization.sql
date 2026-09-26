-- ============================================================
-- Migration 008: Acil yetkilendirme sıkılaştırması
-- 001-007 production'da çalıştırıldıktan sonra çalıştırılmalıdır.
-- Mevcut kullanıcı ve ilan verilerini silmez.
-- ============================================================

-- users tablosunda istemciye tablo-geneli yazma yetkisi bırakma.
-- Yeni kullanıcı satırı handle_new_user() SECURITY DEFINER trigger'ı ile oluşur.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.users FROM anon, authenticated;
GRANT SELECT (id, full_name, avatar_url, trust_score, role, is_active, created_at)
  ON TABLE public.users TO anon, authenticated;

-- Profilin telefon alanına yalnızca sahip olan kullanıcı, kontrollü RPC ile erişebilir.
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE (
  full_name varchar(255),
  phone varchar(20),
  avatar_url varchar(500)
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT u.full_name, u.phone, u.avatar_url
  FROM public.users AS u
  WHERE u.id = (SELECT auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.update_my_profile(
  p_full_name varchar(255),
  p_phone varchar(20) DEFAULT NULL,
  p_avatar_url varchar(500) DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Oturum bulunamadı';
  END IF;

  IF p_full_name IS NULL OR btrim(p_full_name) = '' THEN
    RAISE EXCEPTION 'Ad soyad boş bırakılamaz';
  END IF;

  UPDATE public.users
  SET full_name = btrim(p_full_name),
      phone = NULLIF(btrim(p_phone), ''),
      avatar_url = CASE
        WHEN p_avatar_url IS NULL THEN avatar_url
        ELSE NULLIF(btrim(p_avatar_url), '')
      END
  WHERE id = (SELECT auth.uid());
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_profile() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_my_profile(varchar, varchar, varchar) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_my_profile(varchar, varchar, varchar) TO authenticated;

-- View owner yetkisiyle değil, sorguyu yapan rolün yetkileriyle çalışsın.
-- Böylece messages RLS politikaları conversation_summaries üzerinden de uygulanır.
ALTER VIEW public.conversation_summaries SET (security_invoker = true);

-- SECURITY DEFINER fonksiyonların arama yolunu sabitle.
ALTER FUNCTION public.is_admin() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_report() SET search_path = public, pg_temp;
ALTER FUNCTION public.increment_view_count(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.cleanup_view_tracker() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_listing_limit() SET search_path = public, pg_temp;
ALTER FUNCTION public.delete_user_account() SET search_path = public, pg_temp;

-- Doğrudan RPC ile çağrılması gerekmeyen bakım fonksiyonlarını kapat.
REVOKE ALL ON FUNCTION public.cleanup_view_tracker() FROM PUBLIC, anon, authenticated;
-- Görüntülenme sayacı sayfa görüntüleme akışında anon/authenticated tarafından çağrılır.
GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid) TO anon, authenticated;
-- is_admin politika ifadelerinde authenticated rolü tarafından çağrılır.
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

COMMENT ON FUNCTION public.get_my_profile() IS 'Kullanıcının yalnız kendi hassas profil alanlarını döndürür.';
COMMENT ON FUNCTION public.update_my_profile(varchar, varchar, varchar) IS 'Profil alanlarını yalnız oturum sahibinin güncellemesine izin verir.';
