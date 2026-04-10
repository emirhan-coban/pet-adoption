'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function Cikis() {
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.signOut().then(() => {
            window.location.href = '/'
        })
    }, [])

    return <p style={{ padding: '2rem' }}>Çıkış yapılıyor...</p>
}