'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

const TURKIYE_SEHIRLERI = [
    'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
    'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
    'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
    'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta',
    'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
    'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
    'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt',
    'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak',
    'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman',
    'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
]

const MAX_NAME_LENGTH = 100
const MAX_BREED_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 2000
const MAX_AGE_MONTHS = 360
const MAX_PHOTOS = 10
const MAX_PHOTO_SIZE_MB = 5

function getMinAgeForPetType(petType: string): number {
    switch (petType) {
        case 'Köpek': return 2
        case 'Kedi': return 3
        default: return 1
    }
}

function checkCommercialSale(text: string): boolean {
    const keywords = ['satılık', 'satilik', 'fiyat', 'fiyatı', 'fiyati', 'ücretli', 'ucretli', 'kapora', 'pazarlıklı', 'pazarlikli']
    const lower = text.toLowerCase()
    const hasPricePattern = /\d+\s*(tl|₺|dolar|euro|\$)/.test(lower)
    return keywords.some(k => lower.includes(k)) || hasPricePattern
}

export default function IlanOlustur() {
    const supabase = createClient()
    const objectUrlsRef = useRef<string[]>([])

    const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
    const [yukleniyor, setYukleniyor] = useState(false)
    const [fotograflar, setFotograflar] = useState<File[]>([])
    const [mesaj, setMesaj] = useState('')
    const [validationErrors, setValidationErrors] = useState<string[]>([])

    const [form, setForm] = useState({
        name: '',
        pet_type: 'Köpek',
        breed: '',
        age_months: '',
        gender: 'Erkek',
        city: 'İstanbul',
        district: '',
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

    useEffect(() => {
        return () => {
            objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url))
        }
    }, [])

    function guncelle(alan: string, deger: any) {
        setForm((prev) => ({ ...prev, [alan]: deger }))
    }

    function validate(): string[] {
        const errors: string[] = []

        if (!form.name.trim()) errors.push('Hayvanın adı zorunludur.')
        if (form.name.length > MAX_NAME_LENGTH) errors.push(`İsim en fazla ${MAX_NAME_LENGTH} karakter olabilir.`)
        if (form.breed.length > MAX_BREED_LENGTH) errors.push(`Irk bilgisi en fazla ${MAX_BREED_LENGTH} karakter olabilir.`)
        if (form.description.length > MAX_DESCRIPTION_LENGTH) errors.push(`Açıklama en fazla ${MAX_DESCRIPTION_LENGTH} karakter olabilir.`)

        if (form.age_months) {
            const age = parseInt(form.age_months)
            if (isNaN(age) || age < 0) {
                errors.push('Geçerli bir yaş girin.')
            } else if (age > MAX_AGE_MONTHS) {
                errors.push(`Yaş en fazla ${MAX_AGE_MONTHS} ay (30 yıl) olabilir.`)
            } else if (age < getMinAgeForPetType(form.pet_type)) {
                const minAge = getMinAgeForPetType(form.pet_type)
                const hafta = minAge * 4
                errors.push(`${form.pet_type} yavruları en az ${minAge} aylık (${hafta} haftalık) olmalıdır.`)
            }
        }

        if (fotograflar.length > MAX_PHOTOS) {
            errors.push(`En fazla ${MAX_PHOTOS} fotoğraf yükleyebilirsiniz.`)
        }

        for (const foto of fotograflar) {
            const sizeMB = foto.size / (1024 * 1024)
            if (sizeMB > MAX_PHOTO_SIZE_MB) {
                errors.push(`"${foto.name}" dosyası ${MAX_PHOTO_SIZE_MB}MB'den büyük.`)
            }
            if (!foto.type.startsWith('image/')) {
                errors.push(`"${foto.name}" bir görsel dosyası değil.`)
            }
        }

        if (form.description && checkCommercialSale(form.description)) {
            errors.push('İlan açıklamasında fiyat/ücret bilgisi yer alamaz. Bu platform sadece ücretsiz sahiplendirme içindir.')
        }

        return errors
    }

    async function ilanOlustur() {
        setYukleniyor(true)
        setMesaj('')
        setValidationErrors([])

        if (!user) { window.location.href = '/giris'; return }

        const errors = validate()
        if (errors.length > 0) {
            setValidationErrors(errors)
            setYukleniyor(false)
            return
        }

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
            name: form.name.trim() || 'İsimsiz',
            pet_type: pet_type_db,
            breed: form.breed.trim() || null,
            age_months: form.age_months ? parseInt(form.age_months) : null,
            gender: gender_db,
            city: form.city,
            district: form.district || null,
            description: form.description.trim() || null,
            health_status: {
                vaccinated: form.vaccinated,
                neutered: form.neutered,
                dewormed: form.dewormed,
            },
            status: 'active',
        }).select().single()

        if (error) {
            if (error.message.includes('İlan limiti')) {
                setMesaj('İlan limitine ulaştınız. Bireysel kullanıcılar en fazla 10 aktif ilan oluşturabilir.')
            } else if (error.message.includes('yavruları en az')) {
                setMesaj(error.message)
            } else if (error.message.includes('ticari satış')) {
                setMesaj(error.message)
            } else {
                setMesaj('Hata: ' + error.message)
            }
            setYukleniyor(false)
            return
        }

        let yuklemeBasarisiz = 0
        for (let i = 0; i < fotograflar.length; i++) {
            const dosya = fotograflar[i]
            const dosyaAdi = `${user.id}/${yeniIlan.id}/${Date.now()}-${i}`

            const { error: yuklemeHata } = await supabase.storage
                .from('listing-media')
                .upload(dosyaAdi, dosya, { contentType: dosya.type })

            if (yuklemeHata) {
                console.error(yuklemeHata)
                yuklemeBasarisiz++
                continue
            }

            const { data: urlData } = supabase.storage.from('listing-media').getPublicUrl(dosyaAdi)

            await supabase.from('listing_media').insert({
                listing_id: yeniIlan.id,
                media_url: urlData.publicUrl,
                is_primary: i === 0,
                order_index: i,
            })
        }

        if (yuklemeBasarisiz > 0) {
            setMesaj(`İlan oluşturuldu ancak ${yuklemeBasarisiz} fotoğraf yüklenemedi.`)
            setTimeout(() => window.location.href = '/', 2000)
        } else {
            window.location.href = '/'
        }
    }

    const removePhoto = (indexToRemove: number) => {
        if (objectUrlsRef.current[indexToRemove]) {
            URL.revokeObjectURL(objectUrlsRef.current[indexToRemove])
        }
        objectUrlsRef.current = objectUrlsRef.current.filter((_, i) => i !== indexToRemove)
        setFotograflar((prev) => prev.filter((_, index) => index !== indexToRemove))
    }

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        const remaining = MAX_PHOTOS - fotograflar.length
        if (remaining <= 0) {
            setValidationErrors([`En fazla ${MAX_PHOTOS} fotoğraf yükleyebilirsiniz.`])
            return
        }
        const newFiles = files.slice(0, remaining)
        const urls = newFiles.map(f => URL.createObjectURL(f))
        objectUrlsRef.current = [...objectUrlsRef.current, ...urls]
        setFotograflar([...fotograflar, ...newFiles])
        setValidationErrors([])
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
                                        maxLength={MAX_NAME_LENGTH}
                                        value={form.name}
                                        onChange={(e) => guncelle('name', e.target.value)}
                                    />
                                    <p className="text-[10px] text-on-surface-variant/50 ml-1">{form.name.length}/{MAX_NAME_LENGTH}</p>
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
                                        maxLength={MAX_BREED_LENGTH}
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
                                        min={0}
                                        max={MAX_AGE_MONTHS}
                                        value={form.age_months}
                                        onChange={(e) => guncelle('age_months', e.target.value)}
                                    />
                                    <p className="text-[10px] text-on-surface-variant/50 ml-1">Min: {getMinAgeForPetType(form.pet_type)} ay ({form.pet_type})</p>
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
                                        {TURKIYE_SEHIRLERI.map(sehir => (
                                            <option key={sehir}>{sehir}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1 font-label">İlçe</label>
                                    <input
                                        type="text"
                                        className="w-full bg-surface-container-high border-none rounded-sm px-4 py-3 focus:ring-2 focus:ring-primary/50 transition-all text-on-surface"
                                        placeholder="Örn: Kadıköy"
                                        value={form.district}
                                        onChange={(e) => guncelle('district', e.target.value)}
                                    />
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
                                        <span className="text-sm font-medium">Parazit Tedavisi</span>
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
                                maxLength={MAX_DESCRIPTION_LENGTH}
                                value={form.description}
                                onChange={(e) => guncelle('description', e.target.value)}
                            ></textarea>
                            <p className="text-[10px] text-on-surface-variant/50 ml-1">{form.description.length}/{MAX_DESCRIPTION_LENGTH}</p>
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
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        className="hidden"
                                        onChange={handlePhotoSelect}
                                    />
                                    <span className="material-symbols-outlined text-3xl text-outline group-hover:scale-110 transition-transform">upload_file</span>
                                    <span className="text-[10px] font-bold uppercase tracking-tighter text-outline">Görsel Seç</span>
                                </label>

                                {fotograflar.map((f, i) => (
                                    <div key={i} className="aspect-square rounded-xl overflow-hidden relative group bg-surface-container-high">
                                        <img src={objectUrlsRef.current[i] || URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
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
                                En az 3, en fazla {MAX_PHOTOS} adet net fotoğraf ekleyin. Her dosya max {MAX_PHOTO_SIZE_MB}MB.
                            </p>
                            <p className="text-[10px] text-on-surface-variant/50">{fotograflar.length}/{MAX_PHOTOS} fotoğraf</p>
                        </div>

                        {/* Validation Errors */}
                        {validationErrors.length > 0 && (
                            <div className="bg-error-container/50 rounded-xl p-5 space-y-2">
                                <p className="text-sm font-bold text-on-error-container flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    Lütfen aşağıdaki hataları düzeltin:
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    {validationErrors.map((err, i) => (
                                        <li key={i} className="text-sm text-on-error-container">{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {mesaj && (
                            <p className={`text-sm font-semibold px-4 py-3 rounded-lg ${mesaj.includes('Hata') || mesaj.includes('limit') ? 'bg-error-container text-on-error-container' : 'bg-green-100 text-green-800'}`}>
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
                                    <li className="flex items-start gap-2 text-xs">
                                        <span className="material-symbols-outlined text-green-400 text-sm mt-0.5">check_circle</span>
                                        Bireysel: max 10, Kurumsal: max 50 aktif ilan.
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
