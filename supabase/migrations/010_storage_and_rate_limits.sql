-- ============================================================
-- Migration 010: Storage ve kötüye kullanım sınırları
-- 009_data_integrity_and_abuse_controls.sql'den sonra çalıştırılmalıdır.
-- ============================================================

-- Supabase Storage bucket ayarlarını SQL ile de sabitle.
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'listing-media';

UPDATE storage.buckets
SET file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'avatars';

DROP POLICY IF EXISTS "storage: üye yükleyebilir" ON storage.objects;
CREATE POLICY "storage: üye yalnız kendi ilanına yükleyebilir"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'listing-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND array_length(storage.foldername(name), 1) = 3
    AND EXISTS (
      SELECT 1
      FROM public.listings AS l
      JOIN public.users AS u ON u.id = l.user_id AND u.is_active = true
      WHERE l.user_id = (SELECT auth.uid())
        AND l.id::text = (storage.foldername(name))[2]
    )
  );

DROP POLICY IF EXISTS "storage: sadece sahibi silebilir" ON storage.objects;
CREATE POLICY "storage: yalnız kendi ilan dosyasını silebilir"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'listing-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND array_length(storage.foldername(name), 1) = 3
  );

DROP POLICY IF EXISTS "storage: üye avatar yükleyebilir" ON storage.objects;
CREATE POLICY "storage: yalnız kendi avatarını yükleyebilir"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND array_length(storage.foldername(name), 1) = 2
  );

DROP POLICY IF EXISTS "storage: üye avatar güncelleyebilir" ON storage.objects;
CREATE POLICY "storage: yalnız kendi avatarını güncelleyebilir"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND array_length(storage.foldername(name), 1) = 2
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND array_length(storage.foldername(name), 1) = 2
  );

-- Yeni içerik ve mesaj yazma, devre dışı hesaplar için kapalı olsun.
DROP POLICY IF EXISTS "listings: üye ilan oluşturabilir" ON public.listings;
CREATE POLICY "listings: aktif üye ilan oluşturabilir"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid()) AND is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_messages_sender_created_at
  ON public.messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_created_at
  ON public.reports(reporter_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.enforce_message_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT count(*) FROM public.messages
      WHERE sender_id = NEW.sender_id
        AND created_at > now() - interval '1 hour') >= 60 THEN
    RAISE EXCEPTION 'Saatlik mesaj gönderme limiti aşıldı.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_message_rate_limit ON public.messages;
CREATE TRIGGER trg_message_rate_limit
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.enforce_message_rate_limit();

CREATE OR REPLACE FUNCTION public.enforce_report_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT count(*) FROM public.reports
      WHERE reporter_id = NEW.reporter_id
        AND created_at > now() - interval '1 day') >= 20 THEN
    RAISE EXCEPTION 'Günlük şikayet gönderme limiti aşıldı.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_report_rate_limit ON public.reports;
CREATE TRIGGER trg_report_rate_limit
  BEFORE INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.enforce_report_rate_limit();
