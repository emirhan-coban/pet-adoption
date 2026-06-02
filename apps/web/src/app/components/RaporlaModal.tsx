'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

interface RaporlaModalProps {
  listingId: string
}

const REASONS = [
  { value: 'spam', label: 'Spam veya yanıltıcı' },
  { value: 'scam', label: 'Dolandırıcılık şüphesi' },
  { value: 'inappropriate', label: 'Uygunsuz içerik' },
  { value: 'sold', label: 'Satılık olarak ilan edilmiş' },
  { value: 'other', label: 'Diğer' },
]

export default function RaporlaModal({ listingId }: RaporlaModalProps) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [reporterId, setReporterId] = useState<string | null>(null)
  const [reason, setReason] = useState('spam')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const [basarili, setBasarili] = useState(false)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setReporterId(user.id)
    }
    getUser()
  }, [])

  async function raporla() {
    if (!reporterId) {
      setMesaj('Şikayet etmek için giriş yapmalısınız.')
      return
    }
    
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
      setMesaj('Şikayet gönderilirken hata oluştu: ' + error.message)
    } else {
      setBasarili(true)
      setMesaj('Şikayetiniz alındı. Teşekkür ederiz.')
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
        onClick={() => setIsOpen(true)}
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
              <button
                onClick={() => setIsOpen(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {basarili ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-green-600 text-5xl mb-4 block">check_circle</span>
                <p className="text-on-surface-variant">{mesaj}</p>
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
                    Açıklama (opsiyonel)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Şikayetiniz hakkında ek bilgi..."
                    className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 transition-all text-on-surface"
                    rows={3}
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
