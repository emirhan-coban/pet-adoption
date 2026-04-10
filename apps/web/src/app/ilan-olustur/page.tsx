'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function IlanOlustur() {
    const supabase = createClient()

    const [yukleniyor, setYukleniyor] = useState(false)
    const [mesaj, setMesaj] = useState('')

    const [form, setForm] = useState({
        name: '',
        pet_type: 'cat',
        breed: '',
        age_months: '',
        gender: 'unknown',
        city: '',
        district: '',
        description: '',
        vaccinated: false,
        neutered: false,
        dewormed: false,
    })

    function guncelle(alan: string, deger: any) {
        setForm((prev) => ({ ...prev, [alan]: deger }))
    }

    async function ilanOlustur() {
        setYukleniyor(true)
        setMesaj('')

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            window.location.href = '/giris'
            return
        }

        const { error } = await supabase.from('listings').insert({
            user_id: user.id,
            name: form.name,
            pet_type: form.pet_type,
            breed: form.breed,
            age_months: parseInt(form.age_months) || 0,
            gender: form.gender,
            city: form.city,
            district: form.district,
            description: form.description,
            health_status: {
                vaccinated: form.vaccinated,
                neutered: form.neutered,
                dewormed: form.dewormed,
            },
            status: 'active',
        })

        if (error) {
            setMesaj('Hata: ' + error.message)
        } else {
            window.location.href = '/'
        }

        setYukleniyor(false)
    }

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        marginBottom: '1rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxSizing: 'border-box' as any,
        fontSize: '1rem',
    }

    const labelStyle = {
        display: 'block',
        marginBottom: '0.25rem',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        color: '#444',
    }

    return (
        <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
            <a href="/" style={{ color: '#666', textDecoration: 'none' }}>← Geri Dön</a>
            <h1 style={{ margin: '1rem 0 2rem' }}>🐾 Yeni İlan Oluştur</h1>

            <label style={labelStyle}>Hayvanın Adı</label>
            <input style={inputStyle} placeholder="Örn: Pamuk" value={form.name} onChange={(e) => guncelle('name', e.target.value)} />

            <label style={labelStyle}>Tür</label>
            <select style={inputStyle} value={form.pet_type} onChange={(e) => guncelle('pet_type', e.target.value)}>
                <option value="cat">Kedi</option>
                <option value="dog">Köpek</option>
                <option value="bird">Kuş</option>
                <option value="rabbit">Tavşan</option>
                <option value="other">Diğer</option>
            </select>

            <label style={labelStyle}>Irk (opsiyonel)</label>
            <input style={inputStyle} placeholder="Örn: Van Kedisi" value={form.breed} onChange={(e) => guncelle('breed', e.target.value)} />

            <label style={labelStyle}>Yaş (ay)</label>
            <input style={inputStyle} type="number" placeholder="Örn: 8" value={form.age_months} onChange={(e) => guncelle('age_months', e.target.value)} />

            <label style={labelStyle}>Cinsiyet</label>
            <select style={inputStyle} value={form.gender} onChange={(e) => guncelle('gender', e.target.value)}>
                <option value="unknown">Bilinmiyor</option>
                <option value="male">Erkek</option>
                <option value="female">Dişi</option>
            </select>

            <label style={labelStyle}>Şehir</label>
            <input style={inputStyle} placeholder="Örn: İstanbul" value={form.city} onChange={(e) => guncelle('city', e.target.value)} />

            <label style={labelStyle}>İlçe (opsiyonel)</label>
            <input style={inputStyle} placeholder="Örn: Kadıköy" value={form.district} onChange={(e) => guncelle('district', e.target.value)} />

            <label style={labelStyle}>Açıklama</label>
            <textarea
                style={{ ...inputStyle, height: '120px', resize: 'vertical' }}
                placeholder="Hayvanınız hakkında bilgi verin..."
                value={form.description}
                onChange={(e) => guncelle('description', e.target.value)}
            />

            <label style={labelStyle}>Sağlık Durumu</label>
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                    { alan: 'vaccinated', etiket: 'Aşılı' },
                    { alan: 'neutered', etiket: 'Kısırlaştırılmış' },
                    { alan: 'dewormed', etiket: 'Parazit Tedavisi Yapıldı' },
                ].map(({ alan, etiket }) => (
                    <label key={alan} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={(form as any)[alan]}
                            onChange={(e) => guncelle(alan, e.target.checked)}
                        />
                        {etiket}
                    </label>
                ))}
            </div>

            {mesaj && <p style={{ color: mesaj.includes('Hata') ? 'red' : 'green', marginBottom: '1rem' }}>{mesaj}</p>}

            <button
                onClick={ilanOlustur}
                disabled={yukleniyor}
                style={{ width: '100%', padding: '1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}
            >
                {yukleniyor ? 'Oluşturuluyor...' : 'İlanı Yayınla'}
            </button>
        </main>
    )
}