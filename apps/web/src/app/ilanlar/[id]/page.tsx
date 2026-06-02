import { createServerSupabase } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { type Metadata } from 'next'
import Header from '../../components/Header'
import BottomNav from '../../components/BottomNav'
import ImageCarousel from '../../components/ImageCarousel'
import FavoriButon from '../../components/FavoriButon'
import RaporlaModal from '../../components/RaporlaModal'
import Link from 'next/link'

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: ilan } = await supabase
    .from('listings')
    .select('name, pet_type, city, description, listing_media(media_url, is_primary)')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (!ilan) return {}

  const petTypeMap: Record<string, string> = {
    cat: 'Kedi', dog: 'Köpek', bird: 'Kuş', rabbit: 'Tavşan', other: 'Hayvan'
  }
  const petType = petTypeMap[ilan.pet_type] ?? 'Hayvan'
  const title = `${ilan.name} - ${petType} Sahiplendirme - ${ilan.city}`
  const description = ilan.description
    ? ilan.description.slice(0, 155)
    : `${ilan.city}'de sahiplendirilmek bekleyen ${petType.toLowerCase()} ${ilan.name}. Sahiplendir'de ücretsiz ilan.`
  const foto = (ilan.listing_media as any[])?.find((m) => m.is_primary)?.media_url

  return {
    title,
    description,
    alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sahiplendir.tr'}/ilanlar/${id}` },
    openGraph: {
      title,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sahiplendir.tr'}/ilanlar/${id}`,
      type: 'article',
      ...(foto && { images: [{ url: foto, width: 1200, height: 630, alt: ilan.name }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(foto && { images: [foto] }),
    },
  }
}

function formatAge(months: number | null): string {
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

function formatGender(gender: string): string {
  return gender === 'female' ? 'Dişi' : gender === 'male' ? 'Erkek' : 'Belirtilmemiş'
}

function getAgeLabel(months: number | null): string {
  if (months == null) return 'Belirtilmemiş'
  if (months < 6) return 'Yavru'
  if (months < 24) return 'Genç'
  return 'Yetişkin'
}

export default async function IlanDetay({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: ilan, error } = await supabase
    .from('listings')
    .select('*, listing_media(media_url, is_primary)')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (error || !ilan) notFound()

  let ilanSahibi: any = null
  if (ilan.user_id) {
    const { data: userData } = await supabase
      .from('users')
      .select('full_name, trust_score')
      .eq('id', ilan.user_id)
      .single()
    ilanSahibi = userData
  }

  const fotograflar = ilan.listing_media ?? []
  const tumFotolar = fotograflar.map((f: any) => f.media_url)
  const healthStatus = ilan.health_status as any

  const traits: { icon: string; label: string; active: boolean }[] = [
    { icon: 'vaccines', label: 'Aşılı', active: !!healthStatus?.vaccinated },
    { icon: 'content_cut', label: 'Kısırlaştırılmış', active: !!healthStatus?.neutered },
    { icon: 'pest_control', label: 'Parazit Tedavisi', active: !!healthStatus?.dewormed },
    { icon: 'verified_user', label: 'Mikroçipli', active: !!healthStatus?.microchipped },
  ]

  const activeTraits = traits.filter((t) => t.active)

  return (
    <>
      <Header />

      <main className="pt-20 pb-32 md:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-4 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors no-underline group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span>İlanlara Dön</span>
          </Link>
        </div>

        <ImageCarousel images={tumFotolar} alt={ilan.name} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                  <span className="text-primary font-bold tracking-widest text-[10px] uppercase block mb-2">
                    Sahiplendirmeye Açık
                  </span>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-headline text-on-surface leading-none">
                    {ilan.name}
                  </h2>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="bg-primary-container/10 text-on-primary-container px-4 py-2 rounded-full text-sm font-semibold">
                    {getAgeLabel(ilan.age_months)}
                  </span>
                  <span className="bg-secondary-container/30 text-on-secondary-container px-4 py-2 rounded-full text-sm font-semibold">
                    {formatGender(ilan.gender)}
                  </span>
                  <FavoriButon listingId={id} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-6 border-y border-outline-variant/15">
                {ilan.breed && (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">
                        Cins
                      </span>
                      <span className="text-lg font-bold font-headline">{ilan.breed}</span>
                    </div>
                    <div className="w-px h-8 bg-outline-variant/20 hidden sm:block" />
                  </>
                )}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">
                    Tür
                  </span>
                  <span className="text-lg font-bold font-headline">{formatPetType(ilan.pet_type)}</span>
                </div>
                <div className="w-px h-8 bg-outline-variant/20 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">
                    Yaş
                  </span>
                  <span className="text-lg font-bold font-headline">{formatAge(ilan.age_months)}</span>
                </div>
                <div className="w-px h-8 bg-outline-variant/20 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">
                    Konum
                  </span>
                  <span className="text-lg font-bold font-headline">
                    {ilan.city}{ilan.district ? `, ${ilan.district}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {ilan.description && (
              <section className="space-y-4">
                <h3 className="text-2xl font-bold font-headline">
                  {ilan.name} Hakkında
                </h3>
                <div className="text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {ilan.description}
                </div>
              </section>
            )}

            {activeTraits.length > 0 && (
              <section className="space-y-6">
                <h3 className="text-2xl font-bold font-headline">Sağlık & Özellikler</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {activeTraits.map((trait) => (
                    <div
                      key={trait.label}
                      className="bg-surface-container-low p-6 rounded-xl flex flex-col items-center text-center gap-3 transition-transform hover:-translate-y-1"
                    >
                      <span className="material-symbols-outlined text-primary-container scale-125 icon-fill">
                        {trait.icon}
                      </span>
                      <span className="font-bold text-sm">{trait.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <h3 className="text-2xl font-bold font-headline">
                {ilan.name} ile Nerede Buluşabilirsin?
              </h3>
              <div className="h-48 md:h-64 rounded-xl bg-surface-container-high overflow-hidden relative">
                <div className="w-full h-full bg-gradient-to-br from-surface-container-high to-surface-dim opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary rounded-full animate-ping absolute inset-0 opacity-25" />
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white relative editorial-shadow">
                      <span className="material-symbols-outlined icon-fill">location_on</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-bold text-on-surface">
                    📍 {ilan.city}{ilan.district ? `, ${ilan.district}` : ''}
                  </span>
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 lg:p-8 editorial-shadow space-y-6 border border-outline-variant/10">
              {ilanSahibi && (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-tl from-orange-700 to-orange-400 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {ilanSahibi.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold font-headline truncate">
                        {ilanSahibi.full_name || 'İlan Sahibi'}
                      </h4>
                      {(ilanSahibi.trust_score ?? 0) >= 80 && (
                        <span className="material-symbols-outlined text-blue-500 text-sm icon-fill flex-shrink-0">
                          verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium">İlan Sahibi</p>
                    {ilanSahibi.trust_score != null && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-yellow-500 text-xs icon-fill">
                          star
                        </span>
                        <span className="text-xs font-bold">
                          Güven Skoru: {ilanSahibi.trust_score}/100
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Link
                  href={`/mesajlar/${ilan.id}`}
                  className="w-full btn-gradient py-4 rounded-full text-center block no-underline text-sm lg:text-base shadow-lg shadow-orange-500/20"
                >
                  Sahiplenme Başvurusu Yap
                </Link>
                <Link
                  href={`/mesajlar/${ilan.id}`}
                  className="w-full bg-surface-container-highest text-on-surface-variant font-bold py-4 rounded-full flex items-center justify-center gap-2 no-underline text-sm lg:text-base transition-transform active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">mail</span>
                  Mesaj Gönder
                </Link>
                <RaporlaModal listingId={id} />
              </div>

              <div className="pt-5 border-t border-outline-variant/10">
                <p className="text-[10px] text-center text-on-surface-variant/60 font-bold uppercase tracking-widest">
                  Ortalama yanıt süresi: 2 saat
                </p>
              </div>
            </div>

            <div className="bg-orange-50 p-5 lg:p-6 rounded-xl border border-orange-100/50">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary-container flex-shrink-0">
                  info
                </span>
                <div>
                  <h5 className="font-bold text-orange-900 text-sm">Güvenlik İpucu</h5>
                  <p className="text-xs text-orange-800 leading-relaxed mt-1">
                    Hayvanı görmeden asla ödeme yapmayın. Buluşmayı her zaman güvenli, herkese açık bir yerde veya doğrulanmış barınak konumunda yapın.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <BottomNav />
    </>
  )
}
