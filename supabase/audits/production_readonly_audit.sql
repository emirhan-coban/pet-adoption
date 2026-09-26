-- ÜRETİM VERİ DENETİMİ — YALNIZCA OKUMA
-- Bu dosya veri değiştirmez. Sonuçları yalnızca yetkili ekip paylaşımında kullanın.

-- Meşru admin allowlist'iyle karşılaştırılacak rol dağılımı.
SELECT role, is_active, count(*) AS user_count
FROM public.users
GROUP BY role, is_active
ORDER BY role, is_active;

-- Aktif ilan limiti ihlalleri.
SELECT user_id, count(*) AS active_listing_count
FROM public.listings
WHERE status = 'active'
GROUP BY user_id
HAVING count(*) > 10
ORDER BY active_listing_count DESC;

-- İlan sahibi olmayan taraflar arasında mesajlaşma şüphesi.
SELECT m.id, m.listing_id, m.sender_id, m.receiver_id, m.created_at
FROM public.messages AS m
JOIN public.listings AS l ON l.id = m.listing_id
WHERE m.sender_id <> l.user_id AND m.receiver_id <> l.user_id
ORDER BY m.created_at DESC;

-- Aynı kullanıcının aynı ilanı tekrar tekrar raporlaması.
SELECT reporter_id, listing_id, count(*) AS report_count
FROM public.reports
WHERE listing_id IS NOT NULL
GROUP BY reporter_id, listing_id
HAVING count(*) > 1
ORDER BY report_count DESC;

-- İlanla eşleşmeyen rapor hedefleri.
SELECT r.id, r.listing_id, r.reported_user_id, l.user_id AS listing_owner_id
FROM public.reports AS r
LEFT JOIN public.listings AS l ON l.id = r.listing_id
WHERE r.listing_id IS NOT NULL
  AND r.reported_user_id IS DISTINCT FROM l.user_id;

-- Şüpheli derecede büyük veya sınırsız mesajlar.
SELECT id, sender_id, receiver_id, char_length(content) AS content_length, created_at
FROM public.messages
WHERE char_length(content) > 4000
ORDER BY content_length DESC;

-- Kullanıcı klasörü dışında veya ilanı bulunmayan listing-media nesneleri.
SELECT o.name, o.created_at, o.metadata
FROM storage.objects AS o
WHERE o.bucket_id = 'listing-media'
  AND NOT EXISTS (
    SELECT 1
    FROM public.listings AS l
    WHERE l.user_id::text = split_part(o.name, '/', 1)
      AND l.id::text = split_part(o.name, '/', 2)
  );

-- Dosya URL'lerinin beklenen Storage bucket'ı dışına çıkan listing_media kayıtları.
SELECT id, listing_id, media_url
FROM public.listing_media
WHERE media_url NOT LIKE '%/storage/v1/object/public/listing-media/%';
