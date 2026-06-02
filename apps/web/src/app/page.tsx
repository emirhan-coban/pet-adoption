import { createServerSupabase } from '@/lib/supabase-server'
import { Suspense } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Filtreler from './components/Filtreler'
import PetCard from './components/PetCard'
import Link from 'next/link'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ pet_type?: string; gender?: string; city?: string; page?: string }>
}) {
  const supabase = await createServerSupabase()
  const filters = await searchParams

  const page = parseInt(filters.page || '1')
  const pageSize = 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('listings')
    .select('*, listing_media(media_url, is_primary)', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters.pet_type) query = query.eq('pet_type', filters.pet_type)
  if (filters.gender) query = query.eq('gender', filters.gender)
  if (filters.city) query = query.ilike('city', `%${filters.city}%`)

  const { data: ilanlar, error, count } = await query

  if (error) {
    return <p className="p-8 text-error">İlanlar yüklenirken hata oluştu.</p>
  }

  const totalPages = Math.ceil((count || 0) / pageSize)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams()
    if (filters.pet_type) params.set('pet_type', filters.pet_type)
    if (filters.gender) params.set('gender', filters.gender)
    if (filters.city) params.set('city', filters.city)
    if (pageNum > 1) params.set('page', pageNum.toString())
    const qs = params.toString()
    return qs ? `/?${qs}` : '/'
  }

  return (
    <>
      <Header />

      <main className="pt-24 pb-32 md:pb-16 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full">
        <section className="mb-10 md:mb-14 pt-4 md:pt-8">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-4 leading-tight font-headline">
              Yeni{' '}
              <span className="text-primary-container">can dostunu</span>{' '}
              sahiplen
            </h2>
            <p className="text-on-surface-variant text-base md:text-lg">
              Türkiye genelinde binlerce hayvan seni bekliyor. Ücretsiz ilan aç, başvur, sahiplen.
            </p>
          </div>

          <Suspense>
            <Filtreler />
          </Suspense>
        </section>

        <div className="flex justify-between items-center mb-6">
          <p className="text-on-surface-variant text-sm font-medium">
            <span className="text-on-surface font-bold">{count || 0}</span> ilan bulundu
          </p>
          {totalPages > 1 && (
            <p className="text-on-surface-variant text-sm">
              Sayfa <span className="text-on-surface font-bold">{page}</span> / {totalPages}
            </p>
          )}
        </div>

        {ilanlar.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">
              search_off
            </span>
            <h3 className="text-xl font-bold font-headline text-on-surface mb-2">
              Sonuç bulunamadı
            </h3>
            <p className="text-on-surface-variant">
              Farklı filtreler deneyerek aradığın can dostunu bulabilirsin.
            </p>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {ilanlar.map((ilan: any, index: number) => {
                const foto = ilan.listing_media?.find((m: any) => m.is_primary)?.media_url

                return (
                  <PetCard
                    key={ilan.id}
                    id={ilan.id}
                    name={ilan.name}
                    petType={ilan.pet_type}
                    gender={ilan.gender}
                    city={ilan.city}
                    district={ilan.district}
                    ageMonths={ilan.age_months}
                    description={ilan.description}
                    photoUrl={foto}
                    index={index}
                  />
                )
              })}
            </section>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                {hasPrevPage ? (
                  <Link
                    href={buildPageUrl(page - 1)}
                    className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface-variant rounded-full font-semibold hover:bg-surface-container-highest transition-colors no-underline"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                    Önceki
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 px-6 py-3 text-on-surface-variant/30">
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                    Önceki
                  </div>
                )}

                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }

                    return (
                      <Link
                        key={pageNum}
                        href={buildPageUrl(pageNum)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold no-underline transition-colors ${
                          pageNum === page
                            ? 'bg-primary text-white'
                            : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    )
                  })}
                </div>

                {hasNextPage ? (
                  <Link
                    href={buildPageUrl(page + 1)}
                    className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface-variant rounded-full font-semibold hover:bg-surface-container-highest transition-colors no-underline"
                  >
                    Sonraki
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 px-6 py-3 text-on-surface-variant/30">
                    Sonraki
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Link
        href="/ilan-olustur"
        className="fixed bottom-10 right-10 bg-primary-container text-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all hidden md:flex items-center gap-2 editorial-shadow no-underline z-40"
      >
        <span className="material-symbols-outlined">pets</span>
        <span className="font-bold text-sm font-headline">İlan Oluştur</span>
      </Link>

      <BottomNav />
    </>
  )
}
