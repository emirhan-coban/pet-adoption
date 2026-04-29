import { useState, useEffect, useRef } from 'react'
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  ActivityIndicator, FlatList, Dimensions, Platform,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { Colors, Fonts, BorderRadius, Shadows } from '@/constants/theme'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const { width: SCREEN_W } = Dimensions.get('window')

function formatAge(months: number): string {
  if (months < 1) return 'Yavru'
  if (months < 12) return `${months} Aylık`
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (rem === 0) return `${years} Yaş`
  return `${years} Yıl ${rem} Ay`
}
function formatPetType(type: string): string {
  switch (type) {
    case 'dog': return 'Köpek'
    case 'cat': return 'Kedi'
    case 'bird': return 'Kuş'
    case 'rabbit': return 'Tavşan'
    default: return 'Diğer'
  }
}
function formatGender(g: string): string {
  return g === 'female' ? 'Dişi' : 'Erkek'
}
function getAgeLabel(months: number): string {
  if (months < 6) return 'Yavru'
  if (months < 24) return 'Genç'
  return 'Yetişkin'
}

export default function IlanDetay() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [ilan, setIlan] = useState<any>(null)
  const [ilanSahibi, setIlanSahibi] = useState<any>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    async function yukle() {
      const { data, error } = await supabase
        .from('listings')
        .select('*, listing_media(media_url, is_primary)')
        .eq('id', id)
        .eq('status', 'active')
        .single()

      if (error || !data) { router.back(); return }
      setIlan(data)

      if (data.user_id) {
        const { data: owner } = await supabase
          .from('users')
          .select('full_name, trust_score')
          .eq('id', data.user_id)
          .single()
        setIlanSahibi(owner)
      }
      setYukleniyor(false)
    }
    if (id) yukle()
  }, [id])

  if (yukleniyor) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.primaryContainer} />
      </View>
    )
  }
  if (!ilan) return null

  const fotograflar: string[] = (ilan.listing_media ?? []).map((m: any) => m.media_url).filter(Boolean)
  const healthStatus = ilan.health_status as any

  const traits = [
    { emoji: '💉', label: 'Aşılı', active: !!healthStatus?.vaccinated },
    { emoji: '✂️', label: 'Kısırlaştırılmış', active: !!healthStatus?.neutered },
    { emoji: '🐛', label: 'Parazit Tedavisi', active: !!healthStatus?.dewormed },
    { emoji: '📡', label: 'Mikroçipli', active: !!healthStatus?.microchipped },
  ].filter((t) => t.active)

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Back button overlayed on image */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.onSurface} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Image carousel */}
        {fotograflar.length > 0 ? (
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={fotograflar}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="cover" />
              )}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W)
                setCurrentImage(idx)
              }}
            />
            {fotograflar.length > 1 && (
              <View style={styles.dotRow}>
                {fotograflar.map((_, i) => (
                  <View key={i} style={[styles.dot, i === currentImage && styles.dotActive]} />
                ))}
              </View>
            )}
          </View>
        ) : (
          <LinearGradient
            colors={[Colors.orange100, Colors.orange50]}
            style={styles.imagePlaceholder}
          >
            <Text style={styles.placeholderEmoji}>
              {formatPetType(ilan.pet_type) === 'Köpek' ? '🐕' : formatPetType(ilan.pet_type) === 'Kedi' ? '🐈' : '🐾'}
            </Text>
          </LinearGradient>
        )}

        <View style={styles.contentPad}>
          {/* Status badge */}
          <Text style={styles.statusBadge}>Sahiplendirmeye Açık</Text>

          {/* Name & tags */}
          <View style={styles.nameRow}>
            <Text style={styles.petName}>{ilan.name}</Text>
            <View style={styles.tagsRow}>
              <View style={styles.tagChip}>
                <Text style={styles.tagText}>{getAgeLabel(ilan.age_months)}</Text>
              </View>
              <View style={[styles.tagChip, styles.tagChipSecondary]}>
                <Text style={styles.tagText}>{formatGender(ilan.gender)}</Text>
              </View>
            </View>
          </View>

          {/* Info bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.infoBar}
            contentContainerStyle={styles.infoBarContent}
          >
            {ilan.breed && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>CİNS</Text>
                <Text style={styles.infoValue}>{ilan.breed}</Text>
              </View>
            )}
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>TÜR</Text>
              <Text style={styles.infoValue}>{formatPetType(ilan.pet_type)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>YAŞ</Text>
              <Text style={styles.infoValue}>{formatAge(ilan.age_months)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>KONUM</Text>
              <Text style={styles.infoValue}>{ilan.city}{ilan.district ? `, ${ilan.district}` : ''}</Text>
            </View>
          </ScrollView>

          {/* Description */}
          {ilan.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{ilan.name} Hakkında</Text>
              <Text style={styles.descriptionText}>{ilan.description}</Text>
            </View>
          )}

          {/* Health traits */}
          {traits.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sağlık & Özellikler</Text>
              <View style={styles.traitGrid}>
                {traits.map((t) => (
                  <View key={t.label} style={styles.traitCard}>
                    <Text style={styles.traitEmoji}>{t.emoji}</Text>
                    <Text style={styles.traitLabel}>{t.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{ilan.name} ile Nerede Buluşabilirsin?</Text>
            <View style={styles.locationCard}>
              <View style={styles.locationDot}>
                <Text style={styles.locationDotEmoji}>📍</Text>
              </View>
              <Text style={styles.locationCardText}>
                {ilan.city}{ilan.district ? `, ${ilan.district}` : ''}
              </Text>
            </View>
          </View>

          {/* Owner info card */}
          <View style={styles.ownerCard}>
            {ilanSahibi && (
              <View style={styles.ownerRow}>
                <LinearGradient
                  colors={[Colors.orange700, Colors.orange400]}
                  style={styles.ownerAvatar}
                >
                  <Text style={styles.ownerAvatarText}>
                    {ilanSahibi.full_name?.[0]?.toUpperCase() || '?'}
                  </Text>
                </LinearGradient>
                <View style={styles.ownerInfo}>
                  <View style={styles.ownerNameRow}>
                    <Text style={styles.ownerName}>
                      {ilanSahibi.full_name || 'İlan Sahibi'}
                    </Text>
                    {(ilanSahibi.trust_score ?? 0) >= 80 && (
                      <Text style={styles.verifiedEmoji}>✅</Text>
                    )}
                  </View>
                  <Text style={styles.ownerRole}>İlan Sahibi</Text>
                  {ilanSahibi.trust_score != null && (
                    <Text style={styles.trustScore}>⭐ Güven Skoru: {ilanSahibi.trust_score}/100</Text>
                  )}
                </View>
              </View>
            )}

            {/* CTA Buttons */}
            <View style={styles.ctaContainer}>
              <TouchableOpacity
                style={styles.ctaWrapperMain}
                onPress={() => router.push(`/mesajlar/${ilan.id}` as any)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[Colors.orange700, Colors.orange400]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaMain}
                >
                  <Text style={styles.ctaMainText}>Sahiplenme Başvurusu Yap</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ctaSecondary}
                onPress={() => router.push(`/mesajlar/${ilan.id}` as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.ctaSecondaryEmoji}>✉️</Text>
                <Text style={styles.ctaSecondaryText}>Mesaj Gönder</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.responseTime}>Ortalama yanıt süresi: 2 saat</Text>

            {/* Safety tip */}
            <View style={styles.safetyTip}>
              <Text style={styles.safetyIcon}>ℹ️</Text>
              <View style={styles.safetyTextCol}>
                <Text style={styles.safetyTitle}>Güvenlik İpucu</Text>
                <Text style={styles.safetyBody}>
                  Hayvanı görmeden asla ödeme yapmayın. Buluşmayı her zaman güvenli, herkese açık bir yerde yapın.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 20,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  carouselContainer: {
    height: 320,
  },
  carouselImage: {
    width: SCREEN_W,
    height: 320,
  },
  dotRow: {
    position: 'absolute',
    bottom: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 20,
  },
  imagePlaceholder: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 80,
  },
  contentPad: {
    padding: 20,
  },
  statusBadge: {
    fontSize: 11,
    fontFamily: Fonts.bodyBold,
    color: Colors.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  petName: {
    fontSize: 36,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
    letterSpacing: -1,
    lineHeight: 42,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tagChip: {
    backgroundColor: Colors.primaryContainer + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tagChipSecondary: {
    backgroundColor: Colors.secondaryContainer + '50',
  },
  tagText: {
    fontSize: 12,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.onSurface,
  },
  infoBar: {
    marginHorizontal: -20,
    marginBottom: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.outlineVariant + '33',
    paddingVertical: 16,
  },
  infoBarContent: {
    paddingHorizontal: 20,
    gap: 24,
    flexDirection: 'row',
  },
  infoItem: {
    gap: 4,
    minWidth: 60,
  },
  infoLabel: {
    fontSize: 10,
    fontFamily: Fonts.bodyBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
  },
  section: {
    marginBottom: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.onSurfaceVariant,
    lineHeight: 24,
  },
  traitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  traitCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    minWidth: 80,
    flex: 1,
  },
  traitEmoji: {
    fontSize: 28,
  },
  traitLabel: {
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  locationCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.md,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationDotEmoji: {
    fontSize: 22,
  },
  locationCardText: {
    fontSize: 16,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
  },
  ownerCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    ...Shadows.editorial,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '20',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  ownerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatarText: {
    fontSize: 22,
    fontFamily: Fonts.headline,
    color: '#fff',
  },
  ownerInfo: {
    flex: 1,
    gap: 2,
  },
  ownerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ownerName: {
    fontSize: 16,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
  },
  verifiedEmoji: {
    fontSize: 14,
  },
  ownerRole: {
    fontSize: 12,
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
  trustScore: {
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
    color: Colors.onSurface,
    marginTop: 2,
  },
  ctaContainer: {
    gap: 10,
  },
  ctaWrapperMain: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.button,
  },
  ctaMain: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaMainText: {
    fontSize: 15,
    fontFamily: Fonts.headline,
    color: '#fff',
  },
  ctaSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  ctaSecondaryEmoji: {
    fontSize: 16,
  },
  ctaSecondaryText: {
    fontSize: 14,
    fontFamily: Fonts.bodyBold,
    color: Colors.onSurfaceVariant,
  },
  responseTime: {
    textAlign: 'center',
    fontSize: 10,
    fontFamily: Fonts.bodyBold,
    color: Colors.onSurfaceVariant + '88',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  safetyTip: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Colors.orange50,
    borderRadius: BorderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.orange100,
  },
  safetyIcon: {
    fontSize: 18,
    flexShrink: 0,
  },
  safetyTextCol: {
    flex: 1,
    gap: 4,
  },
  safetyTitle: {
    fontSize: 13,
    fontFamily: Fonts.bodyBold,
    color: Colors.orange900,
  },
  safetyBody: {
    fontSize: 12,
    fontFamily: Fonts.body,
    color: Colors.orange800,
    lineHeight: 18,
  },
})
