import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Fonts, BorderRadius, Shadows } from '@/constants/theme'

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
}

function formatAge(months: number): string {
  if (months < 1) return 'Yavru'
  if (months < 12) return `${months} Aylık`
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (remainingMonths === 0) return `${years} Yaş`
  return `${years}y ${remainingMonths}a`
}

function getPetTypeLabel(petType: string): string {
  switch (petType) {
    case 'dog': return 'Köpek'
    case 'cat': return 'Kedi'
    case 'bird': return 'Kuş'
    case 'rabbit': return 'Tavşan'
    default: return 'Diğer'
  }
}

function getPetEmoji(petType: string): string {
  switch (petType) {
    case 'dog': return '🐕'
    case 'cat': return '🐈'
    case 'bird': return '🐦'
    case 'rabbit': return '🐇'
    default: return '🐾'
  }
}

function getGenderInfo(gender: string): { emoji: string; label: string; color: string } {
  if (gender === 'female') {
    return { emoji: '♀️', label: 'Dişi', color: Colors.orange500 }
  }
  return { emoji: '♂️', label: 'Erkek', color: Colors.blue500 }
}

export default function PetCard({
  id, name, petType, gender, city, district, ageMonths, description, photoUrl,
}: PetCardProps) {
  const router = useRouter()
  const genderInfo = getGenderInfo(gender)

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/ilanlar/${id}`)}
      activeOpacity={0.92}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={[Colors.orange100, Colors.orange50]}
            style={styles.imagePlaceholder}
          >
            <Text style={styles.placeholderEmoji}>{getPetEmoji(petType)}</Text>
          </LinearGradient>
        )}

        {/* Type badge - top left */}
        <View style={styles.badgeTopLeft}>
          <Text style={styles.badgeText}>{getPetTypeLabel(petType)}</Text>
        </View>

        {/* Gender badge - top right */}
        <View style={styles.badgeTopRight}>
          <Text style={[styles.badgeGenderEmoji]}>{genderInfo.emoji}</Text>
          <Text style={styles.badgeText}>{genderInfo.label}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Text style={styles.petName} numberOfLines={1}>{name}</Text>
          <Text style={styles.ageText}>{formatAge(ageMonths)}</Text>
        </View>

        <View style={styles.locationRow}>
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {city}{district ? `, ${district}` : ''}
          </Text>
        </View>

        {description ? (
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.ctaWrapper}
          onPress={() => router.push(`/ilanlar/${id}`)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.orange700, Colors.orange400]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaText}>{name} ile Tanış</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    ...Shadows.card,
  },
  imageContainer: {
    height: 220,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 64,
  },
  badgeTopLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  badgeTopRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: Fonts.bodyBold,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeGenderEmoji: {
    fontSize: 12,
  },
  info: {
    padding: 16,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  petName: {
    fontSize: 20,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
    flex: 1,
    marginRight: 8,
  },
  ageText: {
    fontSize: 13,
    fontFamily: Fonts.bodyBold,
    color: Colors.primaryContainer,
    flexShrink: 0,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationPin: {
    fontSize: 12,
  },
  locationText: {
    fontSize: 13,
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurfaceVariant,
    flex: 1,
  },
  description: {
    fontSize: 13,
    fontFamily: Fonts.body,
    color: Colors.onSurfaceVariant + 'BB',
    lineHeight: 20,
    marginBottom: 2,
  },
  ctaWrapper: {
    marginTop: 8,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  ctaBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontFamily: Fonts.headline,
    color: '#fff',
  },
})
