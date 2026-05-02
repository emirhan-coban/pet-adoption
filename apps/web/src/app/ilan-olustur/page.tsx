'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

export default function IlanOlustur() {
    const supabase = createClient()

    const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
    const [yukleniyor, setYukleniyor] = useState(false)
    const [fotograflar, setFotograflar] = useState<File[]>([])
    const [mesaj, setMesaj] = useState('')

    const [form, setForm] = useState({
        name: '',
        pet_type: 'Köpek',
        breed: '',
        age_months: '',
        gender: 'Erkek',
        city: 'İstanbul',
        district: 'Kadıköy',
        description: '',
        vaccinated: false,
        neutered: false,
        dewormed: false,
    })

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUser({ id: user.id, email: user.email })
            } else {
                window.location.href = '/giris'
            }
        })
    }, [])

    function guncelle(alan: string, deger: any) {
        setForm((prev) => ({ ...prev, [alan]: deger }))
    }

    async function ilanOlustur() {
        setYukleniyor(true)
        setMesaj('')

        if (!user) { window.location.href = '/giris'; return }

        let pet_type_db = 'cat';
        if (form.pet_type === 'Köpek') pet_type_db = 'dog';
        else if (form.pet_type === 'Kuş') pet_type_db = 'bird';
        else if (form.pet_type === 'Tavşan') pet_type_db = 'rabbit';
        else if (form.pet_type === 'Kedi') pet_type_db = 'cat';

        let gender_db = 'unknown';
        if (form.gender === 'Erkek') gender_db = 'male';
        else if (form.gender === 'Dişi') gender_db = 'female';

        const { data: yeniIlan, error } = await supabase.from('listings').insert({
            user_id: user.id,
            name: form.name || 'İsimsiz',
            pet_type: pet_type_db,
            breed: form.breed,
            age_months: parseInt(form.age_months) || 0,
            gender: gender_db,
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

    const removePhoto = (indexToRemove: number) => {
        setFotograflar((prev) => prev.filter((_, index) => index !== indexToRemove))
    }

    return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex flex-col">
            <Header />

            <main className="pt-24 pb-32 px-6 max-w-4xl mx-auto w-full flex-grow">
                {/* Progress Indicator */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">İlan Ver</h2>
                        <span className="text-sm font-semibold text-primary px-4 py-1 bg-primary-fixed rounded-full font-headline">Adım 2 / 3</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-gradient-to-r from-primary to-primary-container"></div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Form Section */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Category Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[24px]">category</span>
                                <h3 className="text-xl font-bold font-headline">Temel Bilgiler</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1 font-label">Hayvanın Adı</label>
                                    <input
                                        type="text"
                                        className="w-full bg-surface-container-high border-none rounded-sm px-4 py-3 focus:ring-2 focus:ring-primary/50 transition-all text-on-surface"
                                        placeholder="Örn: Pamuk"
                                        value={form.name}
                                        onChange={(e) => guncelle('name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1 font-label">Hayvan Türü</label>
                                    <select
                                        className="w-full bg-surface-container-high border-none rounded-sm px-4 py-3 focus:ring-2 focus:ring-primary/50 transition-all appearance-none text-on-surface"
                                        value={form.pet_type}
                                        onChange={(e) => guncelle('pet_type', e.target.value)}
                                    >
                                        <option>Köpek</option>
                                        <option>Kedi</option>
                                        <option>Kuş</option>
                                        <option>Tavşan</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1 font-label">Cins / Irk</label>
                                    <input
                                        type="text"
                                        className="w-full bg-surface-container-high border-none rounded-sm px-4 py-3 focus:ring-2 focus:ring-primary/50 transition-all text-on-surface"
                                        placeholder="Örn: Golden Retriever"
                                        value={form.breed}
                                        onChange={(e) => guncelle('breed', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1 font-label">Yaş (Ay Cinsinden)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-surface-container-high border-none rounded-sm px-4 py-3 focus:ring-2 focus:ring-primary/50 transition-all text-on-surface"
                                        placeholder="Örn: 24"
                                        value={form.age_months}
                                        onChange={(e) => guncelle('age_months', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1 font-label">Cinsiyet</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => guncelle('gender', 'Erkek')}
                                            className={`flex-1 py-3 px-4 rounded-sm font-semibold flex items-center justify-center gap-2 transition-all ${form.gender === 'Erkek' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}
                                        >
                                            <span className="material-symbols-outlined text-lg">male</span> Erkek
                                        </button>
                                        <button
                                            onClick={() => guncelle('gender', 'Dişi')}
                                            className={`flex-1 py-3 px-4 rounded-sm font-semibold flex items-center justify-center gap-2 transition-all ${form.gender === 'Dişi' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}
                                        >
                                            <span className="material-symbols-outlined text-lg">female</span> Dişi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[24px]">location_on</span>
                                <h3 className="text-xl font-bold font-headline">Konum Bilgisi</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1 font-label">Şehir</label>
                                    <select
                                        className="w-full bg-surface-container-high border-none rounded-sm px-4 py-3 focus:ring-2 focus:ring-primary/50 appearance-none text-on-surface"
                                        value={form.city}
                                        onChange={(e) => guncelle('city', e.target.value)}
                                    >
                                        <option>İstanbul</option>
                                        <option>Ankara</option>
                                        <option>İzmir</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1 font-label">İlçe</label>
                                    <select
                                        className="w-full bg-surface-container-high border-none rounded-sm px-4 py-3 focus:ring-2 focus:ring-primary/50 appearance-none text-on-surface"
                                        value={form.district}
                                        onChange={(e) => guncelle('district', e.target.value)}
                                    >
                                        <option>Beşiktaş</option>
                                        <option>Kadıköy</option>
                                        <option>Şişli</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Health & Identity Section */}
                        <div className="p-8 bg-surface-container-low rounded-xl border border-outline-variant/15 space-y-8 flex-col flex">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-[24px]">medical_services</span>
                                    <h3 className="text-xl font-bold font-headline">Sağlık ve Kimlik</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <label className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-lg cursor-pointer transition-colors hover:bg-white shadow-sm editorial-shadow">
                                        <input
                                            type="checkbox"
                                            checked={form.vaccinated}
                                            onChange={(e) => guncelle('vaccinated', e.target.checked)}
                                            className="rounded text-primary focus:ring-primary w-5 h-5 border-surface-variant"
                                        />
                                        <span className="text-sm font-medium">Aşılı</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-lg cursor-pointer transition-colors hover:bg-white shadow-sm editorial-shadow">
                                        <input
                                            type="checkbox"
                                            checked={form.neutered}
                                            onChange={(e) => guncelle('neutered', e.target.checked)}
                                            className="rounded text-primary focus:ring-primary w-5 h-5 border-surface-variant"
                                        />
                                        <span className="text-sm font-medium">Kısır</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-lg cursor-pointer transition-colors hover:bg-white shadow-sm editorial-shadow">
                                        <input
                                            type="checkbox"
                                            checked={form.dewormed}
                                            onChange={(e) => guncelle('dewormed', e.target.checked)}
                                            className="rounded text-primary focus:ring-primary w-5 h-5 border-surface-variant"
                                        />
                                        <span className="text-sm font-medium">Pasaportlu</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[24px]">description</span>
                                <h3 className="text-xl font-bold font-headline">Açıklama</h3>
                            </div>
                            <textarea
                                className="w-full bg-surface-container-high border-none rounded-sm px-6 py-4 focus:ring-2 focus:ring-primary/50 text-on-surface"
                                placeholder="Evcil dostunuzun huyu, alışkanlıkları ve yeni yuvasından beklentileriniz hakkında bilgi verin..."
                                rows={6}
                                value={form.description}
                                onChange={(e) => guncelle('description', e.target.value)}
                            ></textarea>
                        </div>

                        {/* Photo Upload */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[24px]">add_a_photo</span>
                                <h3 className="text-xl font-bold font-headline">Fotoğraflar</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <label className="aspect-square rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-container-high transition-colors group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => setFotograflar([...fotograflar, ...Array.from(e.target.files ?? [])])}
                                    />
                                    <span className="material-symbols-outlined text-3xl text-outline group-hover:scale-110 transition-transform">upload_file</span>
                                    <span className="text-[10px] font-bold uppercase tracking-tighter text-outline">Görsel Seç</span>
                                </label>

                                {fotograflar.map((f, i) => (
                                    <div key={i} className="aspect-square rounded-xl overflow-hidden relative group bg-surface-container-high">
                                        <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removePhoto(i)}
                                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                        {i === 0 && (
                                            <span className="absolute bottom-2 left-2 bg-primary/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">Ana Görsel</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-on-surface-variant flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">info</span>
                                En az 3, en fazla 10 adet net fotoğraf eklemeniz sahiplendirme şansını artırır.
                            </p>
                        </div>

                        {mesaj && (
                            <p className={`text-sm font-semibold px-4 py-3 rounded-lg ${mesaj.includes('Hata') ? 'bg-error-container text-on-error-container' : 'bg-green-100 text-green-800'}`}>
                                {mesaj}
                            </p>
                        )}

                        {/* Action Button */}
                        <div className="pt-8 flex flex-col md:flex-row gap-4 mb-10">
                            <button
                                onClick={ilanOlustur}
                                disabled={yukleniyor}
                                className="flex-[2] bg-gradient-to-tl from-orange-700 to-orange-400 text-white font-bold py-5 rounded-full shadow-[0_20px_40px_rgba(144,77,0,0.2)] active:scale-95 transition-all text-lg tracking-wide uppercase disabled:opacity-70 font-headline"
                            >
                                {yukleniyor ? 'Yükleniyor...' : 'İlanı Yayınla'}
                            </button>
                            <button className="flex-1 bg-surface-container-highest text-on-surface-variant font-bold py-5 rounded-full active:scale-95 transition-all uppercase tracking-wide font-headline">
                                Taslağı Kaydet
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Guidance */}
                    <aside className="lg:col-span-4 hidden lg:block">
                        <div className="sticky top-32 space-y-6">
                            <div className="p-8 bg-orange-50 rounded-xl border border-orange-100 space-y-4">
                                <h4 className="text-orange-900 font-bold flex items-center gap-2 font-headline">
                                    <span className="material-symbols-outlined icon-fill text-orange-500">tips_and_updates</span>
                                    Editörün İpucu
                                </h4>
                                <p className="text-orange-800/80 text-sm leading-relaxed">
                                    Fotoğraflarınızda gün ışığını tercih edin. Evcil hayvanınızın göz hizasından çekilen kareler çok daha etkileyici sonuçlar verir.
                                </p>
                                <div className="aspect-video rounded-lg overflow-hidden border-2 border-white shadow-sm">
                                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVOsAW1VMH-r8cwEh-MAX9Iy_9BXfPub8OwK7PWksOSB_luItJeN6mq5LbHpNLQr1QT2qaUGUw9haOdqhxu6Kwu3Mv1xfUm66BfigUi3QQQ4HAZ3KG9oWuzm-R-57fKVHiAMX32321tihVY1NE4bOJI1LcynejmhGbSXzGJ2PTQ1g4wsH-aBUoxM2T6TQSO4ZEFRecnUJ2jN6xNdOHrxWiMnyI0791LJlzb7zq173gQH9A0KZYbpeKOBnEfCkIGvoEwC0ij6HuU6I" className="w-full h-full object-cover" alt="Tip" />
                                </div>
                            </div>

                            <div className="p-8 bg-stone-900 text-stone-100 rounded-xl space-y-4">
                                <h4 className="font-bold flex items-center gap-2 font-headline">
                                    <span className="material-symbols-outlined text-primary-container">verified_user</span>
                                    Güvenli Sahiplendirme
                                </h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 text-xs">
                                        <span className="material-symbols-outlined text-green-400 text-sm mt-0.5">check_circle</span>
                                        PETVET doğrulaması ile ilanınız öne çıkar.
                                    </li>
                                    <li className="flex items-start gap-2 text-xs">
                                        <span className="material-symbols-outlined text-green-400 text-sm mt-0.5">check_circle</span>
                                        Ücretli sahiplendirme yapmak yasaktır.
                                    </li>
                                    <li className="flex items-start gap-2 text-xs">
                                        <span className="material-symbols-outlined text-green-400 text-sm mt-0.5">check_circle</span>
                                        Kişisel verileriniz KVKK kapsamında korunur.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <BottomNav />
        </div>
    )
}