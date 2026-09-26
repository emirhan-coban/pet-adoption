import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '@/lib/supabase'
import { Colors, Fonts, BorderRadius } from '@/constants/theme'

export default function Giris() {
  const [sekme, setSekme] = useState<'giris' | 'kayit'>('giris')
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [isim, setIsim] = useState('')
  const [sifreGoster, setSifreGoster] = useState(false)
  const [yukleniyor, setYukleniyor] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const [mesajTuru, setMesajTuru] = useState<'hata' | 'basari'>('hata')

  async function girisYap() {
    if (!email || !sifre) {
      setMesaj('Lütfen e-posta ve şifre alanlarını doldurun.')
      setMesajTuru('hata')
      return
    }
    setYukleniyor(true)
    setMesaj('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: sifre })
    if (error) {
      setMesaj(
        error.message === 'Invalid login credentials'
          ? 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.'
          : 'Hata: ' + error.message
      )
      setMesajTuru('hata')
    }
    setYukleniyor(false)
  }

  async function kayitOl() {
    if (!email || !sifre) {
      setMesaj('Lütfen e-posta ve şifre alanlarını doldurun.')
      setMesajTuru('hata')
      return
    }
    if (sifre.length < 6) {
      setMesaj('Şifre en az 6 karakter olmalıdır.')
      setMesajTuru('hata')
      return
    }
    setYukleniyor(true)
    setMesaj('')
    const { error } = await supabase.auth.signUp({
      email,
      password: sifre,
      options: { data: { full_name: isim } },
    })
    if (error) {
      setMesaj('Hata: ' + error.message)
      setMesajTuru('hata')
    } else {
    }
    setYukleniyor(false)
  }

  function sekmeVeDegistir(yeniSekme: 'giris' | 'kayit') {
    setSekme(yeniSekme)
    setMesaj('')
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[Colors.orange700, Colors.orange400]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoIcon}
            >
              <Text style={styles.logoEmoji}>🐾</Text>
            </LinearGradient>
            <Text style={styles.logoText}>Sahiplendir</Text>
          </View>

          {/* Heading */}
          <View style={styles.headingContainer}>
            <Text style={styles.heading}>
              {sekme === 'giris' ? 'Hoş Geldin! 👋' : 'Hesap Oluştur'}
            </Text>
            <Text style={styles.subheading}>
              {sekme === 'giris'
                ? 'Hesabına giriş yap ve can dostlarını keşfetmeye başla.'
                : 'Yeni bir hesap oluştur ve sahiplendirme yolculuğuna başla.'}
            </Text>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, sekme === 'giris' && styles.tabBtnActive]}
              onPress={() => sekmeVeDegistir('giris')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, sekme === 'giris' && styles.tabTextActive]}>
                Giriş Yap
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, sekme === 'kayit' && styles.tabBtnActive]}
              onPress={() => sekmeVeDegistir('kayit')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, sekme === 'kayit' && styles.tabTextActive]}>
                Kayıt Ol
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name - only for register */}
            {sekme === 'kayit' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>AD SOYAD</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Adınız ve soyadınız"
                    placeholderTextColor={Colors.onSurfaceVariant + '66'}
                    value={isim}
                    onChangeText={setIsim}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-POSTA</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ornek@email.com"
                  placeholderTextColor={Colors.onSurfaceVariant + '66'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>ŞİFRE</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={sekme === 'kayit' ? 'En az 6 karakter' : '••••••••'}
                  placeholderTextColor={Colors.onSurfaceVariant + '66'}
                  value={sifre}
                  onChangeText={setSifre}
                  secureTextEntry={!sifreGoster}
                  autoCapitalize="none"
                  onSubmitEditing={sekme === 'giris' ? girisYap : kayitOl}
                />
                <TouchableOpacity
                  onPress={() => setSifreGoster(!sifreGoster)}
                  style={styles.eyeBtn}
                >
                  <Text style={styles.eyeIcon}>{sifreGoster ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error/Success message */}
            {!!mesaj && (
              <View style={[
                styles.mesajBox,
                mesajTuru === 'hata' ? styles.mesajHata : styles.mesajBasari,
              ]}>
                <Text style={[
                  styles.mesajText,
                  mesajTuru === 'hata' ? styles.mesajTextHata : styles.mesajTextBasari,
                ]}>
                  {mesajTuru === 'hata' ? '⚠️ ' : '✅ '}{mesaj}
                </Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={sekme === 'giris' ? girisYap : kayitOl}
              disabled={yukleniyor}
              activeOpacity={0.85}
              style={styles.submitBtnWrapper}
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
                  <Text style={styles.submitBtnText}>
                    {sekme === 'giris' ? 'Giriş Yap' : 'Hesap Oluştur'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Switch tab text */}
          <View style={styles.switchContainer}>
            {sekme === 'giris' ? (
              <Text style={styles.switchText}>
                Hesabın yok mu?{' '}
                <Text
                  style={styles.switchLink}
                  onPress={() => sekmeVeDegistir('kayit')}
                >
                  Ücretsiz Kayıt Ol
                </Text>
              </Text>
            ) : (
              <Text style={styles.switchText}>
                Zaten hesabın var mı?{' '}
                <Text
                  style={styles.switchLink}
                  onPress={() => sekmeVeDegistir('giris')}
                >
                  Giriş Yap
                </Text>
              </Text>
            )}
          </View>

          {/* Trust badges */}
          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>🛡️</Text>
              <Text style={styles.badgeText}>Güvenli Platform</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>🐾</Text>
              <Text style={styles.badgeText}>5000+ İlan</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>❤️</Text>
              <Text style={styles.badgeText}>2000+ Sahiplendirme</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 22,
  },
  logoText: {
    fontSize: 28,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  headingContainer: {
    marginBottom: 28,
  },
  heading: {
    fontSize: 30,
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 15,
    fontFamily: Fonts.body,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.full,
    padding: 4,
    marginBottom: 28,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: Colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontFamily: Fonts.bodyBold,
    color: Colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: Colors.onSurface,
  },
  form: {
    gap: 16,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  inputIcon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.onSurface,
    padding: 0,
  },
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
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
  mesajTextHata: {
    color: Colors.onErrorContainer,
  },
  mesajTextBasari: {
    color: Colors.green800,
  },
  submitBtnWrapper: {
    marginTop: 4,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    shadowColor: Colors.orange700,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitBtn: {
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: Fonts.headline,
    color: '#fff',
    letterSpacing: -0.3,
  },
  switchContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  switchLink: {
    fontFamily: Fonts.bodyBold,
    color: Colors.primary,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 32,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  badgeEmoji: {
    fontSize: 14,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },
})
