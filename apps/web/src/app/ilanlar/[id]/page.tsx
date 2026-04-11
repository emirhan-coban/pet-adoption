import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export default async function IlanDetay({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = createClient()

    const { data: ilan, error } = await supabase
        .from('listings')
        .select('*, listing_media(media_url, is_primary)')
        .eq('id', id)
        .eq('status', 'active')
        .single()

    if (error || !ilan) notFound()

    const fotograflar = ilan.listing_media ?? []
    const anaFoto = fotograflar.find((f: any) => f.is_primary)?.media_url

    return (
        <main className="min-h-screen bg-gray-50">

            {/* Üst bar */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-4xl mx-auto">
                    <a href="/" className="text-blue-600 hover:text-blue-700 text-sm no-underline">← Tüm İlanlara Dön</a>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Ana fotoğraf */}
                    {anaFoto ? (
                        <img src={anaFoto} alt={ilan.name} className="w-full h-96 object-cover" />
                    ) : (
                        <div className="w-full h-96 bg-gray-100 flex items-center justify-center text-7xl">🐾</div>
                    )}

                    {/* Diğer fotoğraflar */}
                    {fotograflar.length > 1 && (
                        <div className="flex gap-2 p-4 overflow-x-auto">
                            {fotograflar.map((f: any, i: number) => (
                                <img key={i} src={f.media_url} alt="" className="w-24 h-24 object-cover rounded-lg flex-shrink-0 cursor-pointer" />
                            ))}
                        </div>
                    )}

                    <div className="p-6">

                        {/* Başlık ve temel bilgiler */}
                        <div className="flex justify-between items-start">
                            <h1 className="text-3xl font-bold text-gray-900">{ilan.name}</h1>
                            <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">Aktif</span>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-3">
                            <span className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">🐾 {ilan.pet_type}</span>
                            <span className="bg-purple-50 text-purple-700 text-sm px-3 py-1 rounded-full">⚥ {ilan.gender}</span>
                            <span className="bg-orange-50 text-orange-700 text-sm px-3 py-1 rounded-full">🗓 {ilan.age_months} aylık</span>
                            {ilan.breed && <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">🏷 {ilan.breed}</span>}
                            <span className="bg-red-50 text-red-700 text-sm px-3 py-1 rounded-full">📍 {ilan.city}{ilan.district ? `, ${ilan.district}` : ''}</span>
                        </div>

                        {/* Açıklama */}
                        <p className="text-gray-600 mt-6 leading-relaxed">{ilan.description}</p>

                        {/* Sağlık durumu */}
                        {ilan.health_status && Object.values(ilan.health_status).some(Boolean) && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-3">Sağlık Durumu</h3>
                                <div className="flex flex-wrap gap-2">
                                    {ilan.health_status.vaccinated && <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">✅ Aşılı</span>}
                                    {ilan.health_status.neutered && <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">✅ Kısırlaştırılmış</span>}
                                    {ilan.health_status.dewormed && <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">✅ Parazit Tedavisi</span>}
                                    {ilan.health_status.microchipped && <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">✅ Mikroçipli</span>}
                                </div>
                            </div>
                        )}

                        {/* Mesaj butonu */}
                        <a
                            href={`/mesajlar/${ilan.id}`}
                            className="mt-6 w-full bg-blue-600 text-white py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors text-center block no-underline text-lg"
                        >
                            💬 Mesaj Gönder
                        </a>

                    </div>
                </div>
            </div>
        </main >
    )
}