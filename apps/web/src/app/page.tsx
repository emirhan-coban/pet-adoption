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
  searchParams: Promise<{ pet_type?: string; gender?: string; city?: string }>
}) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const filters = await searchParams

  let query = supabase
    .from('listings')
    .select('*, listing_media(media_url, is_primary)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (filters.pet_type) query = query.eq('pet_type', filters.pet_type)
  if (filters.gender) query = query.eq('gender', filters.gender)
  if (filters.city) query = query.ilike('city', `%${filters.city}%`)

  const { data: ilanlar, error } = await query

  if (error) {
    return <p className="p-8 text-error">İlanlar yüklenirken hata oluştu.</p>
  }

  return (
    <>
      {/* Header */}
      <Header user={user} />

      <main className="pt-24 pb-32 md:pb-16 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
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

        {/* Results count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-on-surface-variant text-sm font-medium">
            <span className="text-on-surface font-bold">{ilanlar.length}</span> ilan bulundu
          </p>
        </div>

        {/* Pet Grid */}
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
        )}
      </main>

      {/* Floating Action Button — Desktop */}
      <Link
        href="/ilan-olustur"
        className="fixed bottom-10 right-10 bg-primary-container text-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all hidden md:flex items-center gap-2 editorial-shadow no-underline z-40"
      >
        <span className="material-symbols-outlined">pets</span>
        <span className="font-bold text-sm font-headline">İlan Oluştur</span>
      </Link>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </>
  )
}