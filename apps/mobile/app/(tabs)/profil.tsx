import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { Colors, Fonts, BorderRadius, Shadows } from '@/constants/theme'
import { LinearGradient } from 'expo-linear-gradient'

function formatAge(months: number): string {
  if (months < 1) return 'Yavru'
  if (months < 12) return `${months} Aylık`
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (rem === 0) return `${years} Yaş`
  return `${years}y ${rem}a`
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

function petEmoji(type: string): string {
  switch (type) {
    case 'dog': return '🐕'
    case 'cat': return '🐈'
    case 'bird': return '🐦'
    case 'rabbit': return '🐇'
    default: return '🐾'
  }
}

function statusInfo(status: string): { label: string; bg: string; color: string } {
  switch (status) {
    case 'active': return { label: 'Aktif', bg: Colors.green100, color: Colors.green700 }
    case 'adopted': return { label: 'Sahiplendirildi', bg: '#dbeafe', color: '#1d4ed8' }
    default: return { label: 'Gizli', bg: Colors.errorContainer, color: Colors.error }
  }
}

export default function Profil() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profil, setProfil] = useState<any>(null)
  const [ilanlar, setIlanlar] = useState<any[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [sahiplendirilenSayisi, setSahiplendirilenSayisi] = useState(0)

  useEffect(() => {
    async function yukle() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/(auth)/giris'); return }
      setUser(user)

      const [profilRes, ilanlarRes, sahiplendirilenRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase
          .from('listings')
          .select('*, listing_media(media_url, is_primary)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'adopted'),
      ])

      setProfil(profilRes.data)
      setIlanlar(ilanlarRes.data ?? [])
      setSahiplendirilenSayisi(sahiplendirilenRes.count ?? 0)
      setYukleniyor(false)
    }
    yukle()
  }, [])

  async function cikisYap() {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap', style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut()
          router.replace('/(auth)/giris')
        },
      },
    ])
  }

  if (yukleniyor) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.primaryContainer} />
      </View>
    )
  }

  const displayName = profil?.full_name ?? 'İsimsiz Kullanıcı'
  const initial = displayName[0]?.toUpperCase() ?? 'K'
  const trustScore = profil?.trust_score ?? 100
  const aktifSayisi = ilanlar.filter((i) => i.status === 'active').length

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 12 }]}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Profil</Text>
          <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Profile card */}
        <LinearGradient
          colors={['rgba(255,140,0,0.08)', 'rgba(249,115,22,0.04)', 'transparent']}
          style={styles.profileCard}
        >
          <View style={styles.profileTop}>
            <LinearGradient
              colors={[Colors.orange700, Colors.orange400]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initial}</Text>
            </LinearGradient>

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>{displayName}</Text>
                {trustScore >= 80 && <Text style={styles.verifiedBadge}>✅</Text>}
              </View>
              <Text style={styles.emailText}>{user?.email || ''}</Text>
              <View style={styles.trustRow}>
                <Text style={styles.trustStar}>⭐</Text>
                <Text style={styles.trustText}>Güven Skoru: {trustScore}/100</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{ilanlar.length}</Text>
              <Text style={styles.statLabel}>Toplam İlan</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{aktifSayisi}</Text>
              <Text style={styles.statLabel}>Aktif İlan</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{sahiplendirilenSayisi}</Text>
              <Text style={styles.statLabel}>Sahiplendirilen</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Trust score bar */}
        <View style={styles.trustBarCard}>
          <View style={styles.trustBarHeader}>
            <Text style={styles.trustBarTitle}>Güven Skoru</Text>
            <Text style={styles.trustBarScore}>{trustScore}/100</Text>
          </View>
          <View style={styles.trustBarTrack}>
            <LinearGradient
              colors={[Colors.orange700, Colors.orange400]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.trustBarFill, { width: `${trustScore}%` }]}
            />
          </View>
          <Text style={styles.trustBarHint}>
            {trustScore >= 80
              ? '🎉 Yüksek güven skorunuz var! Profiliniz doğrulanmış görünüyor.'
              : 'İlanlar oluşturarak ve sahiplendirmeler yaparak skorunuzu artırabilirsiniz.'}
          </Text>
        </View>

        {/* My listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>İlanlarım</Text>
            {ilanlar.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/ilan-olustur')}
                activeOpacity={0.75}
              >
                <Text style={styles.sectionAction}>+ Yeni İlan</Text>
              </TouchableOpacity>
            )}
          </View>

          {ilanlar.length === 0 ? (
            <View style={styles.emptyListings}>
              <Text style={styles.emptyListingsEmoji}>🐾</Text>
              <Text style={styles.emptyListingsTitle}>Henüz ilanınız yok</Text>
              <Text style={styles.emptyListingsBody}>
                İlk ilanınızı oluşturarak can dostunuza yeni bir yuva bulun.
              </Text>
              <TouchableOpacity
                style={styles.createFirstBtn}
                onPress={() => router.push('/(tabs)/ilan-olustur')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[Colors.orange700, Colors.orange400]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.createFirstBtnGrad}
                >
                  <Text style={styles.createFirstBtnText}>İlan Oluştur</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.ilanlarList}>
              {ilanlar.map((ilan) => {
                const foto = ilan.listing_media?.find((m: any) => m.is_primary)?.media_url
                  || ilan.listing_media?.[0]?.media_url
                const status = statusInfo(ilan.status)

                return (
                  <TouchableOpacity
                    key={ilan.id}
                    style={styles.ilanCard}
                    onPress={() => router.push(`/ilanlar/${ilan.id}` as any)}
                    activeOpacity={0.85}
                  >
                    {foto ? (
                      <Image source={{ uri: foto }} style={styles.ilanPhoto} />
                    ) : (
                      <LinearGradient
                        colors={[Colors.orange100, Colors.orange50]}
                        style={styles.ilanPhoto}
                      >
                        <Text style={styles.ilanPhotoEmoji}>{petEmoji(ilan.pet_type)}</Text>
                      </LinearGradient>
                    )}

                    <View style={styles.ilanInfo}>
                      <View style={styles.ilanTopRow}>
                        <Text style={styles.ilanName} numberOfLines={1}>{ilan.name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                          <Text style={[styles.statusBadgeText, { color: status.color }]}>
                            {status.label}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.ilanMeta}>
                        {formatPetType(ilan.pet_type)} · {formatAge(ilan.age_months)}
                      </Text>
                      <Text style={styles.ilanLocation} numberOfLines={1}>
                        📍 {ilan.city}{ilan.district ? `, ${ilan.district}` : ''}
                      </Text>
                    </View>

                    <Text style={styles.ilanChevron}>›</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={cikisYap} activeOpacity={0.8}>
          <Text style={styles.signOutIcon}>🚪</Text>
          <Text style={styles.signOutText}>Çıkış Yap</Text>
        </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 20,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 30,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 18,
  },
  profileCard: {
    borderRadius: 24,
    padding: 20,
    gap: 20,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '25',
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 30,
    fontFamily: Fonts.headline,
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    fontSize: 20,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    fontSize: 16,
  },
  emailText: {
    fontSize: 13,
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  trustStar: {
    fontSize: 12,
  },
  trustText: {
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
    color: Colors.onSurface,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    paddingVertical: 16,
    ...Shadows.card,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: Fonts.headline,
    color: Colors.primaryContainer,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.outlineVariant + '40',
    marginVertical: 4,
  },
  trustBarCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 18,
    gap: 10,
    ...Shadows.card,
  },
  trustBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trustBarTitle: {
    fontSize: 15,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
  },
  trustBarScore: {
    fontSize: 15,
    fontFamily: Fonts.headline,
    color: Colors.primaryContainer,
  },
  trustBarTrack: {
    height: 8,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 4,
    overflow: 'hidden',
  },
  trustBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  trustBarHint: {
    fontSize: 12,
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
  },
  sectionAction: {
    fontSize: 13,
    fontFamily: Fonts.bodyBold,
    color: Colors.primaryContainer,
  },
  emptyListings: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    paddingHorizontal: 24,
    ...Shadows.card,
  },
  emptyListingsEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyListingsTitle: {
    fontSize: 18,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  emptyListingsBody: {
    fontSize: 13,
    fontFamily: Fonts.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  createFirstBtn: {
    marginTop: 4,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.button,
  },
  createFirstBtnGrad: {
    paddingHorizontal: 28,
    paddingVertical: 13,
  },
  createFirstBtnText: {
    fontSize: 14,
    fontFamily: Fonts.headline,
    color: '#fff',
  },
  ilanlarList: {
    gap: 10,
  },
  ilanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    padding: 12,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '18',
  },
  ilanPhoto: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  ilanPhotoEmoji: {
    fontSize: 28,
  },
  ilanInfo: {
    flex: 1,
    gap: 3,
  },
  ilanTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  ilanName: {
    fontSize: 16,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    flexShrink: 0,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.bodyBold,
  },
  ilanMeta: {
    fontSize: 12,
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
  ilanLocation: {
    fontSize: 12,
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
  ilanChevron: {
    fontSize: 22,
    color: Colors.outlineVariant,
    flexShrink: 0,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.errorContainer + '60',
    marginTop: 4,
  },
  signOutIcon: {
    fontSize: 16,
  },
  signOutText: {
    fontSize: 15,
    fontFamily: Fonts.bodyBold,
    color: Colors.error,
  },
})
