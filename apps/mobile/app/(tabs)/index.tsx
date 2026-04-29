import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, ActivityIndicator, RefreshControl,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { Colors, Fonts, BorderRadius } from '@/constants/theme'
import PetCard from '@/components/PetCard'
import { Ionicons } from '@expo/vector-icons'

const PET_TYPES = [
  { label: 'Tümü', value: '' },
  { label: 'Köpek', value: 'dog' },
  { label: 'Kedi', value: 'cat' },
  { label: 'Kuş', value: 'bird' },
  { label: 'Tavşan', value: 'rabbit' },
]

const GENDERS = [
  { label: 'Tümü', value: '' },
  { label: 'Erkek', value: 'male' },
  { label: 'Dişi', value: 'female' },
]

export default function Kesfet() {
  const insets = useSafeAreaInsets()
  const [ilanlar, setIlanlar] = useState<any[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [yenileniyor, setYenileniyor] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const [selectedGender, setSelectedGender] = useState('')
  const [citySearch, setCitySearch] = useState('')

  const fetchIlanlar = useCallback(async () => {
    let query = supabase
      .from('listings')
      .select('*, listing_media(media_url, is_primary)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (selectedType) query = query.eq('pet_type', selectedType)
    if (selectedGender) query = query.eq('gender', selectedGender)
    if (citySearch.trim()) query = query.ilike('city', `%${citySearch.trim()}%`)

    const { data, error } = await query
    if (!error && data) setIlanlar(data)
    setYukleniyor(false)
    setYenileniyor(false)
  }, [selectedType, selectedGender, citySearch])

  useEffect(() => {
    setYukleniyor(true)
    fetchIlanlar()
  }, [fetchIlanlar])

  const onRefresh = () => {
    setYenileniyor(true)
    fetchIlanlar()
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconEmoji}>🐾</Text>
          </View>
          <Text style={styles.headerTitle}>PawBuddy</Text>
        </View>
      </View>

      {/* Hero + Filters - sticky */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>
          Yeni <Text style={styles.heroAccent}>can dostunu</Text> bul
        </Text>
        <Text style={styles.heroSubtitle}>Seni bekleyen şefkatli sahiplendirme hikâyeleri.</Text>

        {/* City search */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={16} color={Colors.onSurfaceVariant + '88'} />
          <TextInput
            style={styles.searchInput}
            placeholder="Şehir ara..."
            placeholderTextColor={Colors.onSurfaceVariant + '66'}
            value={citySearch}
            onChangeText={setCitySearch}
            returnKeyType="search"
          />
          {!!citySearch && (
            <TouchableOpacity onPress={() => setCitySearch('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={16} color={Colors.onSurfaceVariant + '88'} />
            </TouchableOpacity>
          )}
        </View>

        {/* Pet type filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {PET_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.pill, selectedType === t.value && styles.pillActive]}
              onPress={() => setSelectedType(t.value)}
              activeOpacity={0.75}
            >
              <Text style={[styles.pillText, selectedType === t.value && styles.pillTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.pillDivider} />
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g.value + '_gender'}
              style={[styles.pill, selectedGender === g.value && styles.pillActive]}
              onPress={() => setSelectedGender(g.value)}
              activeOpacity={0.75}
            >
              <Text style={[styles.pillText, selectedGender === g.value && styles.pillTextActive]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results count */}
      {!yukleniyor && (
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            <Text style={styles.resultsBold}>{ilanlar.length}</Text> ilan bulundu
          </Text>
        </View>
      )}

      {/* List */}
      {yukleniyor ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryContainer} />
          <Text style={styles.loadingText}>İlanlar yükleniyor...</Text>
        </View>
      ) : ilanlar.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
          <Text style={styles.emptyText}>
            Farklı filtreler deneyerek aradığın can dostunu bulabilirsin.
          </Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setSelectedType('')
              setSelectedGender('')
              setCitySearch('')
            }}
          >
            <Text style={styles.resetBtnText}>Filtreleri Sıfırla</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={ilanlar}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const foto = item.listing_media?.find((m: any) => m.is_primary)?.media_url
              || item.listing_media?.[0]?.media_url
            return (
              <PetCard
                id={item.id}
                name={item.name}
                petType={item.pet_type}
                gender={item.gender}
                city={item.city}
                district={item.district}
                ageMonths={item.age_months}
                description={item.description}
                photoUrl={foto}
              />
            )
          }}
          contentContainerStyle={[styles.listContent, { paddingBottom: 12 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={yenileniyor}
              onRefresh={onRefresh}
              tintColor={Colors.primaryContainer}
            />
          }
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
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant + '33',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.orange700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconEmoji: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Fonts.headline,
    letterSpacing: -0.5,
    color: Colors.onSurface,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroAccent: {
    color: Colors.primaryContainer,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.onSurfaceVariant,
    marginBottom: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.onSurface,
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  filterScroll: {
    marginHorizontal: -20,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  pillActive: {
    backgroundColor: Colors.primaryContainer,
    shadowColor: Colors.orange500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  pillText: {
    fontSize: 13,
    fontFamily: Fonts.bodyBold,
    color: Colors.onSurfaceVariant,
  },
  pillTextActive: {
    color: '#ffffff',
  },
  pillDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.outlineVariant,
    marginHorizontal: 4,
  },
  resultsRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resultsText: {
    fontSize: 13,
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
  resultsBold: {
    fontFamily: Fonts.bodyBold,
    color: Colors.onSurface,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  resetBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.full,
  },
  resetBtnText: {
    fontSize: 14,
    fontFamily: Fonts.bodyBold,
    color: Colors.onSurfaceVariant,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
})
