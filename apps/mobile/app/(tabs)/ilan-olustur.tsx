import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '@/lib/supabase'
import { Colors, Fonts, BorderRadius, Shadows } from '@/constants/theme'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'

const PET_TYPES = ['Kedi', 'Köpek', 'Kuş', 'Tavşan']
const GENDERS = ['Erkek', 'Dişi']
const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Trabzon', 'Diğer']

function petTypeToDb(t: string) {
  switch (t) {
    case 'Köpek': return 'dog'
    case 'Kuş': return 'bird'
    case 'Tavşan': return 'rabbit'
    default: return 'cat'
  }
}

interface OptionPickerProps {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}
function OptionPicker({ label, options, value, onChange }: OptionPickerProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionRow}
      >
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionPill, value === opt && styles.optionPillActive]}
            onPress={() => onChange(opt)}
            activeOpacity={0.75}
          >
            <Text style={[styles.optionPillText, value === opt && styles.optionPillTextActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

interface CheckboxProps {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}
function Checkbox({ label, value, onChange }: CheckboxProps) {
  return (
    <TouchableOpacity style={styles.checkboxRow} onPress={() => onChange(!value)} activeOpacity={0.75}>
      <View style={[styles.checkboxBox, value && styles.checkboxBoxActive]}>
        {value && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

export default function IlanOlustur() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [yukleniyor, setYukleniyor] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const [mesajTuru, setMesajTuru] = useState<'hata' | 'basari'>('hata')
  const [fotograflar, setFotograflar] = useState<string[]>([])

  const [form, setForm] = useState({
    name: '',
    pet_type: 'Kedi',
    breed: '',
    age_months: '',
    gender: 'Erkek',
    city: 'İstanbul',
    district: '',
    description: '',
    vaccinated: false,
    neutered: false,
    dewormed: false,
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user)
      else router.replace('/(auth)/giris')
    })
  }, [])

  function guncelle(alan: string, deger: any) {
    setForm((prev) => ({ ...prev, [alan]: deger }))
  }

  async function fotografSec() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişimine izin vermeniz gerekiyor.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    })
    if (!result.canceled) {
      setFotograflar((prev) => {
        const newUris = result.assets.map((a) => a.uri)
        return [...prev, ...newUris].slice(0, 5)
      })
    }
  }

  async function ilanOlustur() {
    if (!user) return
    if (!form.name.trim()) {
      setMesaj('Lütfen hayvanın adını girin.')
      setMesajTuru('hata')
      return
    }
    if (!form.age_months || isNaN(Number(form.age_months))) {
      setMesaj('Lütfen geçerli bir yaş girin (ay olarak).')
      setMesajTuru('hata')
      return
    }

    setYukleniyor(true)
    setMesaj('')

    const gender_db = form.gender === 'Dişi' ? 'female' : 'male'
    const pet_type_db = petTypeToDb(form.pet_type)

    const { data: yeniIlan, error } = await supabase.from('listings').insert({
      user_id: user.id,
      name: form.name.trim(),
      pet_type: pet_type_db,
      breed: form.breed.trim() || null,
      age_months: parseInt(form.age_months),
      gender: gender_db,
      city: form.city,
      district: form.district.trim() || null,
      description: form.description.trim() || null,
      status: 'active',
      health_status: {
        vaccinated: form.vaccinated,
        neutered: form.neutered,
        dewormed: form.dewormed,
      },
    }).select().single()

    if (error || !yeniIlan) {
      setMesaj('İlan oluşturulurken bir hata oluştu: ' + (error?.message || ''))
      setMesajTuru('hata')
      setYukleniyor(false)
      return
    }

    // Upload photos
    if (fotograflar.length > 0) {
      for (let i = 0; i < fotograflar.length; i++) {
        const uri = fotograflar[i]
        const filename = `${yeniIlan.id}_${i}_${Date.now()}.jpg`
        const path = `listings/${yeniIlan.id}/${filename}`

        const formData = new FormData()
        formData.append('file', {
          uri,
          name: filename,
          type: 'image/jpeg',
        } as any)

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('listing-media')
          .upload(path, formData, { contentType: 'image/jpeg', upsert: false })

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('listing-media').getPublicUrl(path)
          await supabase.from('listing_media').insert({
            listing_id: yeniIlan.id,
            media_url: urlData.publicUrl,
            is_primary: i === 0,
          })
        }
      }
    }

    setMesajTuru('basari')
    setMesaj('İlanınız başarıyla oluşturuldu!')
    setYukleniyor(false)

    setTimeout(() => {
      router.push(`/ilanlar/${yeniIlan.id}` as any)
    }, 1200)
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 12 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>İlan Oluştur</Text>
          <Text style={styles.headerSubtitle}>Can dostuna yeni bir yuva bul</Text>
        </View>

        {/* Photo picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>FOTOĞRAFLAR ({fotograflar.length}/5)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
            <TouchableOpacity style={styles.addPhotoBtn} onPress={fotografSec} activeOpacity={0.8}>
              <Text style={styles.addPhotoBtnIcon}>📷</Text>
              <Text style={styles.addPhotoBtnText}>Fotoğraf Ekle</Text>
            </TouchableOpacity>
            {fotograflar.map((uri, i) => (
              <View key={i} style={styles.photoThumbWrapper}>
                <Image source={{ uri }} style={styles.photoThumb} />
                {i === 0 && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>Kapak</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => setFotograflar((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <Text style={styles.removePhotoBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>HAYVAN ADI *</Text>
          <TextInput
            style={styles.input}
            placeholder="örn: Pamuk, Karamel"
            placeholderTextColor={Colors.onSurfaceVariant + '66'}
            value={form.name}
            onChangeText={(v) => guncelle('name', v)}
          />
        </View>

        {/* Pet type */}
        <OptionPicker label="TÜR" options={PET_TYPES} value={form.pet_type} onChange={(v) => guncelle('pet_type', v)} />

        {/* Gender */}
        <OptionPicker label="CİNSİYET" options={GENDERS} value={form.gender} onChange={(v) => guncelle('gender', v)} />

        {/* Breed */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>CİNS (opsiyonel)</Text>
          <TextInput
            style={styles.input}
            placeholder="örn: Golden Retriever, Tekir"
            placeholderTextColor={Colors.onSurfaceVariant + '66'}
            value={form.breed}
            onChangeText={(v) => guncelle('breed', v)}
          />
        </View>

        {/* Age */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>YAŞ (AY OLARAK) *</Text>
          <TextInput
            style={styles.input}
            placeholder="örn: 6 (6 aylık için)"
            placeholderTextColor={Colors.onSurfaceVariant + '66'}
            value={form.age_months}
            onChangeText={(v) => guncelle('age_months', v)}
            keyboardType="number-pad"
          />
        </View>

        {/* City */}
        <OptionPicker label="ŞEHİR" options={CITIES} value={form.city} onChange={(v) => guncelle('city', v)} />

        {/* District */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>İLÇE (opsiyonel)</Text>
          <TextInput
            style={styles.input}
            placeholder="örn: Kadıköy, Çankaya"
            placeholderTextColor={Colors.onSurfaceVariant + '66'}
            value={form.district}
            onChangeText={(v) => guncelle('district', v)}
          />
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>AÇIKLAMA</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Hayvanınız hakkında kısa bir açıklama yazın..."
            placeholderTextColor={Colors.onSurfaceVariant + '66'}
            value={form.description}
            onChangeText={(v) => guncelle('description', v)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Health */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>SAĞLIK DURUMU</Text>
          <View style={styles.checkboxGroup}>
            <Checkbox label="Aşılı" value={form.vaccinated} onChange={(v) => guncelle('vaccinated', v)} />
            <Checkbox label="Kısırlaştırılmış" value={form.neutered} onChange={(v) => guncelle('neutered', v)} />
            <Checkbox label="Parazit tedavisi yapıldı" value={form.dewormed} onChange={(v) => guncelle('dewormed', v)} />
          </View>
        </View>

        {/* Message */}
        {!!mesaj && (
          <View style={[styles.mesajBox, mesajTuru === 'hata' ? styles.mesajHata : styles.mesajBasari]}>
            <Text style={[styles.mesajText, mesajTuru === 'hata' ? { color: Colors.onErrorContainer } : { color: Colors.green800 }]}>
              {mesajTuru === 'hata' ? '⚠️ ' : '✅ '}{mesaj}
            </Text>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitWrapper}
          onPress={ilanOlustur}
          disabled={yukleniyor}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.orange700, Colors.orange400]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.submitBtn, yukleniyor && { opacity: 0.6 }]}
          >
            {yukleniyor ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>🐾  İlanı Yayınla</Text>
            )}
          </LinearGradient>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 20,
  },
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.bodyBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.2,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.onSurface,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  optionRow: {
    gap: 8,
    paddingRight: 4,
    flexDirection: 'row',
  },
  optionPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  optionPillActive: {
    backgroundColor: Colors.primaryContainer,
  },
  optionPillText: {
    fontSize: 13,
    fontFamily: Fonts.bodyBold,
    color: Colors.onSurfaceVariant,
  },
  optionPillTextActive: {
    color: Colors.onPrimaryContainer,
  },
  photoRow: {
    gap: 10,
    flexDirection: 'row',
    paddingRight: 4,
  },
  addPhotoBtn: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: Colors.outlineVariant + '50',
    borderStyle: 'dashed',
  },
  addPhotoBtnIcon: {
    fontSize: 24,
  },
  addPhotoBtnText: {
    fontSize: 10,
    fontFamily: Fonts.bodyBold,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  photoThumbWrapper: {
    position: 'relative',
  },
  photoThumb: {
    width: 90,
    height: 90,
    borderRadius: 16,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primaryBadgeText: {
    fontSize: 9,
    fontFamily: Fonts.bodyBold,
    color: '#fff',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoBtnText: {
    fontSize: 10,
    color: '#fff',
    fontFamily: Fonts.bodyBold,
  },
  checkboxGroup: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
  },
  checkboxBoxActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer,
  },
  checkmark: {
    fontSize: 12,
    color: '#fff',
    fontFamily: Fonts.bodyBold,
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurface,
  },
  mesajBox: {
    padding: 14,
    borderRadius: BorderRadius.md,
  },
  mesajHata: {
    backgroundColor: Colors.errorContainer,
  },
  mesajBasari: {
    backgroundColor: Colors.green100,
  },
  mesajText: {
    fontSize: 13,
    fontFamily: Fonts.bodyMedium,
    lineHeight: 20,
  },
  submitWrapper: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.button,
    marginTop: 4,
  },
  submitBtn: {
    paddingVertical: 17,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: Fonts.headline,
    color: '#fff',
  },
})
