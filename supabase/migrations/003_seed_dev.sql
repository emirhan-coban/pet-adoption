-- ============================================================
-- HAYVAN SAHİPLENDİRME PLATFORMU
-- Migration 003: Geliştirme Ortamı için Örnek Veri (Seed)
-- SADECE geliştirme ortamında çalıştır, production'da ÇALIŞTIIRMA
-- ============================================================

-- ============================================================
-- ÖRNEK KULLANICILAR
-- NOT: Bu ID'ler Supabase Auth'daki kullanıcılarla eşleşmeli.
--      Gerçek test için önce Auth'dan kullanıcı oluştur,
--      sonra bu ID'leri değiştir.
-- ============================================================

INSERT INTO users (id, email, role, full_name, phone, trust_score) VALUES
  ('00000000-0000-0000-0000-000000000001', 'ahmet@test.com',    'individual', 'Ahmet Yılmaz',    '5551234567', 100),
  ('00000000-0000-0000-0000-000000000002', 'ayse@test.com',     'individual', 'Ayşe Kaya',       '5557654321', 95),
  ('00000000-0000-0000-0000-000000000003', 'barinak@test.com',  'corporate',  'İstanbul Barınak', '5559876543', 100),
  ('00000000-0000-0000-0000-000000000004', 'admin@test.com',    'admin',      'Admin Kullanıcı',  NULL,         100);

-- ============================================================
-- ÖRNEK KURUMSAL PROFİL
-- ============================================================

INSERT INTO corporate_profiles (user_id, organization_name, tax_id, derbis_no, address, status) VALUES
  (
    '00000000-0000-0000-0000-000000000003',
    'İstanbul Hayvan Barınağı Derneği',
    '1234567890',
    'DRB-2024-001',
    'Kadıköy, İstanbul',
    'approved'
  );

-- ============================================================
-- ÖRNEK İLANLAR
-- ============================================================

INSERT INTO listings (id, user_id, pet_type, breed, name, age_months, gender, city, district, health_status, traits, description, adoption_mode, status) VALUES
  (
    '11111111-1111-1111-1111-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'cat',
    'Van Kedisi',
    'Pamuk',
    8,
    'female',
    'İstanbul',
    'Kadıköy',
    '{"vaccinated": true, "neutered": false, "dewormed": true}',
    '{"friendly": true, "indoor": true, "good_with_kids": true, "good_with_pets": false}',
    'Pamuk çok sevecen ve oyuncu bir dişi kedi. Aşıları tam, iç parazit tedavisi yapıldı. Sevgi dolu bir yuva arıyor.',
    'bulletin',
    'active'
  ),
  (
    '11111111-1111-1111-1111-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'dog',
    'Karışık Irk',
    'Karamel',
    24,
    'male',
    'İstanbul',
    'Beşiktaş',
    '{"vaccinated": true, "neutered": true, "dewormed": true, "microchipped": true}',
    '{"friendly": true, "indoor": false, "good_with_kids": true, "good_with_pets": true, "trained": true}',
    'Karamel 2 yaşında, kısırlaştırılmış, mikroçipli bir erkek köpek. Komutları biliyor, çocuklarla ve diğer köpeklerle anlaşıyor.',
    'application_form',
    'active'
  ),
  (
    '11111111-1111-1111-1111-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'cat',
    'Sokak Kedisi',
    'Minnoş',
    3,
    'female',
    'İstanbul',
    'Üsküdar',
    '{"vaccinated": false, "neutered": false, "dewormed": true}',
    '{"friendly": true, "indoor": true, "good_with_kids": true}',
    'Barınaktan 3 aylık dişi yavru kedi. Henüz aşı takvimi devam ediyor. Sahiplenildiğinde ilk aşı bilgileri verilecek.',
    'bulletin',
    'active'
  ),
  (
    '11111111-1111-1111-1111-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'rabbit',
    'Holland Lop',
    'Tofu',
    6,
    'male',
    'Ankara',
    'Çankaya',
    '{"vaccinated": false, "neutered": false}',
    '{"friendly": true, "indoor": true, "quiet": true}',
    'Tofu sakin ve uysal bir Holland Lop tavşan. Apartman hayatına çok uygun, az yer kaplıyor.',
    'bulletin',
    'active'
  );

-- ============================================================
-- ÖRNEK MESAJLAR
-- ============================================================

INSERT INTO messages (sender_id, receiver_id, listing_id, content, is_read) VALUES
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-000000000001',
    'Merhaba, Pamuk hakkında bilgi alabilir miyim? Apartmanda yaşıyorum, uygun olur mu?',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-000000000001',
    'Merhaba! Evet, Pamuk apartmana çok uygun. İçeride kalmayı seviyor. Sizi görüşmeye çağırabilir miyim?',
    false
  );

-- ============================================================
-- ÖRNEK FAVORİLER
-- ============================================================

INSERT INTO favorites (user_id, listing_id) VALUES
  ('00000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-000000000001'),
  ('00000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-000000000003');
