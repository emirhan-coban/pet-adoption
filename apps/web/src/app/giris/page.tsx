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
        <main style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '12px' }}>
            <h1 style={{ marginBottom: '1.5rem' }}>🐾 Giriş Yap</h1>

            <input
                type="email"
                placeholder="E-posta"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box' }}
            />

            <input
                type="password"
                placeholder="Şifre"
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box' }}
            />

            {mesaj && <p style={{ color: mesaj.includes('Hata') ? 'red' : 'green', marginBottom: '1rem' }}>{mesaj}</p>}

            <button
                onClick={girisYap}
                disabled={yukleniyor}
                style={{ width: '100%', padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '0.5rem' }}
            >
                {yukleniyor ? 'Bekle...' : 'Giriş Yap'}
            </button>

            <button
                onClick={kayitOl}
                disabled={yukleniyor}
                style={{ width: '100%', padding: '0.75rem', background: 'white', color: '#2563eb', border: '1px solid #2563eb', borderRadius: '8px', cursor: 'pointer' }}
            >
                {yukleniyor ? 'Bekle...' : 'Kayıt Ol'}
            </button>

        </main>
    )
}