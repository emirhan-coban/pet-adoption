'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

interface Conversation {
    listing_id: string
    listing_name: string
    listing_photo: string | null
    other_user_name: string
    last_message: string
    last_message_time: string
    unread: boolean
    pet_type: string
    city: string
}

export default function MesajlarListesi() {
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [konusmalar, setKonusmalar] = useState<Conversation[]>([])
    const [yukleniyor, setYukleniyor] = useState(true)

    async function yukleKonusmalar(currentUser: any) {
        const { data: mesajlar } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
            .order('created_at', { ascending: false })

        if (!mesajlar || mesajlar.length === 0) {
            setKonusmalar([])
            setYukleniyor(false)
            return
        }

        const listingMap = new Map<string, any>()
        for (const m of mesajlar) {
            if (!listingMap.has(m.listing_id)) {
                listingMap.set(m.listing_id, m)
            }
        }

        const conversations: Conversation[] = []
        for (const [listingId, lastMsg] of listingMap) {
            const { data: ilan } = await supabase
                .from('listings')
                .select('*, listing_media(media_url, is_primary)')
                .eq('id', listingId)
                .single()

            if (!ilan) continue

            const otherUserId = lastMsg.sender_id === currentUser.id
                ? lastMsg.receiver_id
                : lastMsg.sender_id

            const { data: otherUser } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', otherUserId)
                .single()

            const primaryPhoto = ilan.listing_media?.find((m: any) => m.is_primary)?.media_url
                || ilan.listing_media?.[0]?.media_url
                || null

            conversations.push({
                listing_id: listingId,
                listing_name: ilan.name || 'İsimsiz',
                listing_photo: primaryPhoto,
                other_user_name: otherUser?.full_name || 'Kullanıcı',
                last_message: lastMsg.content,
                last_message_time: lastMsg.created_at,
                unread: !lastMsg.is_read && lastMsg.sender_id !== currentUser.id,
                pet_type: ilan.pet_type,
                city: ilan.city,
            })
        }

        setKonusmalar(conversations)
        setYukleniyor(false)
    }

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { window.location.href = '/giris'; return }
            setUser(user)
            await yukleKonusmalar(user)

            const kanal = supabase
                .channel('mesajlar-liste')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                }, () => {
                    supabase.auth.getUser().then(({ data: { user } }) => {
                        if (user) yukleKonusmalar(user)
                    })
                })
                .subscribe()
            return () => { supabase.removeChannel(kanal) }
        }
        init()
    }, [])

    function formatZaman(dateStr: string) {
        const d = new Date(dateStr)
        const simdi = new Date()
        const fark = simdi.getTime() - d.getTime()
        const dakika = Math.floor(fark / 60000)
        const saat = Math.floor(dakika / 60)
        const gun = Math.floor(saat / 24)

        if (dakika < 1) return 'Şimdi'
        if (dakika < 60) return `${dakika} dk`
        if (saat < 24) return `${saat} sa`
        if (gun < 7) return `${gun} gün`
        return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    }

    function petTypeIcon(type: string) {
        switch (type) {
            case 'dog': return '🐕'
            case 'cat': return '🐈'
            case 'bird': return '🐦'
            case 'rabbit': return '🐇'
            default: return '🐾'
        }
    }

    return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex flex-col">
            <Header />

            <main className="pt-24 pb-32 md:pb-16 px-4 sm:px-6 lg:px-10 max-w-4xl mx-auto w-full flex-grow">

                {/* Page Title */}
                <section className="mb-8 md:mb-10 pt-2 md:pt-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                            Mesajlar
                        </h2>
                        {konusmalar.length > 0 && (
                            <span className="text-sm font-semibold text-primary bg-primary-fixed/60 px-3 py-1 rounded-full">
                                {konusmalar.length} sohbet
                            </span>
                        )}
                    </div>
                    <p className="text-on-surface-variant text-sm md:text-base">
                        Sahiplendirme başvurularınız ve sohbetleriniz burada.
                    </p>
                </section>

                {/* Loading State */}
                {yukleniyor && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-primary-container/30 border-t-primary-container animate-spin" />
                        <p className="text-on-surface-variant text-sm font-medium">Sohbetler yükleniyor...</p>
                    </div>
                )}

                {/* Empty State */}
                {!yukleniyor && konusmalar.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
                        <div className="w-24 h-24 rounded-full bg-primary-fixed/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-primary">forum</span>
                        </div>
                        <div className="space-y-2 max-w-sm">
                            <h3 className="text-xl font-bold font-headline text-on-surface">
                                Henüz mesajınız yok
                            </h3>
                            <p className="text-on-surface-variant text-sm leading-relaxed">
                                İlanlara göz atın ve ilginizi çeken bir can dostu için sahiplerine mesaj gönderin.
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="btn-gradient px-8 py-3 rounded-full no-underline text-sm font-bold inline-flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">explore</span>
                            İlanları Keşfet
                        </Link>
                    </div>
                )}

                {/* Conversations List */}
                {!yukleniyor && konusmalar.length > 0 && (
                    <div className="space-y-3">
                        {konusmalar.map((k, index) => (
                            <Link
                                key={k.listing_id}
                                href={`/mesajlar/${k.listing_id}`}
                                className="group flex items-center gap-4 p-4 md:p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 no-underline transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] duration-200 animate-fade-in-up editorial-shadow"
                                style={{ animationDelay: `${index * 60}ms` }}
                            >
                                {/* Pet Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden ring-2 ring-primary-container/20 group-hover:ring-primary-container/50 transition-all">
                                        {k.listing_photo ? (
                                            <img
                                                src={k.listing_photo}
                                                alt={k.listing_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-tl from-orange-700 to-orange-400 flex items-center justify-center text-white text-2xl">
                                                {petTypeIcon(k.pet_type)}
                                            </div>
                                        )}
                                    </div>
                                    {k.unread && (
                                        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-container rounded-full border-2 border-white" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h4 className={`font-headline text-base md:text-lg truncate ${k.unread ? 'font-extrabold text-on-surface' : 'font-bold text-on-surface'}`}>
                                            {k.listing_name}
                                        </h4>
                                        <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide flex-shrink-0">
                                            {formatZaman(k.last_message_time)}
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                                        {k.other_user_name} · {k.city}
                                    </p>
                                    <p className={`text-sm truncate leading-relaxed ${k.unread ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
                                        {k.last_message}
                                    </p>
                                </div>

                                {/* Arrow */}
                                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors text-lg flex-shrink-0">
                                    chevron_right
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    )
}
