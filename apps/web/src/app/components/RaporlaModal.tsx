'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

interface RaporlaModalProps {
  listingId: string
  listingOwnerId: string
}

const REASONS = [
  { value: 'spam', label: 'Spam veya yanıltıcı' },
  { value: 'scam', label: 'Dolandırıcılık şüphesi' },
  { value: 'inappropriate', label: 'Uygunsuz içerik' },
  { value: 'sold', label: 'Satılık olarak ilan edilmiş' },
  { value: 'other', label: 'Diğer' },
]

export default function RaporlaModal({ listingId, listingOwnerId }: RaporlaModalProps) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [reporterId, setReporterId] = useState<string | null>(null)
  const [reason, setReason] = useState('spam')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const [basarili, setBasarili] = useState(false)
  const [alreadyReported, setAlreadyReported] = useState(false)
  const [isSelfListing, setIsSelfListing] = useState(false)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setReporterId(user.id)
        setIsSelfListing(user.id === listingOwnerId)
      }
    }
    getUser()
  }, [listingOwnerId])

  async function handleOpen() {
    setIsOpen(true)

    if (!reporterId) return
    if (reporterId === listingOwnerId) return

    setChecking(true)
    const { data: mevcutRapor } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', reporterId)
      .eq('listing_id', listingId)
      .maybeSingle()

    setAlreadyReported(!!mevcutRapor)
    setChecking(false)
  }

  async function raporla() {
    if (!reporterId) {
      setMesaj('Şikayet etmek için giriş yapmalısınız.')
      return
    }
    if (reporterId === listingOwnerId) {
      setMesaj('Kendi ilanınızı şikayet edemezsiniz.')
      return
    }
    if (alreadyReported) return

    setLoading(true)
    setMesaj('')

    const { error } = await supabase.from('reports').insert({
      reporter_id: reporterId,
      listing_id: listingId,
      reason,
      description: description || null,
    })

    setLoading(false)

    if (error) {
      if (error.code === '23505') {
        setAlreadyReported(true)
      } else {
        setMesaj('Şikayet gönderilirken hata oluştu: ' + error.message)
      }
    } else {
      setBasarili(true)
      setTimeout(() => {
        setIsOpen(false)
        setMesaj('')
        setDescription('')
        setBasarili(false)
      }, 2000)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full flex items-center justify-center gap-2 text-on-surface-variant hover:text-error transition-colors py-2 text-sm font-semibold"
      >
        <span className="material-symbols-outlined text-base">flag</span>
        İlanı Şikayet Et
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold font-headline">İlanı Şikayet Et</h3>
              <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {basarili ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-green-600 text-5xl mb-4 block">check_circle</span>
                <p className="text-on-surface font-bold mb-1">Şikayetiniz alındı</p>
                <p className="text-on-surface-variant text-sm">Ekibimiz inceleyecek ve gerekli işlemi yapacaktır.</p>
              </div>
            ) : checking ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : isSelfListing ? (
              <div className="py-6 text-center">
                <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-3 block">info</span>
                <p className="text-on-surface-variant text-sm">Kendi ilanınızı şikayet edemezsiniz.</p>
                <button onClick={() => setIsOpen(false)} className="mt-4 text-primary font-semibold text-sm">Kapat</button>
              </div>
            ) : alreadyReported ? (
              <div className="py-6 text-center">
                <span className="material-symbols-outlined text-primary-container text-4xl mb-3 block">task_alt</span>
                <p className="text-on-surface font-bold mb-1">Daha önce şikayet ettiniz</p>
                <p className="text-on-surface-variant text-sm">Bu ilan için zaten bir şikayetiniz mevcut. Ekibimiz inceliyor.</p>
                <button onClick={() => setIsOpen(false)} className="mt-4 text-primary font-semibold text-sm">Kapat</button>
              </div>
            ) : !reporterId ? (
              <div className="py-6 text-center">
                <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-3 block">login</span>
                <p className="text-on-surface-variant text-sm">Şikayet etmek için giriş yapmanız gerekiyor.</p>
                <button onClick={() => setIsOpen(false)} className="mt-4 text-primary font-semibold text-sm">Kapat</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1 mb-2 block">
                    Şikayet Nedeni
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 transition-all text-on-surface"
                  >
                    {REASONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1 mb-2 block">
                    Açıklama <span className="normal-case font-normal">(opsiyonel)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Şikayetiniz hakkında ek bilgi..."
                    className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 transition-all text-on-surface"
                    rows={3}
                    maxLength={500}
                  />
                </div>

                {mesaj && (
                  <div className="p-3 rounded-lg text-sm bg-error-container/50 text-on-error-container">
                    {mesaj}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-surface-container-high text-on-surface-variant font-semibold py-3 rounded-full hover:bg-surface-container-highest transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={raporla}
                    disabled={loading}
                    className="flex-1 bg-error text-white font-bold py-3 rounded-full shadow-md active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Gönderiliyor...' : 'Şikayet Gönder'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
