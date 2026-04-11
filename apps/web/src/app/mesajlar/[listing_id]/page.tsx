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

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { window.location.href = '/giris'; return }
            setUser(user)

            const { data: ilan } = await supabase
                .from('listings')
                .select('*')
                .eq('id', listing_id)
                .single()
            setIlan(ilan)

            const { data: mevcutMesajlar } = await supabase
                .from('messages')
                .select('*')
                .eq('listing_id', listing_id)
                .order('created_at', { ascending: true })
            setMesajlar(mevcutMesajlar ?? [])

            const kanal = supabase
                .channel(`messages-${listing_id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `listing_id=eq.${listing_id}`,
                }, (payload) => {
                    setMesajlar((prev) => {
                        if (prev.find((m) => m.id === payload.new.id)) return prev
                        return [...prev, payload.new]
                    })
                })
                .subscribe()

            return () => { supabase.removeChannel(kanal) }
        }
        yukle()
    }, [])

    useEffect(() => {
        altRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [mesajlar])

    async function mesajGonder() {
        if (!yeniMesaj.trim() || !ilan || !user) return

        if (ilan.user_id === user.id) {
            const baskaMesaj = mesajlar.find((m) => m.sender_id !== user.id)
            if (!baskaMesaj) { alert('Bu ilana henüz kimse mesaj atmamış.'); return }

            const { data: yeniM } = await supabase.from('messages').insert({
                sender_id: user.id,
                receiver_id: baskaMesaj.sender_id,
                listing_id: listingId,
                content: yeniMesaj.trim(),
            }).select().single()

            if (yeniM) setMesajlar((prev) => prev.find((m) => m.id === yeniM.id) ? prev : [...prev, yeniM])
        } else {
            const { data: yeniM } = await supabase.from('messages').insert({
                sender_id: user.id,
                receiver_id: ilan.user_id,
                listing_id: listingId,
                content: yeniMesaj.trim(),
            }).select().single()

            if (yeniM) setMesajlar((prev) => prev.find((m) => m.id === yeniM.id) ? prev : [...prev, yeniM])
        }

        setYeniMesaj('')
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">

            {/* Üst bar */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <a href="/" className="text-blue-600 text-sm no-underline">←</a>
                    <div>
                        <p className="font-semibold text-gray-900">{ilan?.name ?? '...'}</p>
                        <p className="text-gray-500 text-xs">{ilan?.city}</p>
                    </div>
                    {ilan && (
                        <a href={`/ilanlar/${ilan.id}`} className="ml-auto text-blue-600 text-sm no-underline hover:underline">
                            İlanı Gör
                        </a>
                    )}
                </div>
            </nav>

            {/* Mesaj listesi */}
            <div className="flex-1 overflow-y-auto py-6 px-4">
                <div className="max-w-3xl mx-auto flex flex-col gap-3">
                    {mesajlar.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-3">💬</div>
                            <p className="text-gray-400">Henüz mesaj yok. İlk mesajı sen gönder!</p>
                        </div>
                    )}
                    {mesajlar.map((m) => {
                        const benimMi = m.sender_id === user?.id
                        return (
                            <div key={m.id} className={`flex ${benimMi ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm ${benimMi
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm shadow-sm'
                                    }`}>
                                    {m.content}
                                </div>
                            </div>
                        )
                    })}
                    <div ref={altRef} />
                </div>
            </div>

            {/* Mesaj gönderme */}
            <div className="bg-white border-t border-gray-200 px-4 py-4 flex-shrink-0">
                <div className="max-w-3xl mx-auto flex gap-3">
                    <input
                        value={yeniMesaj}
                        onChange={(e) => setYeniMesaj(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && mesajGonder()}
                        placeholder="Mesajınızı yazın..."
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={mesajGonder}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                        Gönder
                    </button>
                </div>
            </div>

        </main>
    )
}