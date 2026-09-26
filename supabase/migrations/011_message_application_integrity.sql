-- ============================================================
-- Migration 011: Mesaj ve başvuru akışında bütünlük kontrolleri
-- 010_storage_and_rate_limits.sql'den sonra çalıştırılmalıdır.
-- ============================================================

-- İlan sahibi yalnızca o ilan için daha önce iletişim kurulmuş
-- kullanıcılarla konuşmayı sürdürebilir. Böylece owner hesabı spam
-- göndermek için receiver_id'yi keyfi biçimde seçemez.
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
    JOIN public.users AS sender_user
      ON sender_user.id = (SELECT auth.uid())
     AND sender_user.is_active = true
    JOIN public.users AS receiver_user
      ON receiver_user.id = p_receiver_id
     AND receiver_user.is_active = true
    WHERE l.id = p_listing_id
      AND l.status = 'active'::public.listing_status
      AND p_receiver_id <> (SELECT auth.uid())
      AND (
        -- İlan sahibi yalnızca mevcut konuşmayı sürdürebilir.
        (
          l.user_id = (SELECT auth.uid())
          AND EXISTS (
            SELECT 1
            FROM public.messages AS prior_message
            WHERE prior_message.listing_id = l.id
              AND (
                (prior_message.sender_id = (SELECT auth.uid()) AND prior_message.receiver_id = p_receiver_id)
                OR (prior_message.sender_id = p_receiver_id AND prior_message.receiver_id = (SELECT auth.uid()))
              )
          )
        )
        -- İlan sahibi olmayan kullanıcı yalnızca ilan sahibine yazabilir.
        OR (l.user_id = p_receiver_id)
      )
  )
$$;

-- Başvuru işlemi yalnızca aktif ve başvuru formu açık ilanlarda,
-- başvuranın kendi adına yapılabilir.
CREATE OR REPLACE FUNCTION public.validate_application_input()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_listing public.listings%ROWTYPE;
BEGIN
  IF TG_OP = 'INSERT'
     AND (SELECT auth.uid()) IS NOT NULL
     AND NEW.applicant_id <> (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Başvuru yalnızca oturum sahibi adına oluşturulabilir.';
  END IF;

  SELECT * INTO v_listing
  FROM public.listings
  WHERE id = NEW.listing_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'İlan bulunamadı.';
  END IF;

  IF TG_OP = 'INSERT'
     AND (v_listing.status <> 'active'::public.listing_status
       OR v_listing.adoption_mode <> 'application_form'::public.adoption_mode) THEN
    RAISE EXCEPTION 'Bu ilan için başvuru alınmıyor.';
  END IF;

  IF TG_OP = 'UPDATE'
     AND (SELECT auth.uid()) IS NOT NULL
     AND v_listing.user_id <> (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Başvuruyu yalnızca ilan sahibi güncelleyebilir.';
  END IF;

  IF NEW.form_responses IS NULL THEN
    NEW.form_responses := '{}'::jsonb;
  END IF;
  IF pg_column_size(NEW.form_responses) > 32768 THEN
    RAISE EXCEPTION 'Başvuru formu çok büyük.';
  END IF;
  IF NEW.note IS NOT NULL AND char_length(NEW.note) > 2000 THEN
    RAISE EXCEPTION 'Başvuru notu çok uzun.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_application_input ON public.applications;
CREATE TRIGGER trg_validate_application_input
  BEFORE INSERT OR UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.validate_application_input();

-- İstemci yalnızca ilan sahibinin başvuru durumunu/notunu değiştirebilir;
-- applicant_id, listing_id ve oluşturulma alanları değiştirilemez.
REVOKE UPDATE ON TABLE public.applications FROM anon, authenticated;
GRANT UPDATE (status, note) ON TABLE public.applications TO authenticated;

COMMENT ON FUNCTION public.can_send_listing_message(uuid, uuid)
  IS 'İlan sahibi yalnızca mevcut konuşmayı sürdürür; diğer kullanıcılar yalnızca ilan sahibine yazar.';
