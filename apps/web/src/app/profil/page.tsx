import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

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

    return (
        <main className="min-h-screen bg-gray-50">

            {/* Üst bar */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <a href="/" className="text-blue-600 hover:text-blue-700 text-sm no-underline">← Ana Sayfa</a>
                    <a href="/cikis" className="text-red-500 hover:text-red-600 text-sm no-underline">Çıkış Yap</a>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-8">

                {/* Profil kartı */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 mb-8">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl text-white font-bold flex-shrink-0">
                        {profil?.full_name?.[0] ?? user.email?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-900">{profil?.full_name ?? 'İsimsiz Kullanıcı'}</h1>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                        <div className="mt-2">
                            <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                                Güven Skoru: {profil?.trust_score ?? 100}/100
                            </span>
                        </div>
                    </div>
                </div>

                {/* İlanlar başlık */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">İlanlarım ({ilanlar?.length ?? 0})</h2>
                    <a href="/ilan-olustur" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm no-underline hover:bg-blue-700">
                        + Yeni İlan
                    </a>
                </div>

                {ilanlar?.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <div className="text-5xl mb-3">🐾</div>
                        <p className="text-gray-500">Henüz ilan oluşturmadın.</p>
                        <a href="/ilan-olustur" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm no-underline hover:bg-blue-700">
                            İlk İlanını Oluştur
                        </a>
                    </div>
                )}

                {/* İlan grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ilanlar?.map((ilan) => {
                        const foto = ilan.listing_media?.find((m: any) => m.is_primary)?.media_url

                        return (
                            <div key={ilan.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                {foto ? (
                                    <img src={foto} alt={ilan.name} className="w-full h-44 object-cover" />
                                ) : (
                                    <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-4xl">🐾</div>
                                )}
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-gray-900">{ilan.name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${ilan.status === 'active' ? 'bg-green-100 text-green-700' :
                                                ilan.status === 'adopted' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {ilan.status === 'active' ? 'Aktif' : ilan.status === 'adopted' ? 'Sahiplendirildi' : 'Gizli'}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm">📍 {ilan.city}</p>
                                    <div className="flex gap-2 mt-3">
                                        <a href={`/ilanlar/${ilan.id}`} className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-sm text-gray-600 no-underline hover:bg-gray-50">
                                            Görüntüle
                                        </a>
                                        <a href={`/ilan-duzenle/${ilan.id}`} className="flex-1 text-center py-2 border border-blue-200 rounded-lg text-sm text-blue-600 no-underline hover:bg-blue-50">
                                            Düzenle
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    )
}