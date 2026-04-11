'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Giris() {
    const [email, setEmail] = useState('')
    const [sifre, setSifre] = useState('')
    const [yukleniyor, setYukleniyor] = useState(false)
    const [mesaj, setMesaj] = useState('')

    const supabase = createClient()

    async function girisYap() {
        setYukleniyor(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password: sifre })
        if (error) {
            setMesaj('Hata: ' + error.message)
        } else {
            window.location.href = '/'
        }
        setYukleniyor(false)
    }

    async function kayitOl() {
        setYukleniyor(true)
        const { error } = await supabase.auth.signUp({ email, password: sifre })
        if (error) {
            setMesaj('Hata: ' + error.message)
        } else {
            setMesaj('Kayıt başarılı! E-postanı kontrol et.')
        }
        setYukleniyor(false)
    }

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">

                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🐾</div>
                    <h1 className="text-2xl font-bold text-gray-900">PatternPaw'a Hoş Geldin</h1>
                    <p className="text-gray-500 text-sm mt-1">Giriş yap veya yeni hesap oluştur</p>
                </div>

                <input
                    type="email"
                    placeholder="E-posta"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-3 text-sm focus:outline-none focus:border-blue-500"
                />

                <input
                    type="password"
                    placeholder="Şifre (min. 6 karakter)"
                    value={sifre}
                    onChange={(e) => setSifre(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && girisYap()}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-4 text-sm focus:outline-none focus:border-blue-500"
                />

                {mesaj && (
                    <p className={`text-sm mb-4 ${mesaj.includes('Hata') ? 'text-red-500' : 'text-green-600'}`}>
                        {mesaj}
                    </p>
                )}

                <button
                    onClick={girisYap}
                    disabled={yukleniyor}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-3 disabled:opacity-50"
                >
                    {yukleniyor ? 'Bekle...' : 'Giriş Yap'}
                </button>

                <button
                    onClick={kayitOl}
                    disabled={yukleniyor}
                    className="w-full bg-white text-blue-600 py-3 rounded-lg font-medium border border-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                    {yukleniyor ? 'Bekle...' : 'Yeni Hesap Oluştur'}
                </button>

                <p className="text-center text-gray-400 text-sm mt-6">
                    <a href="/" className="hover:text-gray-600">← Ana sayfaya dön</a>
                </p>
            </div>
        </main>
    )
}