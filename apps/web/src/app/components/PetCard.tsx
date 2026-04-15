'use client'

import Link from 'next/link'

interface PetCardProps {
  id: string
  name: string
  petType: string
  gender: string
  city: string
  district?: string
  ageMonths: number
  description?: string
  photoUrl?: string
  index?: number
}

function formatAge(months: number): string {
  if (months < 1) return 'Yavru'
  if (months < 12) return `${months} Aylık`
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (remainingMonths === 0) return `${years} Yaş`
  return `${years} Yıl ${remainingMonths} Ay`
}

function getGenderIcon(gender: string): { icon: string; color: string; label: string } {
  if (gender === 'female') {
    return { icon: 'female', color: 'text-orange-500', label: 'Dişi' }
  }
  return { icon: 'male', color: 'text-blue-500', label: 'Erkek' }
}

function getPetTypeEmoji(petType: string): string {
  switch (petType) {
    case 'dog': return 'Köpek'
    case 'cat': return 'Kedi'
    case 'bird': return 'Kuş'
    case 'rabbit': return 'Tavşan'
    default: return 'Diğer'
  }
}

export default function PetCard({
  id,
  name,
  petType,
  gender,
  city,
  district,
  ageMonths,
  description,
  photoUrl,
  index = 0,
}: PetCardProps) {
  const genderInfo = getGenderIcon(gender)

  return (
    <div
      className="bg-surface-container-lowest rounded-xl overflow-hidden group cursor-pointer card-lift animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Link href={`/ilanlar/${id}`} className="no-underline text-inherit block">
        {/* Image */}
        <div className="relative h-64 xl:h-72 overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="w-full h-full object-cover card-image-zoom"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-orange-300">pets</span>
            </div>
          )}

          {/* Gender Badge */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <span
              className={`material-symbols-outlined text-sm icon-fill ${genderInfo.color}`}
            >
              {genderInfo.icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              {genderInfo.label}
            </span>
          </div>

          {/* Pet type badge */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              {getPetTypeEmoji(petType)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5 lg:p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl lg:text-2xl font-bold font-headline text-on-surface">
              {name}
            </h3>
            <span className="text-primary-container font-bold text-sm whitespace-nowrap ml-3">
              {formatAge(ageMonths)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-on-surface-variant mb-4">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span className="text-sm font-medium">
              {city}{district ? `, ${district}` : ''}
            </span>
          </div>

          {description && (
            <p className="text-sm text-on-surface-variant/70 line-clamp-2 mb-4">
              {description}
            </p>
          )}

          <button
            className="w-full py-3 rounded-full btn-gradient text-sm tracking-tight cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              window.location.href = `/ilanlar/${id}`
            }}
          >
            {name} ile Tanış
          </button>
        </div>
      </Link>
    </div>
  )
}
