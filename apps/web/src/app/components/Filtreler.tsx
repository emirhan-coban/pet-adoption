'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const categories = [
  { key: '', label: 'Tüm Dostlar', icon: 'category' },
  { key: 'dog', label: 'Köpekler', icon: 'pets' },
  { key: 'cat', label: 'Kediler', icon: 'emoji_nature' },
  { key: 'bird', label: 'Kuşlar', icon: 'flutter' },
  { key: 'rabbit', label: 'Tavşanlar', icon: 'cruelty_free' },
  { key: 'other', label: 'Diğer', icon: 'more_horiz' },
]

export default function Filtreler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activePetType = searchParams.get('pet_type') ?? ''

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
    <div className="flex flex-col gap-6 items-center">
      {/* Search Bar */}
      <div className="relative w-full max-w-xl">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-on-surface-variant/50">search</span>
        </div>
        <input
          type="text"
          placeholder="Cins, yaş veya şehir ara..."
          defaultValue={searchParams.get('city') ?? ''}
          onChange={(e) => filtrele('city', e.target.value)}
          className="search-input w-full pl-14 pr-6 py-4 bg-surface-container-high rounded-full border-none outline-none text-on-surface placeholder:text-on-surface-variant/40 transition-all text-sm"
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat) => {
          const isActive = activePetType === cat.key
          return (
            <button
              key={cat.key}
              onClick={() => filtrele('pet_type', cat.key)}
              className={`px-6 lg:px-8 py-2.5 lg:py-3 rounded-full font-semibold font-headline text-sm flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? 'category-pill-active'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] lg:text-[20px]">
                {cat.icon}
              </span>
              {cat.label}
            </button>
          )
        })}

        {/* Gender filter */}
        <select
          value={searchParams.get('gender') ?? ''}
          onChange={(e) => filtrele('gender', e.target.value)}
          className="px-6 py-2.5 lg:py-3 rounded-full font-semibold font-headline text-sm bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest transition-colors cursor-pointer border-none outline-none appearance-none"
        >
          <option value="">Tüm Cinsiyetler</option>
          <option value="male">♂ Erkek</option>
          <option value="female">♀ Dişi</option>
        </select>
      </div>
    </div>
  )
}