'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'

export default function SifreYenile() {
    const supabase = createClient()
    const router = useRouter()
    const [yeniSifre, setYeniSifre] = useState('')
    const [yeniSifreTekrar, setYeniSifreTekrar] = useState('')
    const [yukleniyor, setYukleniyor] = useState(false)
    const [mesaj, setMesaj] = useState('')
    const [basarili, setBasarili] = useState(false)

    async function sifreYenile() {
        if (yeniSifre.length < 6) {
            setMesaj('Şifre en az 6 karakter olmalıdır.')
            return
        }
        if (yeniSifre !== yeniSifreTekrar) {
            setMesaj('Şifreler eşleşmiyor.')
            return
        }

        setYukleniyor(true)
        setMesaj('')

        const { error } = await supabase.auth.updateUser({
            password: yeniSifre
        })

        setYukleniyor(false)

        if (error) {
            setMesaj('Hata: ' + error.message)
        } else {
            setBasarili(true)
            setMesaj('Şifreniz güncellendi. Giriş sayfasına yönlendiriliyorsunuz...')
            setTimeout(() => router.push('/giris'), 3000)
        }
    }

    return (
        <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col">
            <Header />

            <main className="pt-24 pb-32 px-4 md:px-6 lg:px-10 max-w-md mx-auto w-full flex-grow">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">
                        Şifre Yenile
                    </h1>
                    <p className="text-sm text-on-surface-variant">
                        Yeni şifrenizi belirleyin.
                    </p>
                </div>

                <div className="bg-surface-container-low rounded-xl p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                            Yeni Şifre
                        </label>
                        <input
                            type="password"
                            placeholder="En az 6 karakter"
                            value={yeniSifre}
                            onChange={(e) => setYeniSifre(e.target.value)}
                            className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                            Yeni Şifre (Tekrar)
                        </label>
                        <input
                            type="password"
                            placeholder="Yeni şifrenizi tekrar girin"
                            value={yeniSifreTekrar}
                            onChange={(e) => setYeniSifreTekrar(e.target.value)}
                            className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>

                    {mesaj && (
                        <div className={`p-4 rounded-xl text-sm ${basarili ? 'bg-green-50 text-green-800' : 'bg-error-container/50 text-on-error-container'}`}>
                            {mesaj}
                        </div>
                    )}

                    <button
                        onClick={sifreYenile}
                        disabled={yukleniyor || !yeniSifre || !yeniSifreTekrar}
                        className="w-full bg-gradient-to-tl from-orange-700 to-orange-400 text-white font-bold py-4 rounded-full shadow-md active:scale-95 transition-all disabled:opacity-50"
                    >
                        {yukleniyor ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                    </button>
                </div>
            </main>
        </div>
    )
}
