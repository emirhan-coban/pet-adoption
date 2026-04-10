'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'

export default function Mesajlar({ params }: { params: Promise<{ listing_id: string }> }) {
    const supabase = createClient()
    const [mesajlar, setMesajlar] = useState<any[]>([])
    const [yeniMesaj, setYeniMesaj] = useState('')
    const [user, setUser] = useState<any>(null)
    const [ilan, setIlan] = useState<any>(null)
    const [listingId, setListingId] = useState<string>('')
    const altRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function yukle() {
            const { listing_id } = await params
            setListingId(listing_id)

            // Kullanıcıyı al
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { window.location.href = '/giris'; return }
            setUser(user)

            // İlanı al
            const { data: ilan, error: ilanError } = await supabase
                .from('listings')
                .select('*')
                .eq('id', listing_id)
                .single()

            console.log('ilan:', ilan, 'hata:', ilanError)
            setIlan(ilan)

            // Mevcut mesajları al
            const { data: mevcutMesajlar } = await supabase
                .from('messages')
                .select('*')
                .eq('listing_id', listing_id)
                .order('created_at', { ascending: true })
            setMesajlar(mevcutMesajlar ?? [])

            // Gerçek zamanlı dinle
            const kanal = supabase
                .channel(`messages-${listing_id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `listing_id=eq.${listing_id}`,
                }, (payload) => {
                    setMesajlar((prev) => [...prev, payload.new])
                })
                .subscribe()

            return () => { supabase.removeChannel(kanal) }
        }

        yukle()
    }, [])

    // Yeni mesaj gelince en alta kaydır
    useEffect(() => {
        altRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [mesajlar])

    async function mesajGonder() {
        console.log('mesaj gönder çalıştı', yeniMesaj, ilan, user)
        if (!yeniMesaj.trim() || !ilan) return

        if (!ilan) { alert('İlan yükleniyor, bekleyin.'); return }

        // Alıcıyı belirleme:
        // Eger ilan sahibi bensem, bana en son mesaj atan kisiyi bulup ona cevap atalim
        let alici = ilan.user_id
        if (ilan.user_id === user.id) {
            // Mesajlar icinde benden baska kim yazmissa onu bulalım
            const baskaBiri = [...mesajlar].reverse().find(m => m.sender_id !== user.id)
            if (!baskaBiri) {
                alert('Bu ilana henüz kimse mesaj atmamış, ilk mesajı başkası atmalı.')
                return
            }
            alici = baskaBiri.sender_id
        }

        const { data, error } = await supabase.from('messages').insert({
            sender_id: user.id,
            receiver_id: alici,
            listing_id: listingId,
            content: yeniMesaj.trim(),
        }).select().single()

        if (error) {
            console.error('Mesaj gönderme hatası:', error)
            return
        }

        setMesajlar(prev => {
            if (prev.find(m => m.id === data.id)) return prev;
            return [...prev, data];
        });

        setYeniMesaj('')
    }

    return (
        <main style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', height: '100vh' }}>

            {/* Üst bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                <a href="/" style={{ color: '#666', textDecoration: 'none' }}>←</a>
                <div>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>{ilan?.name ?? '...'}</p>
                    <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>{ilan?.city}</p>
                </div>
            </div>

            {/* Mesaj listesi */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '1rem' }}>
                {mesajlar.length === 0 && (
                    <p style={{ color: '#aaa', textAlign: 'center', marginTop: '2rem' }}>Henüz mesaj yok. İlk mesajı sen gönder!</p>
                )}
                {mesajlar.map((m) => {
                    const benimMi = m.sender_id === user?.id
                    return (
                        <div key={m.id} style={{
                            alignSelf: benimMi ? 'flex-end' : 'flex-start',
                            background: benimMi ? '#2563eb' : '#f3f4f6',
                            color: benimMi ? 'white' : '#111',
                            padding: '0.75rem 1rem',
                            borderRadius: benimMi ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            maxWidth: '70%',
                            fontSize: '0.95rem',
                        }}>
                            {m.content}
                        </div>
                    )
                })}
                <div ref={altRef} />
            </div>

            {/* Mesaj gönderme */}
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                <input
                    value={yeniMesaj}
                    onChange={(e) => setYeniMesaj(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && mesajGonder()}
                    placeholder="Mesajınızı yazın..."
                    style={{ flex: 1, padding: '0.75rem', border: '1px solid #ccc', borderRadius: '8px', fontSize: '1rem' }}
                />
                <button
                    onClick={mesajGonder}
                    style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                    Gönder
                </button>
            </div>

        </main>
    )
}