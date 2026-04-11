'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function Filtreler() {
    const router = useRouter()
    const searchParams = useSearchParams()

    function filtrele(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (value === '') {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        router.push(`/?${params.toString()}`)
    }

    return (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '1rem 0' }}>
            <select
                defaultValue={searchParams.get('pet_type') ?? ''}
                onChange={(e) => filtrele('pet_type', e.target.value)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '8px', fontSize: '0.9rem' }}
            >
                <option value="">Tüm Türler</option>
                <option value="cat">Kedi</option>
                <option value="dog">Köpek</option>
                <option value="bird">Kuş</option>
                <option value="rabbit">Tavşan</option>
                <option value="other">Diğer</option>
            </select>

            <select
                defaultValue={searchParams.get('gender') ?? ''}
                onChange={(e) => filtrele('gender', e.target.value)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '8px', fontSize: '0.9rem' }}
            >
                <option value="">Tüm Cinsiyetler</option>
                <option value="male">Erkek</option>
                <option value="female">Dişi</option>
            </select>

            <input
                type="text"
                placeholder="Şehir ara..."
                defaultValue={searchParams.get('city') ?? ''}
                onChange={(e) => filtrele('city', e.target.value)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '8px', fontSize: '0.9rem' }}
            />
        </div>
    )
}