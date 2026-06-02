'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'

export default function HesapSil() {
    const supabase = createClient()
    const router = useRouter()
    const [sifre, setSifre] = useState('')
    const [onay, setOnay] = useState(false)
    const [yukleniyor, setYukleniyor] = useState(false)
    const [mesaj, setMesaj] = useState('')
    const [mesajTuru, setMesajTuru] = useState<'hata' | 'basari'>('hata')

    async function hesapSil() {
        if (!onay) {
            setMesaj('Lütfen hesap silme onay kutusunu işaretleyin.')
            setMesajTuru('hata')
            return
        }
        if (!sifre) {
            setMesaj('Lütfen şifrenizi girin.')
            setMesajTuru('hata')
            return
        }

        setYukleniyor(true)
        setMesaj('')

        // Şifre doğrulama
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            setMesaj('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
            setMesajTuru('hata')
            setYukleniyor(false)
            return
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: sifre
        })

        if (signInError) {
            setMesaj('Şifre hatalı. Lütfen tekrar deneyin.')
            setMesajTuru('hata')
            setYukleniyor(false)
            return
        }

        // Hesap silme fonksiyonunu çağır
        const { error: deleteError } = await supabase.rpc('delete_user_account')

        if (deleteError) {
            setMesaj('Hesap silinirken hata oluştu: ' + deleteError.message)
            setMesajTuru('hata')
            setYukleniyor(false)
            return
        }

        // Auth oturumunu kapat
        await supabase.auth.signOut()

        setMesaj('Hesabınız başarıyla silindi. Yönlendiriliyorsunuz...')
        setMesajTuru('basari')
        
        setTimeout(() => {
            router.push('/')
        }, 2000)
    }

    return (
        <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col">
            <Header />

            <main className="pt-24 pb-32 px-4 md:px-6 lg:px-10 max-w-2xl mx-auto w-full flex-grow">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-2">
                        Hesabınızı Silin
                    </h1>
                    <p className="text-sm text-on-surface-variant">
                        Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
                    </p>
                </div>

                <div className="bg-error-container/30 rounded-xl p-6 mb-6 space-y-4">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-error text-2xl">warning</span>
                        <div>
                            <h2 className="font-bold text-on-surface mb-2">Silinecek Veriler</h2>
                            <ul className="space-y-1 text-sm text-on-surface-variant">
                                <li>• Tüm ilanlarınız ve fotoğraflarınız</li>
                                <li>• Mesajlarınız ve sohbetleriniz</li>
                                <li>• Favorileriniz ve başvurularınız</li>
                                <li>• Profil bilgileriniz</li>
                                <li>• Kurumsal profiliniz (varsa)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-container-low rounded-xl p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                            Şifrenizi Onaylayın
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">
                                lock
                            </span>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={sifre}
                                onChange={(e) => setSifre(e.target.value)}
                                className="w-full bg-surface-container-high border-none rounded-xl pl-12 pr-4 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-surface-container-high rounded-xl">
                        <input
                            type="checkbox"
                            checked={onay}
                            onChange={(e) => setOnay(e.target.checked)}
                            className="mt-1 rounded text-error focus:ring-error w-4 h-4"
                        />
                        <label className="text-sm text-on-surface-variant leading-relaxed">
                            Hesabımın kalıcı olarak silineceğini ve bu işlemin geri alınamayacağını anlıyorum. 
                            Tüm verilerimin silinmesini kabul ediyorum.
                        </label>
                    </div>

                    {mesaj && (
                        <div className={`flex items-start gap-3 p-4 rounded-xl text-sm ${mesajTuru === 'hata'
                                ? 'bg-error-container/50 text-on-error-container'
                                : 'bg-green-50 text-green-800'
                            }`}>
                            <span className={`material-symbols-outlined text-lg flex-shrink-0 mt-0.5 ${mesajTuru === 'hata' ? 'text-error' : 'text-green-600'
                                }`}>
                                {mesajTuru === 'hata' ? 'error' : 'check_circle'}
                            </span>
                            <p className="leading-relaxed">{mesaj}</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push('/profil')}
                            className="flex-1 bg-surface-container-high text-on-surface font-semibold py-4 rounded-full hover:bg-surface-container-highest transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={hesapSil}
                            disabled={yukleniyor || !onay || !sifre}
                            className="flex-1 bg-error text-white font-bold py-4 rounded-full shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
                        >
                            {yukleniyor ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Siliniyor...
                                </span>
                            ) : (
                                'Hesabımı Sil'
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
