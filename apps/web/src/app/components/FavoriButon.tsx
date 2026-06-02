'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

interface FavoriButonProps {
  listingId: string
}

export default function FavoriButon({ listingId }: FavoriButonProps) {
  const supabase = createClient()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUser()
  }, [])

  useEffect(() => {
    if (userId) checkFavorite()
  }, [userId, listingId])

  async function checkFavorite() {
    if (!userId) return
    const { data } = await supabase
      .from('favorites')
      .select('listing_id')
      .eq('user_id', userId)
      .eq('listing_id', listingId)
      .maybeSingle()
    
    setIsFavorite(!!data)
  }

  async function toggleFavorite() {
    if (!userId) return
    setLoading(true)
    
    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId)
      setIsFavorite(false)
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, listing_id: listingId })
      setIsFavorite(true)
    }
    
    setLoading(false)
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading || !userId}
      className="w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-50"
      title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
    >
      <span className={`material-symbols-outlined text-lg transition-colors ${isFavorite ? 'text-error icon-fill' : 'text-on-surface-variant'}`}>
        favorite
      </span>
    </button>
  )
}
