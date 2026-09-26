'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Link from 'next/link'

export default function ProfilDuzenle() {
    const supabase = createClient()
    const router = useRouter()

    const [yukleniyor, setYukleniyor] = useState(true)
    const [kaydediyor, setKaydediyor] = useState(false)
    const [mesaj, setMesaj] = useState('')
    const [mesajTuru, setMesajTuru] = useState<'hata' | 'basari'>('hata')

    const [form, setForm] = useState({
        full_name: '',
        phone: '',
    })

    useEffect(() => {
        async function yukle() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/giris'); return }

            const { data: profiller } = await supabase.rpc('get_my_profile')
            const profil = profiller?.[0]

            if (profil) {
                setForm({
                    full_name: profil.full_name ?? '',
                    phone: profil.phone ?? '',
                })
            }
            setYukleniyor(false)
        }
        yukle()
    }, [])

    async function kaydet() {
        if (!form.full_name.trim()) {
            setMesaj('Ad soyad alanı boş bırakılamaz.')
            setMesajTuru('hata')
            return
        }
        if (form.full_name.trim().length > 255) {
            setMesaj('Ad soyad en fazla 255 karakter olabilir.')
            setMesajTuru('hata')
            return
        }
        if (form.phone && !/^[\d\s\+\-\(\)]{7,20}$/.test(form.phone)) {
            setMesaj('Geçerli bir telefon numarası girin.')
            setMesajTuru('hata')
            return
        }

        setKaydediyor(true)
        setMesaj('')

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/giris'); return }

        const { error } = await supabase.rpc('update_my_profile', {
            p_full_name: form.full_name.trim(),
            p_phone: form.phone.trim() || null,
            p_avatar_url: null,
        })

        if (error) {
            setMesaj('Kaydedilirken hata oluştu: ' + error.message)
            setMesajTuru('hata')
        } else {
            setMesaj('Profil bilgileriniz güncellendi.')
            setMesajTuru('basari')
            setTimeout(() => router.push('/profil'), 1200)
        }
        setKaydediyor(false)
    }

    if (yukleniyor) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col">
            <Header />

            <main className="pt-24 pb-32 px-4 md:px-6 lg:px-10 max-w-2xl mx-auto w-full flex-grow">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/profil" className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors no-underline">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface font-headline">
                            Profili Düzenle
                        </h1>
                        <p className="text-sm text-on-surface-variant">Ad soyad ve iletişim bilgilerinizi güncelleyin.</p>
                    </div>
                </div>

                <div className="bg-surface-container-low rounded-xl p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                            Ad Soyad
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">person</span>
                            <input
                                type="text"
                                placeholder="Adınız ve soyadınız"
                                value={form.full_name}
                                onChange={(e) => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                                maxLength={255}
                                className="w-full bg-surface-container-high border-none rounded-xl pl-12 pr-4 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                            Telefon Numarası <span className="normal-case font-normal">(opsiyonel)</span>
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">phone</span>
                            <input
                                type="tel"
                                placeholder="Örn: 0532 123 45 67"
                                value={form.phone}
                                onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                                maxLength={20}
                                className="w-full bg-surface-container-high border-none rounded-xl pl-12 pr-4 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <p className="text-[10px] text-on-surface-variant/50 ml-1">
                            Telefon numaranız yalnızca size mesaj göndermek isteyen kullanıcılara gösterilmez. Sadece profilinizde görünür.
                        </p>
                    </div>

                    {mesaj && (
                        <div className={`flex items-start gap-3 p-4 rounded-xl text-sm ${mesajTuru === 'hata' ? 'bg-error-container/50 text-on-error-container' : 'bg-green-50 text-green-800'}`}>
                            <span className={`material-symbols-outlined text-lg flex-shrink-0 mt-0.5 ${mesajTuru === 'hata' ? 'text-error' : 'text-green-600'}`}>
                                {mesajTuru === 'hata' ? 'error' : 'check_circle'}
                            </span>
                            <p className="leading-relaxed">{mesaj}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Link
                            href="/profil"
                            className="flex-1 text-center bg-surface-container-high text-on-surface font-semibold py-4 rounded-full hover:bg-surface-container-highest transition-colors no-underline"
                        >
                            İptal
                        </Link>
                        <button
                            onClick={kaydet}
                            disabled={kaydediyor}
                            className="flex-1 bg-gradient-to-tl from-orange-700 to-orange-400 text-white font-bold py-4 rounded-full shadow-md active:scale-95 transition-all disabled:opacity-60"
                        >
                            {kaydediyor ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Kaydediliyor...
                                </span>
                            ) : (
                                'Kaydet'
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
