import { createServerSupabase } from '@/lib/supabase-server'

export default async function Home() {
  const supabase = await createServerSupabase()

  // Oturum açmış kullanıcıyı al
  const { data: { user } } = await supabase.auth.getUser()

  const { data: ilanlar, error } = await supabase
    .from('listings')
    .select('*, listing_media(media_url, is_primary)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return <p>İlanlar yüklenirken hata oluştu.</p>
  }

  return (
    <main style={{ padding: '2rem' }}>

      {/* Üst bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>🐾 Sahiplendirilecek Hayvanlar</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ color: '#555' }}>{user.email}</span>
              <a href="/cikis" style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', textDecoration: 'none' }}>Çıkış</a>
              <a href="/ilan-olustur" style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>+ İlan Ver</a>
            </>
          ) : (
            <a href="/giris" style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>Giriş Yap</a>
          )}
        </div>
      </div>

      <p>{ilanlar.length} ilan bulundu</p>

      {/* İlan listesi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
        {ilanlar.map((ilan) => {
          const foto = ilan.listing_media?.find((m: any) => m.is_primary)?.media_url

          return (
            <a key={ilan.id} href={`/ilanlar/${ilan.id}`} style={{ textDecoration: 'none', color: 'inherit', border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', display: 'block' }}>
              {foto && (
                <img src={foto} alt={ilan.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
              )}
              <h2 style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>{ilan.name}</h2>
              <p>🐱 {ilan.pet_type} · {ilan.gender}</p>
              <p>📍 {ilan.city}{ilan.district ? `, ${ilan.district}` : ''}</p>
              <p>🗓 {ilan.age_months} aylık</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>{ilan.description?.slice(0, 100)}...</p>
            </a>
          )
        })}
      </div>

    </main>
  )
}
