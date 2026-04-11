'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function IlanOlustur() {
    const supabase = createClient()

    const [yukleniyor, setYukleniyor] = useState(false)
    const [fotograflar, setFotograflar] = useState<File[]>([])
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
        if (!user) { window.location.href = '/giris'; return }

        const { data: yeniIlan, error } = await supabase.from('listings').insert({
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
        }).select().single()

        if (error) {
            setMesaj('Hata: ' + error.message)
            setYukleniyor(false)
            return
        }

        for (let i = 0; i < fotograflar.length; i++) {
            const dosya = fotograflar[i]
            const dosyaAdi = `${user.id}/${yeniIlan.id}/${Date.now()}-${i}`

            const { error: yuklemeHata } = await supabase.storage
                .from('listing-media')
                .upload(dosyaAdi, dosya, { contentType: dosya.type })

            if (yuklemeHata) { console.error(yuklemeHata); continue }

            const { data: urlData } = supabase.storage.from('listing-media').getPublicUrl(dosyaAdi)

            await supabase.from('listing_media').insert({
                listing_id: yeniIlan.id,
                media_url: urlData.publicUrl,
                is_primary: i === 0,
                order_index: i,
            })
        }

        window.location.href = '/'
    }

    const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-lg mb-4 text-sm focus:outline-none focus:border-blue-500"
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1"

    return (
        <main className="min-h-screen bg-gray-50">

            <nav className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-2xl mx-auto">
                    <a href="/" className="text-blue-600 text-sm no-underline">← Geri Dön</a>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">🐾 Yeni İlan Oluştur</h1>

                    <label className={labelClass}>Hayvanın Adı</label>
                    <input className={inputClass} placeholder="Örn: Pamuk" value={form.name} onChange={(e) => guncelle('name', e.target.value)} />

                    <label className={labelClass}>Tür</label>
                    <select className={inputClass} value={form.pet_type} onChange={(e) => guncelle('pet_type', e.target.value)}>
                        <option value="cat">Kedi</option>
                        <option value="dog">Köpek</option>
                        <option value="bird">Kuş</option>
                        <option value="rabbit">Tavşan</option>
                        <option value="other">Diğer</option>
                    </select>

                    <label className={labelClass}>Irk (opsiyonel)</label>
                    <input className={inputClass} placeholder="Örn: Van Kedisi" value={form.breed} onChange={(e) => guncelle('breed', e.target.value)} />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Yaş (ay)</label>
                            <input className={inputClass} type="number" placeholder="Örn: 8" value={form.age_months} onChange={(e) => guncelle('age_months', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Cinsiyet</label>
                            <select className={inputClass} value={form.gender} onChange={(e) => guncelle('gender', e.target.value)}>
                                <option value="unknown">Bilinmiyor</option>
                                <option value="male">Erkek</option>
                                <option value="female">Dişi</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Şehir</label>
                            <input className={inputClass} placeholder="Örn: İstanbul" value={form.city} onChange={(e) => guncelle('city', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>İlçe (opsiyonel)</label>
                            <input className={inputClass} placeholder="Örn: Kadıköy" value={form.district} onChange={(e) => guncelle('district', e.target.value)} />
                        </div>
                    </div>

                    <label className={labelClass}>Açıklama</label>
                    <textarea
                        className={`${inputClass} h-32 resize-none`}
                        placeholder="Hayvanınız hakkında bilgi verin..."
                        value={form.description}
                        onChange={(e) => guncelle('description', e.target.value)}
                    />

                    <label className={labelClass}>Fotoğraflar</label>
                    <label className="w-full border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors mb-4 block">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => setFotograflar(Array.from(e.target.files ?? []))}
                        />
                        <div className="text-3xl mb-2">📷</div>
                        <p className="text-gray-500 text-sm">Fotoğraf seçmek için tıkla</p>
                        <p className="text-gray-400 text-xs mt-1">İlk fotoğraf ana fotoğraf olacak</p>
                    </label>

                    {fotograflar.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-4">
                            {fotograflar.map((f, i) => (
                                <div key={i} className="relative">
                                    <img src={URL.createObjectURL(f)} alt="" className="w-24 h-24 object-cover rounded-lg" />
                                    {i === 0 && <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">Ana</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    <label className={labelClass}>Sağlık Durumu</label>
                    <div className="flex flex-col gap-3 mb-6">
                        {[
                            { alan: 'vaccinated', etiket: 'Aşılı' },
                            { alan: 'neutered', etiket: 'Kısırlaştırılmış' },
                            { alan: 'dewormed', etiket: 'Parazit Tedavisi Yapıldı' },
                        ].map(({ alan, etiket }) => (
                            <label key={alan} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={(form as any)[alan]}
                                    onChange={(e) => guncelle(alan, e.target.checked)}
                                    className="w-4 h-4 accent-blue-600"
                                />
                                <span className="text-sm text-gray-700">{etiket}</span>
                            </label>
                        ))}
                    </div>

                    {mesaj && (
                        <p className={`text-sm mb-4 ${mesaj.includes('Hata') ? 'text-red-500' : 'text-green-600'}`}>{mesaj}</p>
                    )}

                    <button
                        onClick={ilanOlustur}
                        disabled={yukleniyor}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-lg"
                    >
                        {yukleniyor ? 'Yükleniyor...' : '🐾 İlanı Yayınla'}
                    </button>
                </div>
            </div>
        </main>
    )
}