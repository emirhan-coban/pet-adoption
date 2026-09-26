-- ============================================================
-- Migration 009: Mesaj, rapor ve ilan veri bütünlüğü
-- 008_emergency_authorization.sql'den sonra çalıştırılmalıdır.
-- ============================================================

-- Telefon ve kurumsal belgeler genel kullanıcı sorgularına açık kalmasın.
REVOKE SELECT ON TABLE public.corporate_profiles FROM anon, authenticated;

DROP POLICY IF EXISTS "listing_media: herkes okuyabilir" ON public.listing_media;
CREATE POLICY "listing_media: yalnız aktif ilan medyası okunabilir"
  ON public.listing_media FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.listings AS l
      WHERE l.id = listing_id
        AND (l.status = 'active'::public.listing_status OR l.user_id = (SELECT auth.uid()))
    )
  );

-- Mesajlar yalnızca ilan sahibi ile ilanla iletişime geçen/iletişim kuracak
-- kullanıcı arasında oluşabilir. İstemcinin receiver_id'sine güvenilmez.
CREATE OR REPLACE FUNCTION public.can_send_listing_message(
  p_listing_id uuid,
  p_receiver_id uuid
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.listings AS l
    JOIN public.users AS o ON o.id = l.user_id AND o.is_active = true
    JOIN public.users AS r ON r.id = p_receiver_id AND r.is_active = true
    WHERE l.id = p_listing_id
      AND l.status = 'active'::public.listing_status
      AND (l.user_id = (SELECT auth.uid()) OR l.user_id = p_receiver_id)
      AND p_receiver_id <> (SELECT auth.uid())
  )
$$;

REVOKE ALL ON FUNCTION public.can_send_listing_message(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_send_listing_message(uuid, uuid) TO authenticated;

DROP POLICY IF EXISTS "messages: üye gönderebilir" ON public.messages;
CREATE POLICY "messages: taraflar mesaj gönderebilir"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND public.can_send_listing_message(listing_id, receiver_id)
    AND char_length(content) BETWEEN 1 AND 4000
  );

DROP POLICY IF EXISTS "messages: sadece taraflar okuyabilir" ON public.messages;
CREATE POLICY "messages: taraflar gizlenmemiş mesajları okuyabilir"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    is_hidden = false
    AND ((SELECT auth.uid()) = sender_id OR (SELECT auth.uid()) = receiver_id)
  );

-- Alıcı yalnızca okundu bilgisini değiştirebilir; içerik ve taraflar değiştirilemez.
REVOKE UPDATE ON TABLE public.messages FROM anon, authenticated;
GRANT UPDATE (is_read) ON TABLE public.messages TO authenticated;

CREATE OR REPLACE FUNCTION public.validate_message_input()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.content IS NULL OR char_length(btrim(NEW.content)) NOT BETWEEN 1 AND 4000 THEN
    RAISE EXCEPTION 'Mesaj 1-4000 karakter arasında olmalıdır.';
  END IF;
  NEW.content := btrim(NEW.content);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_message_input ON public.messages;
CREATE TRIGGER trg_validate_message_input
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.validate_message_input();

-- Görünüm sayacı ve ilan sahipliği kullanıcı tarafından değiştirilemez.
CREATE OR REPLACE FUNCTION public.protect_listing_system_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') THEN
    IF NEW.user_id <> OLD.user_id THEN
      RAISE EXCEPTION 'İlan sahibi değiştirilemez.';
    END IF;
    NEW.view_count := OLD.view_count;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_listing_system_fields ON public.listings;
CREATE TRIGGER trg_protect_listing_system_fields
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.protect_listing_system_fields();

-- Gizlenmiş/adopted ilanı yeniden aktifleştirme, aktif ilan limitini aşamasın.
CREATE OR REPLACE FUNCTION public.check_listing_reactivation_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role public.user_role;
  v_limit integer;
  v_count integer;
BEGIN
  IF OLD.status <> 'active'::public.listing_status
     AND NEW.status = 'active'::public.listing_status THEN
    SELECT role INTO v_role FROM public.users WHERE id = NEW.user_id;
    v_limit := CASE WHEN v_role = 'corporate'::public.user_role THEN 50 ELSE 10 END;
    SELECT count(*) INTO v_count
    FROM public.listings
    WHERE user_id = NEW.user_id
      AND status = 'active'::public.listing_status
      AND id <> NEW.id;
    IF v_count >= v_limit THEN
      RAISE EXCEPTION 'Aktif ilan limiti aşıldı.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_listing_reactivation_limit ON public.listings;
CREATE TRIGGER trg_check_listing_reactivation_limit
  BEFORE UPDATE OF status ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.check_listing_reactivation_limit();

-- Otomatik güven skoru düşürmeyi durdur; raporlar moderasyon kararı olmadan
-- itibarı değiştirmemelidir.
DROP TRIGGER IF EXISTS trg_report_trust_score ON public.reports;

CREATE OR REPLACE FUNCTION public.normalize_report_target()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.listing_id IS NOT NULL THEN
    SELECT user_id INTO NEW.reported_user_id
    FROM public.listings
    WHERE id = NEW.listing_id;
    IF NEW.reported_user_id IS NULL THEN
      RAISE EXCEPTION 'İlan bulunamadı.';
    END IF;
    IF NEW.reported_user_id = NEW.reporter_id THEN
      RAISE EXCEPTION 'Kendi ilanınız için şikayet oluşturamazsınız.';
    END IF;
  END IF;
  IF char_length(btrim(NEW.reason)) NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'Geçersiz şikayet nedeni.';
  END IF;
  IF NEW.description IS NOT NULL AND char_length(NEW.description) > 2000 THEN
    RAISE EXCEPTION 'Şikayet açıklaması çok uzun.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_report_target ON public.reports;
CREATE TRIGGER trg_normalize_report_target
  BEFORE INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.normalize_report_target();

DROP POLICY IF EXISTS "reports: üye şikayet edebilir" ON public.reports;
CREATE POLICY "reports: üye şikayet edebilir"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = (SELECT auth.uid()));

-- Başvurular henüz arayüzde kullanılmıyor; istemciden hassas alan güncellemesi
-- açılmamalı. Yönetim işlemleri service_role/admin RPC üzerinden yapılır.
REVOKE UPDATE ON TABLE public.applications FROM anon, authenticated;
