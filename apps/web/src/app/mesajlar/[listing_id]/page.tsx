'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import BottomNav from '../../components/BottomNav'

export default function Mesajlar({ params }: { params: Promise<{ listing_id: string }> }) {
    const supabase = createClient()
    const [mesajlar, setMesajlar] = useState<any[]>([])
    const [yeniMesaj, setYeniMesaj] = useState('')
    const [user, setUser] = useState<any>(null)
    const [ilan, setIlan] = useState<any>(null)
    const [ilanSahibi, setIlanSahibi] = useState<any>(null)
    const [ilanFoto, setIlanFoto] = useState<string | null>(null)
    const [listingId, setListingId] = useState<string>('')
    const [yukleniyor, setYukleniyor] = useState(true)
    const [gonderiyor, setGonderiyor] = useState(false)
    const altRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        async function yukle() {
            const { listing_id } = await params
            setListingId(listing_id)

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { window.location.href = '/giris'; return }
            setUser(user)

            const { data: ilan } = await supabase
                .from('listings')
                .select('*, listing_media(media_url, is_primary)')
                .eq('id', listing_id)
                .single()
            setIlan(ilan)

            if (ilan?.listing_media) {
                const primary = ilan.listing_media.find((m: any) => m.is_primary)
                setIlanFoto(primary?.media_url || ilan.listing_media[0]?.media_url || null)
            }

            if (ilan?.user_id) {
                const { data: owner } = await supabase
                    .from('users')
                    .select('full_name, trust_score')
                    .eq('id', ilan.user_id)
                    .single()
                setIlanSahibi(owner)
            }

            const { data: mevcutMesajlar } = await supabase
                .from('messages')
                .select('*')
                .eq('listing_id', listing_id)
                .order('created_at', { ascending: true })
            setMesajlar(mevcutMesajlar ?? [])
            setYukleniyor(false)
        }
        yukle()
    }, [])

    useEffect(() => {
        if (!listingId) return
        const kanal = supabase
            .channel(`messages-${listingId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `listing_id=eq.${listingId}`,
            }, (payload) => {
                setMesajlar((prev) => {
                    if (prev.find((m) => m.id === payload.new.id)) return prev
                    return [...prev, payload.new]
                })
            })
            .subscribe()
        return () => { supabase.removeChannel(kanal) }
    }, [listingId])

    useEffect(() => {
        altRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [mesajlar])

    async function mesajGonder() {
        if (!yeniMesaj.trim() || !ilan || !user || gonderiyor) return
        setGonderiyor(true)

        if (ilan.user_id === user.id) {
            const baskaMesaj = mesajlar.find((m) => m.sender_id !== user.id)
            if (!baskaMesaj) {
                alert('Bu ilana henüz kimse mesaj atmamış.')
                setGonderiyor(false)
                return
            }

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
        setGonderiyor(false)
        inputRef.current?.focus()
    }

    function formatSaat(dateStr: string) {
        const d = new Date(dateStr)
        return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    }

    function formatTarih(dateStr: string) {
        const d = new Date(dateStr)
        const bugun = new Date()
        const dun = new Date()
        dun.setDate(dun.getDate() - 1)

        if (d.toDateString() === bugun.toDateString()) return 'Bugün'
        if (d.toDateString() === dun.toDateString()) return 'Dün'
        return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    }

    function grupla(mesajlar: any[]) {
        const groups: { tarih: string; mesajlar: any[] }[] = []
        let currentDate = ''

        for (const m of mesajlar) {
            const tarih = formatTarih(m.created_at)
            if (tarih !== currentDate) {
                currentDate = tarih
                groups.push({ tarih, mesajlar: [m] })
            } else {
                groups[groups.length - 1].mesajlar.push(m)
            }
        }
        return groups
    }

    function paraDenKontrol(content: string) {
        const keywords = ['ödeme', 'para', 'deposit', 'kapora', 'havale', 'eft', 'iban', 'tl', '₺', 'ücret', 'fiyat', 'bedel']
        return keywords.some(k => content.toLowerCase().includes(k))
    }

    const gruplar = grupla(mesajlar)

    return (
        <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">

            <header className="fixed top-0 w-full z-50 glass-nav border-b border-outline-variant/15">
                <div className="flex items-center justify-between px-4 md:px-6 lg:px-10 py-3 md:py-4 w-full max-w-7xl mx-auto">

                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                        <Link
                            href="/"
                            className="text-on-surface-variant hover:text-primary transition-colors active:scale-95 duration-200 no-underline flex-shrink-0"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>

                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary-container/30">
                                {ilanFoto ? (
                                    <img
                                        src={ilanFoto}
                                        alt={ilan?.name || ''}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-tl from-orange-700 to-orange-400 flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined text-lg">pets</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col min-w-0">
                                <span className="font-headline font-bold text-base md:text-lg text-on-surface leading-tight truncate">
                                    {ilanSahibi?.full_name || 'Sahiplendir'}
                                </span>
                                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider truncate">
                                    {ilan?.name ? `${ilan.name} hakkında sohbet` : 'Yükleniyor...'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-on-surface-variant font-bold font-headline text-base hover:opacity-80 transition-opacity no-underline">
                            Keşfet
                        </Link>
                        <Link href="/mesajlar" className="text-primary-container font-bold font-headline text-base hover:opacity-80 transition-opacity no-underline">
                            Mesajlar
                        </Link>
                        <Link href="/ilan-olustur" className="text-on-surface-variant font-bold font-headline text-base hover:opacity-80 transition-opacity no-underline">
                            İlan Ver
                        </Link>
                    </nav>

                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        {ilan && (
                            <Link
                                href={`/ilanlar/${ilan.id}`}
                                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-primary-container bg-primary-fixed/60 px-3 py-1.5 rounded-full no-underline hover:bg-primary-fixed transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                İlanı Gör
                            </Link>
                        )}
                        <button className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors">
                            <span className="material-symbols-outlined">more_vert</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow pt-[72px] md:pt-[80px] pb-28 md:pb-24">
                <div className="max-w-3xl mx-auto w-full px-4 md:px-6">

                    {yukleniyor && (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <div className="w-12 h-12 rounded-full border-4 border-primary-container/30 border-t-primary-container animate-spin" />
                            <p className="text-on-surface-variant text-sm font-medium">Mesajlar yükleniyor...</p>
                        </div>
                    )}

                    {!yukleniyor && mesajlar.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 md:py-32 gap-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-primary-fixed/40 flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl text-primary">chat_bubble</span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold font-headline text-on-surface">
                                    Henüz mesaj yok
                                </h3>
                                <p className="text-on-surface-variant text-sm max-w-xs mx-auto">
                                    {ilan?.name
                                        ? `${ilan.name} hakkında sormak istediğiniz bir şey var mı? İlk mesajı siz gönderin!`
                                        : 'İlk mesajı göndererek sohbeti başlatın.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {!yukleniyor && mesajlar.length > 0 && (
                        <div className="flex flex-col gap-5 py-6">
                            <div className="mx-auto w-full max-w-lg animate-fade-in-up">
                                <div className="bg-orange-50 border-l-4 border-primary-container p-4 rounded-xl flex gap-3 items-start editorial-shadow">
                                    <span className="material-symbols-outlined text-primary-container icon-fill flex-shrink-0">security</span>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-extrabold text-on-primary-container uppercase tracking-tight">
                                            Yapay Zekâ Güvenlik Kontrolü
                                        </span>
                                        <p className="text-xs text-on-surface-variant leading-relaxed">
                                            Sistemimiz güvenliğinizi izlemektedir. Lütfen sohbet üzerinden asla para veya sahiplendirme ücreti göndermeyin. İlk buluşmayı her zaman herkese açık bir yerde yapın.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {gruplar.map((grup, gi) => (
                                <div key={gi} className="flex flex-col gap-4">
                                    <div className="flex justify-center my-2">
                                        <span className="bg-surface-container text-on-surface-variant px-4 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest">
                                            {grup.tarih}
                                        </span>
                                    </div>

                                    {grup.mesajlar.map((m, mi) => {
                                        const benimMi = m.sender_id === user?.id
                                        const paraUyarisi = paraDenKontrol(m.content)

                                        return (
                                            <div key={m.id}>
                                                {benimMi ? (
                                                    <div className="flex flex-col items-end gap-1 self-end ml-auto max-w-[85%] md:max-w-[70%] animate-fade-in-up" style={{ animationDelay: `${mi * 40}ms` }}>
                                                        <div className="bg-primary text-on-primary px-5 py-3 rounded-t-2xl rounded-bl-2xl shadow-md hover:shadow-lg transition-shadow">
                                                            <p className="text-sm leading-relaxed">{m.content}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mr-2">
                                                            <span className="text-[10px] text-on-surface-variant uppercase font-semibold">
                                                                {formatSaat(m.created_at)}
                                                            </span>
                                                            <span className="material-symbols-outlined text-[14px] text-primary icon-fill">
                                                                done_all
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-end gap-3 max-w-[85%] md:max-w-[70%] animate-fade-in-up" style={{ animationDelay: `${mi * 40}ms` }}>
                                                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                                            {ilanFoto ? (
                                                                <img src={ilanFoto} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-tl from-orange-700 to-orange-400 flex items-center justify-center text-white text-xs font-bold">
                                                                    {ilanSahibi?.full_name?.[0]?.toUpperCase() || '?'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <div className="bg-surface-container-lowest text-on-surface px-5 py-3 rounded-t-2xl rounded-br-2xl shadow-sm hover:shadow-md transition-shadow border border-outline-variant/5">
                                                                <p className="text-sm leading-relaxed">{m.content}</p>
                                                            </div>
                                                            <span className="text-[10px] text-on-surface-variant ml-2 uppercase font-semibold">
                                                                {formatSaat(m.created_at)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {paraUyarisi && (
                                                    <div className="mx-auto w-full max-w-lg mt-3 animate-fade-in-up">
                                                        <div className="bg-error-container p-4 rounded-xl flex gap-3 items-start border border-error/20">
                                                            <span className="material-symbols-outlined text-error icon-fill flex-shrink-0">report</span>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[11px] font-extrabold text-on-error-container uppercase tracking-wider">
                                                                    Yapay Zekâ Uyarısı: Olası Dolandırıcılık
                                                                </span>
                                                                <p className="text-xs text-on-error-container leading-relaxed">
                                                                    Para konusu geçti. Sahiplendir, hayvanı görmeden kapora veya ücret ödenmemesini şiddetle tavsiye eder.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                            <div ref={altRef} />
                        </div>
                    )}
                </div>
            </main>

            <div className="fixed bottom-16 md:bottom-0 left-0 w-full px-4 md:px-6 pb-3 md:pb-5 pt-2 z-40">
                <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl p-2 md:p-3 rounded-full shadow-lg flex items-center gap-1.5 md:gap-2 border border-outline-variant/10 editorial-shadow">
                    <input
                        ref={inputRef}
                        value={yeniMesaj}
                        onChange={(e) => setYeniMesaj(e.target.value.slice(0, 500))}
                        onKeyDown={(e) => e.key === 'Enter' && mesajGonder()}
                        placeholder="Mesajınızı yazın..."
                        maxLength={500}
                        className="flex-grow bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-medium placeholder:text-stone-400 text-on-surface py-2 px-1"
                    />
                    <span className="text-[10px] text-on-surface-variant/50 flex-shrink-0 w-10 text-right">{yeniMesaj.length}/500</span>

                    <button
                        onClick={mesajGonder}
                        disabled={!yeniMesaj.trim() || gonderiyor}
                        className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-primary text-white shadow-md active:scale-90 duration-200 transition-all disabled:opacity-40 disabled:active:scale-100 flex-shrink-0 hover:shadow-lg"
                        title="Gönder"
                    >
                        <span className="material-symbols-outlined icon-fill text-[18px] md:text-[20px]">send</span>
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
