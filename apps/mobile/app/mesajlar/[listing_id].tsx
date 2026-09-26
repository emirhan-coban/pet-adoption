import { useState, useEffect, useRef } from 'react'
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator, KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { Colors, Fonts, BorderRadius, Shadows } from '@/constants/theme'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

export default function Chat() {
  const { listing_id, with: withParam } = useLocalSearchParams<{ listing_id: string; with?: string }>()
  const router = useRouter()
  const [mesajlar, setMesajlar] = useState<any[]>([])
  const [yeniMesaj, setYeniMesaj] = useState('')
  const [user, setUser] = useState<any>(null)
  const [ilan, setIlan] = useState<any>(null)
  const [ilanSahibi, setIlanSahibi] = useState<any>(null)
  const [ilanFoto, setIlanFoto] = useState<string | null>(null)
  const [digerKullaniciId, setDigerKullaniciId] = useState<string>('')
  const [yukleniyor, setYukleniyor] = useState(true)
  const [gonderiyor, setGonderiyor] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    async function yukle() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/(auth)/giris'); return }
      setUser(user)

      const { data: ilanData } = await supabase
        .from('listings')
        .select('*, listing_media(media_url, is_primary)')
        .eq('id', listing_id)
        .single()
      setIlan(ilanData)

      if (ilanData?.listing_media) {
        const primary = ilanData.listing_media.find((m: any) => m.is_primary)
        setIlanFoto(primary?.media_url || ilanData.listing_media[0]?.media_url || null)
      }

      // Karşı taraf: ilan sahibi değilsek her zaman ilan sahibidir.
      // İlan sahibiysek, hangi başvuranla konuştuğumuzu `with` parametresinden alırız
      // (konuşma listesinden gelen navigasyon bunu her zaman ekler).
      const digerId = ilanData && user.id !== ilanData.user_id ? ilanData.user_id : withParam
      setDigerKullaniciId(digerId || '')

      if (digerId) {
        const { data: digerTaraf } = await supabase
          .from('users')
          .select('full_name, trust_score')
          .eq('id', digerId)
          .single()
        setIlanSahibi(digerTaraf)
      }

      if (!digerId) {
        setMesajlar([])
        setYukleniyor(false)
        return
      }

      const { data: existingMsgs } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, listing_id, content, is_read, created_at')
        .eq('listing_id', listing_id)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${digerId}),and(sender_id.eq.${digerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })
      setMesajlar(existingMsgs ?? [])
      setYukleniyor(false)
    }
    if (listing_id) yukle()
  }, [listing_id])

  // Realtime subscription
  useEffect(() => {
    if (!listing_id || !user || !digerKullaniciId) return
    const channel = supabase
      .channel(`messages-${listing_id}-${digerKullaniciId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `listing_id=eq.${listing_id}` },
        (payload) => {
          const yeni = payload.new as any
          const ikiliyeAit =
            (yeni.sender_id === user.id && yeni.receiver_id === digerKullaniciId) ||
            (yeni.sender_id === digerKullaniciId && yeni.receiver_id === user.id)
          if (!ikiliyeAit) return

          setMesajlar((prev) => prev.find((m) => m.id === yeni.id) ? prev : [...prev, yeni])
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [listing_id, user, digerKullaniciId])

  async function mesajGonder() {
    if (!yeniMesaj.trim() || !user || !ilan || gonderiyor || !digerKullaniciId) return
    setGonderiyor(true)
    const content = yeniMesaj.trim()
    setYeniMesaj('')

    await supabase.from('messages').insert({
      listing_id,
      sender_id: user.id,
      receiver_id: digerKullaniciId,
      content,
    })
    setGonderiyor(false)
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          {ilanFoto ? (
            <Image source={{ uri: ilanFoto }} style={styles.headerAvatar} />
          ) : (
            <LinearGradient
              colors={[Colors.orange700, Colors.orange400]}
              style={styles.headerAvatar}
            >
              <Text style={styles.headerAvatarEmoji}>🐾</Text>
            </LinearGradient>
          )}
          <View style={styles.headerTextCol}>
            <Text style={styles.headerName} numberOfLines={1}>{ilan?.name || '...'}</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {ilanSahibi?.full_name || 'İlan Sahibi'} · {ilan?.city || ''}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.ilanBtn}
          onPress={() => ilan && router.push(`/ilanlar/${ilan.id}` as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.ilanBtnText}>İlan</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {yukleniyor ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primaryContainer} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={mesajlar}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatEmoji}>👋</Text>
                <Text style={styles.emptyChatText}>
                  {ilan?.name} hakkında {ilanSahibi?.full_name || 'ilan sahibine'} mesaj gönder!
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isMine = item.sender_id === user?.id
              return (
                <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
                  {!isMine && (
                    <LinearGradient
                      colors={[Colors.orange700, Colors.orange400]}
                      style={styles.messageBubbleAvatar}
                    >
                      <Text style={styles.messageBubbleAvatarText}>
                        {ilanSahibi?.full_name?.[0]?.toUpperCase() || '?'}
                      </Text>
                    </LinearGradient>
                  )}
                  <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
                    <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextOther]}>
                      {item.content}
                    </Text>
                    <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>
                      {formatTime(item.created_at)}
                    </Text>
                  </View>
                </View>
              )
            }}
          />
        )}

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder={`${ilan?.name || '...'} hakkında mesaj yaz...`}
            placeholderTextColor={Colors.onSurfaceVariant + '66'}
            value={yeniMesaj}
            onChangeText={setYeniMesaj}
            multiline
            maxLength={500}
            onSubmitEditing={mesajGonder}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!yeniMesaj.trim() || gonderiyor) && styles.sendBtnDisabled]}
            onPress={mesajGonder}
            disabled={!yeniMesaj.trim() || gonderiyor}
            activeOpacity={0.8}
          >
            {gonderiyor ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <LinearGradient
                colors={[Colors.orange700, Colors.orange400]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendBtnGrad}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant + '30',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerAvatarEmoji: {
    fontSize: 18,
  },
  headerTextCol: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
  ilanBtn: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  ilanBtnText: {
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyChatEmoji: {
    fontSize: 48,
  },
  emptyChatText: {
    fontSize: 14,
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageBubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  messageBubbleAvatarText: {
    fontSize: 12,
    fontFamily: Fonts.headline,
    color: '#fff',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleMine: {
    backgroundColor: Colors.orange700,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderBottomLeftRadius: 4,
    ...Shadows.card,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextMine: {
    fontFamily: Fonts.bodyMedium,
    color: '#fff',
  },
  bubbleTextOther: {
    fontFamily: Fonts.body,
    color: Colors.onSurface,
  },
  bubbleTime: {
    fontSize: 10,
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurfaceVariant + '88',
    alignSelf: 'flex-end',
  },
  bubbleTimeMine: {
    color: 'rgba(255,255,255,0.6)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant + '25',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.onSurface,
    maxHeight: 120,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnGrad: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
