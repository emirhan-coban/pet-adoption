import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import Link from 'next/link'

function formatAge(months: number | null | undefined): string {
    if (months == null) return 'Belirtilmemiş'
    if (months < 1) return 'Yavru'
    if (months < 12) return `${months} Aylık`
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) return `${years} Yaş`
    return `${years} Yıl ${remainingMonths} Ay`
}

function formatPetType(type: string): string {
    switch (type) {
        case 'dog': return 'Köpek'
        case 'cat': return 'Kedi'
        case 'bird': return 'Kuş'
        case 'rabbit': return 'Tavşan'
        default: return 'Diğer'
    }
}

function getAgeLabel(months: number | null | undefined): string {
    if (months == null) return 'Belirtilmemiş'
    if (months < 6) return 'Yavru'
    if (months < 24) return 'Genç'
    return 'Yetişkin'
}

function statusLabel(status: string) {
    switch (status) {
        case 'active': return { text: 'Aktif', bg: 'bg-green-100 text-green-700' }
        case 'adopted': return { text: 'Sahiplendirildi', bg: 'bg-blue-100 text-blue-700' }
        default: return { text: 'Gizli', bg: 'bg-red-100 text-red-700' }
    }
}

export default async function Profil() {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/giris')

    const { data: profil } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    const { data: ilanlar } = await supabase
        .from('listings')
        .select('*, listing_media(media_url, is_primary)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const { count: sahiplendirilenSayisi } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'adopted')

    const aktifIlanSayisi = ilanlar?.filter(i => i.status === 'active').length ?? 0
    const trustScore = profil?.trust_score ?? 100

    const displayName = profil?.full_name ?? 'İsimsiz Kullanıcı'
    const initial = displayName[0]?.toUpperCase() ?? 'K'

    return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex flex-col">
            <Header />

            <main className="pt-24 pb-32 md:pb-16 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full flex-grow">
                <section className="relative mb-12 md:mb-16 pt-2 md:pt-6">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                        <div className="relative flex-shrink-0">
                            <div className="w-32 h-32 md:w-44 md:h-44 lg:w-48 lg:h-48 rounded-xl overflow-hidden editorial-shadow bg-surface-container-low p-1">
                                {profil?.avatar_url ? (
                                    <img
                                        src={profil.avatar_url}
                                        alt={displayName}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-lg bg-gradient-to-tl from-orange-700 to-orange-400 flex items-center justify-center text-white text-5xl md:text-6xl lg:text-7xl font-extrabold font-headline">
                                        {initial}
                                    </div>
                                )}
                            </div>
                            {trustScore >= 80 && (
                                <div className="absolute -bottom-2 -right-2 bg-primary-container text-white p-2 rounded-full shadow-lg border-4 border-surface">
                                    <span className="material-symbols-outlined text-sm icon-fill">verified</span>
                                </div>
                            )}
                        </div>

                        <div className="text-center md:text-left flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-3">
                                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                                    {displayName}
                                </h2>
                                {profil?.role && (
                                    <span className="inline-flex items-center self-center md:self-auto px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
                                        {profil.role === 'shelter' ? 'Barınak Yöneticisi' : 'Bireysel Sahiplendirici'}
                                    </span>
                                )}
                            </div>

                            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-1">
                                {user.email}
                            </p>

                            {profil?.bio && (
                                <p className="text-on-surface-variant leading-relaxed max-w-lg text-sm md:text-base mt-2">
                                    {profil.bio}
                                </p>
                            )}

                            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                                <Link
                                    href="/hesap-ayarari"
                                    className="bg-gradient-to-br from-primary-container to-primary text-white px-8 py-3 rounded-full font-bold editorial-shadow hover:opacity-90 transition-all active:scale-95 duration-200 font-headline text-sm no-underline"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                        Profili Düzenle
                                    </span>
                                </Link>
                                <button className="bg-surface-container-highest text-on-surface-variant px-8 py-3 rounded-full font-bold hover:bg-surface-variant transition-all active:scale-95 duration-200 font-headline text-sm">
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">share</span>
                                        Profili Paylaş
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-14 md:mb-16">
                    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl editorial-shadow border-b-4 border-primary-container/20 hover:-translate-y-1 transition-transform duration-300">
                        <span className="material-symbols-outlined text-primary mb-3 md:mb-4 block text-[28px]">pets</span>
                        <div className="text-3xl md:text-4xl font-extrabold text-on-surface mb-1 font-headline">
                            {aktifIlanSayisi}
                        </div>
                        <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                            Aktif İlan
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl editorial-shadow border-b-4 border-tertiary/20 hover:-translate-y-1 transition-transform duration-300">
                        <span className="material-symbols-outlined text-tertiary mb-3 md:mb-4 block text-[28px]">volunteer_activism</span>
                        <div className="text-3xl md:text-4xl font-extrabold text-on-surface mb-1 font-headline">
                            {sahiplendirilenSayisi ?? 0}
                        </div>
                        <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                            Sahiplendirilen
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl editorial-shadow border-b-4 border-orange-200 hover:-translate-y-1 transition-transform duration-300">
                        <span className="material-symbols-outlined text-primary-container mb-3 md:mb-4 block text-[28px] icon-fill">shield_with_heart</span>
                        <div className="text-3xl md:text-4xl font-extrabold text-on-surface mb-1 font-headline">
                            {trustScore}%
                        </div>
                        <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                            Güven Skoru
                        </div>
                    </div>
                </section>

                <section className="mb-14 md:mb-16">
                    <div className="flex justify-between items-end mb-6 md:mb-8">
                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold font-headline mb-1">İlanlarım</h3>
                            <p className="text-on-surface-variant text-sm">Yönettiğiniz ilanlar ve sahiplendirme süreçleri.</p>
                        </div>
                        {(ilanlar?.length ?? 0) > 3 && (
                            <button className="text-primary font-bold text-sm hover:underline decoration-primary/30 flex items-center gap-1 flex-shrink-0">
                                Tümünü Gör
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        )}
                    </div>

                    {(!ilanlar || ilanlar.length === 0) && (
                        <div className="text-center py-16 md:py-20">
                            <div className="w-20 h-20 rounded-full bg-primary-fixed/30 flex items-center justify-center mx-auto mb-5">
                                <span className="material-symbols-outlined text-4xl text-primary">pets</span>
                            </div>
                            <h4 className="text-xl font-bold font-headline text-on-surface mb-2">
                                Henüz ilan oluşturmadınız
                            </h4>
                            <p className="text-on-surface-variant text-sm max-w-sm mx-auto mb-6">
                                İlk ilanınızı oluşturarak sahiplendirme yolculuğunuza başlayın.
                            </p>
                            <Link
                                href="/ilan-olustur"
                                className="btn-gradient px-8 py-3 rounded-full no-underline text-sm font-bold inline-flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                İlk İlanını Oluştur
                            </Link>
                        </div>
                    )}

                    {ilanlar && ilanlar.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                            {ilanlar.map((ilan: any, index: number) => {
                                const foto = ilan.listing_media?.find((m: any) => m.is_primary)?.media_url
                                    || ilan.listing_media?.[0]?.media_url
                                const status = statusLabel(ilan.status)

                                return (
                                    <div
                                        key={ilan.id}
                                        className="group cursor-pointer animate-fade-in-up"
                                        style={{ animationDelay: `${index * 80}ms` }}
                                    >
                                        <Link href={`/ilanlar/${ilan.id}`} className="no-underline block">
                                            <div className="aspect-[4/5] rounded-xl overflow-hidden mb-4 relative bg-surface-container-high">
                                                {foto ? (
                                                    <img
                                                        src={foto}
                                                        alt={ilan.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-container-high to-surface-dim">
                                                        <span className="material-symbols-outlined text-6xl text-outline-variant/40">pets</span>
                                                    </div>
                                                )}

                                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary-container shadow-sm">
                                                    {getAgeLabel(ilan.age_months)}
                                                </div>

                                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm ${status.bg}`}>
                                                    {status.text}
                                                </div>
                                            </div>

                                            <div className="px-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-lg md:text-xl font-bold text-on-surface font-headline group-hover:text-primary transition-colors">
                                                        {ilan.name}
                                                    </h4>
                                                    <span className="material-symbols-outlined text-primary-container icon-fill text-xl">
                                                        favorite
                                                    </span>
                                                </div>
                                                <p className="text-on-surface-variant text-sm flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">location_on</span>
                                                    {ilan.city}{ilan.district ? `, ${ilan.district}` : ''} · {formatAge(ilan.age_months)}
                                                </p>
                                            </div>
                                        </Link>

                                        <div className="flex gap-2 mt-3 px-1">
                                            <Link
                                                href={`/ilanlar/${ilan.id}`}
                                                className="flex-1 text-center py-2.5 bg-surface-container-high text-on-surface-variant rounded-lg text-xs font-bold no-underline hover:bg-surface-container-highest transition-colors uppercase tracking-wider"
                                            >
                                                Görüntüle
                                            </Link>
                                            <Link
                                                href={`/mesajlar/${ilan.id}`}
                                                className="flex-1 text-center py-2.5 bg-primary-fixed/60 text-primary rounded-lg text-xs font-bold no-underline hover:bg-primary-fixed transition-colors uppercase tracking-wider"
                                            >
                                                Mesajlar
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })}

                            <Link
                                href="/ilan-olustur"
                                className="aspect-[4/5] rounded-xl border-4 border-dashed border-outline-variant bg-surface-container-low flex flex-col items-center justify-center p-8 group hover:border-primary-container transition-colors cursor-pointer no-underline"
                            >
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center editorial-shadow mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-primary-container text-3xl">add</span>
                                </div>
                                <p className="text-on-surface-variant font-bold text-center font-headline">
                                    Yeni İlan Ekle
                                    <br />
                                    <span className="font-medium text-xs opacity-60">İlan oluşturmaya başla</span>
                                </p>
                            </Link>
                        </div>
                    )}
                </section>

                <section className="bg-surface-container-low rounded-xl p-6 md:p-8 mb-14 md:mb-16">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-6">
                        Hesap Ayarları
                    </h3>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center py-4 px-4 hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary-container editorial-shadow">
                                    <span className="material-symbols-outlined">manage_accounts</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-on-surface block">Hesap Ayarları</span>
                                    <span className="text-xs text-on-surface-variant">E-posta, şifre ve kişisel bilgiler</span>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 group-hover:text-primary transition-all">
                                chevron_right
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-4 px-4 hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary-container editorial-shadow">
                                    <span className="material-symbols-outlined">lock_person</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-on-surface block">Gizlilik ve Güvenlik</span>
                                    <span className="text-xs text-on-surface-variant">Veri yönetimi ve güvenlik tercihleri</span>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 group-hover:text-primary transition-all">
                                chevron_right
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-4 px-4 hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary-container editorial-shadow">
                                    <span className="material-symbols-outlined">notifications</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-on-surface block">Bildirimler</span>
                                    <span className="text-xs text-on-surface-variant">Mesaj ve sahiplendirme bildirimleri</span>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 group-hover:text-primary transition-all">
                                chevron_right
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-4 px-4 hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary-container editorial-shadow">
                                    <span className="material-symbols-outlined">help</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-on-surface block">Yardım ve Destek</span>
                                    <span className="text-xs text-on-surface-variant">SSS, iletişim ve rehberler</span>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 group-hover:text-primary transition-all">
                                chevron_right
                            </span>
                        </div>

                        <div className="border-t border-outline-variant/15 my-2" />

                        <Link
                            href="/cikis"
                            className="flex justify-between items-center py-4 px-4 hover:bg-error-container/30 rounded-lg transition-colors cursor-pointer group no-underline"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-error-container/50 flex items-center justify-center text-error">
                                    <span className="material-symbols-outlined">logout</span>
                                </div>
                                <span className="font-semibold text-error">Çıkış Yap</span>
                            </div>
                            <span className="material-symbols-outlined text-error/40 group-hover:translate-x-1 transition-transform">
                                chevron_right
                            </span>
                        </Link>
                    </div>
                </section>

                <div className="text-center pb-8">
                    <p className="text-[11px] text-on-surface-variant/50 font-bold uppercase tracking-widest">
                        Sahiplendir · Güvenli Sahiplendirme Platformu
                    </p>
                    <p className="text-[10px] text-on-surface-variant/30 mt-1">
                        Verileriniz KVKK kapsamında korunmaktadır.
                    </p>
                </div>
            </main>

            <BottomNav />
        </div>
    )
}
