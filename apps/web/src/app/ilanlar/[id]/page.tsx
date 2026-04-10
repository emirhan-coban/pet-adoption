import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export default async function IlanDetay({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = createClient()

    const { data: ilan, error } = await supabase
        .from('listings')
        .select('*, listing_media(media_url, is_primary)')
        .eq('id', id)
        .eq('status', 'active')
        .single()

    const fotograflar = ilan.listing_media ?? []
    const anaFoto = fotograflar.find((f: any) => f.is_primary)?.media_url

    return (
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>

            {/* Geri butonu */}
            <a href="/" style={{ color: '#666', textDecoration: 'none' }}>← Tüm İlanlara Dön</a>

            {/* Ana fotoğraf */}
            {anaFoto && (
                <img
                    src={anaFoto}
                    alt={ilan.name}
                    style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px', marginTop: '1rem' }}
                />
            )}

            {/* Başlık */}
            <h1 style={{ marginTop: '1.5rem' }}>{ilan.name}</h1>

            {/* Temel bilgiler */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem', color: '#555' }}>
                <span>🐾 {ilan.pet_type}</span>
                <span>⚥ {ilan.gender}</span>
                <span>🗓 {ilan.age_months} aylık</span>
                {ilan.breed && <span>🏷 {ilan.breed}</span>}
                <span>📍 {ilan.city}{ilan.district ? `, ${ilan.district}` : ''}</span>
            </div>

            {/* Açıklama */}
            <p style={{ marginTop: '1.5rem', lineHeight: '1.7' }}>{ilan.description}</p>

            {/* Sağlık durumu */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                <h3>Sağlık Durumu</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {ilan.health_status?.vaccinated && <span style={{ background: '#d4edda', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem' }}>✅ Aşılı</span>}
                    {ilan.health_status?.neutered && <span style={{ background: '#d4edda', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem' }}>✅ Kısırlaştırılmış</span>}
                    {ilan.health_status?.dewormed && <span style={{ background: '#d4edda', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem' }}>✅ Parazit Tedavisi</span>}
                    {ilan.health_status?.microchipped && <span style={{ background: '#d4edda', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem' }}>✅ Mikroçipli</span>}
                </div>
            </div>



            {/* Mesaj butonu */}
            <a href={`/mesajlar/${ilan.id}`} style={{
                marginTop: '1.5rem',
                display: 'block',
                width: '100%',
                padding: '1rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'none',
                boxSizing: 'border-box' as any,
            }}>
                💬 Mesaj Gönder
            </a>

        </main>
    )
}