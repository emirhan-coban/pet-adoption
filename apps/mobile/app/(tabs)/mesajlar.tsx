import { useState, useEffect } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { Colors, Fonts, BorderRadius, Shadows } from '@/constants/theme'
import { LinearGradient } from 'expo-linear-gradient'

interface Conversation {
  listing_id: string
  other_user_id: string
  listing_name: string
  listing_photo: string | null
  other_user_name: string
  last_message: string
  last_message_time: string
  unread: boolean
  pet_type: string
  city: string
}

function formatZaman(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 1) return 'Şimdi'
  if (mins < 60) return `${mins} dk`
  if (hours < 24) return `${hours} sa`
  if (days < 7) return `${days} gün`
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

function petTypeEmoji(type: string): string {
  switch (type) {
    case 'dog': return '🐕'
    case 'cat': return '🐈'
    case 'bird': return '🐦'
    case 'rabbit': return '🐇'
    default: return '🐾'
  }
}

export default function MesajlarListesi() {
  const router = useRouter()
  const [konusmalar, setKonusmalar] = useState<Conversation[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function yukle() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/(auth)/giris'); return }
      setUser(user)

      // conversation_summaries view'ı (listing_id, kullanıcı çifti) bazında
      // zaten tekilleştirilmiş satırlar döner, böylece aynı ilana iki farklı
      // kullanıcı mesaj atsa bile ayrı konuşmalar olarak listelenir.
      const { data: ozetler } = await supabase
        .from('conversation_summaries')
        .select('listing_id, sender_id, receiver_id, last_message, last_message_at, is_read, pet_type, pet_name, city, pet_photo')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      if (!ozetler || ozetler.length === 0) {
        setYukleniyor(false)
        return
      }

      const conversations: Conversation[] = []

      for (const ozet of ozetler) {
        const otherUserId = ozet.sender_id === user.id ? ozet.receiver_id : ozet.sender_id
        const { data: otherUser } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', otherUserId)
          .single()

        conversations.push({
          listing_id: ozet.listing_id,
          other_user_id: otherUserId,
          listing_name: ozet.pet_name || 'İsimsiz',
          listing_photo: ozet.pet_photo || null,
          other_user_name: otherUser?.full_name || 'Kullanıcı',
          last_message: ozet.last_message,
          last_message_time: ozet.last_message_at,
          unread: !ozet.is_read && ozet.sender_id !== user.id,
          pet_type: ozet.pet_type,
          city: ozet.city,
        })
      }

      setKonusmalar(conversations)
      setYukleniyor(false)
    }
    yukle()
  }, [])

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mesajlar</Text>
        {konusmalar.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{konusmalar.length} sohbet</Text>
          </View>
        )}
      </View>
      <Text style={styles.subtitle}>Sahiplendirme başvurularınız ve sohbetleriniz burada.</Text>

      {yukleniyor ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primaryContainer} />
          <Text style={styles.loadingText}>Sohbetler yükleniyor...</Text>
        </View>
      ) : konusmalar.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
          </View>
          <Text style={styles.emptyTitle}>Henüz mesajınız yok</Text>
          <Text style={styles.emptyBody}>
            İlanlara göz atın ve ilginizi çeken bir can dostu için mesaj gönderin.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.orange700, Colors.orange400]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.exploreBtnGrad}
            >
              <Text style={styles.exploreBtnText}>🔍  İlanları Keşfet</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={konusmalar}
          keyExtractor={(item) => `${item.listing_id}-${item.other_user_id}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.conversationCard}
              onPress={() => router.push({
                pathname: '/mesajlar/[listing_id]',
                params: { listing_id: item.listing_id, with: item.other_user_id },
              } as any)}
              activeOpacity={0.85}
            >
              {/* Avatar */}
              <View style={styles.avatarWrapper}>
                {item.listing_photo ? (
                  <Image
                    source={{ uri: item.listing_photo }}
                    style={styles.avatar}
                  />
                ) : (
                  <LinearGradient
                    colors={[Colors.orange700, Colors.orange400]}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarEmoji}>{petTypeEmoji(item.pet_type)}</Text>
                  </LinearGradient>
                )}
                {item.unread && <View style={styles.unreadDot} />}
              </View>

              {/* Content */}
              <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                  <Text
                    style={[styles.cardTitle, item.unread && styles.cardTitleUnread]}
                    numberOfLines={1}
                  >
                    {item.listing_name}
                  </Text>
                  <Text style={styles.timeText}>{formatZaman(item.last_message_time)}</Text>
                </View>
                <Text style={styles.otherUser} numberOfLines={1}>
                  {item.other_user_name} · {item.city}
                </Text>
                <Text
                  style={[styles.lastMessage, item.unread && styles.lastMessageUnread]}
                  numberOfLines={1}
                >
                  {item.last_message}
                </Text>
              </View>

              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: 12 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: Colors.primaryFixed + '99',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  countText: {
    fontSize: 12,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.primary,
  },
  subtitle: {
    paddingHorizontal: 20,
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.onSurfaceVariant,
    marginBottom: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryFixed + '50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  exploreBtn: {
    marginTop: 8,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.button,
  },
  exploreBtnGrad: {
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  exploreBtnText: {
    fontSize: 14,
    fontFamily: Fonts.headline,
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    padding: 14,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '18',
  },
  avatarWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primaryContainer,
    borderWidth: 2,
    borderColor: Colors.surfaceContainerLowest,
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: Fonts.headlineBold,
    color: Colors.onSurface,
    flex: 1,
  },
  cardTitleUnread: {
    fontFamily: Fonts.headline,
  },
  timeText: {
    fontSize: 11,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    flexShrink: 0,
  },
  otherUser: {
    fontSize: 11,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lastMessage: {
    fontSize: 13,
    fontFamily: Fonts.body,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  lastMessageUnread: {
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurface,
  },
  chevron: {
    fontSize: 22,
    color: Colors.outlineVariant,
    flexShrink: 0,
  },
})
