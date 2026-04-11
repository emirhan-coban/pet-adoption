import { createServerSupabase } from '@/lib/supabase-server'
import { Suspense } from 'react'
import Filtreler from './components/Filtreler'

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
    return <p className="p-8 text-red-500">İlanlar yüklenirken hata oluştu.</p>
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Üst bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-600 no-underline">🐾 PatternPaw</a>
          <div className="flex gap-3 items-center">
            {user ? (
              <>
                <a href="/profil" className="text-gray-600 hover:text-gray-900 no-underline text-sm">{user.email}</a>
                <a href="/ilan-olustur" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm no-underline hover:bg-blue-700">+ İlan Ver</a>
                <a href="/cikis" className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm no-underline hover:bg-red-100">Çıkış</a>
              </>
            ) : (
              <a href="/giris" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm no-underline hover:bg-blue-700">Giriş Yap</a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-blue-600 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Bir Can Dostuna Yuva Ol</h1>
          <p className="text-blue-100 text-lg">Türkiye'nin en güvenilir hayvan sahiplendirme platformu</p>
        </div>
      </div>

      {/* İçerik */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-500">{ilanlar.length} ilan bulundu</p>
        </div>

        <Suspense>
          <Filtreler />
        </Suspense>

        {/* İlan grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {ilanlar.map((ilan) => {
            const foto = ilan.listing_media?.find((m: any) => m.is_primary)?.media_url

            return (
              <a
                key={ilan.id}
                href={`/ilanlar/${ilan.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow no-underline text-inherit"
              >
                {foto ? (
                  <img src={foto} alt={ilan.name} className="w-full h-52 object-cover" />
                ) : (
                  <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-5xl">🐾</div>
                )}
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900">{ilan.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">🐾 {ilan.pet_type} · {ilan.gender}</p>
                  <p className="text-gray-500 text-sm">📍 {ilan.city}{ilan.district ? `, ${ilan.district}` : ''}</p>
                  <p className="text-gray-500 text-sm">🗓 {ilan.age_months} aylık</p>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{ilan.description}</p>
                </div>
              </a>
            )
          })}
        </div>
      </div >
    </main >
  )
}