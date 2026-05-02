'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function Giris() {
    const [sekme, setSekme] = useState<'giris' | 'kayit'>('giris')
    const [email, setEmail] = useState('')
    const [sifre, setSifre] = useState('')
    const [isim, setIsim] = useState('')
    const [sifreGoster, setSifreGoster] = useState(false)
    const [yukleniyor, setYukleniyor] = useState(false)
    const [mesaj, setMesaj] = useState('')
    const [mesajTuru, setMesajTuru] = useState<'hata' | 'basari'>('hata')
    const [dogrulamaBekleniyor, setDogrulamaBekleniyor] = useState(false)

    const supabase = createClient()

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
            if (error.message === 'Invalid login credentials') {
                setMesaj('E-posta veya şifre hatalı. Lütfen tekrar deneyin.')
            } else if (error.message === 'Email not confirmed') {
                setMesaj('E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin.')
            } else {
                setMesaj('Hata: ' + error.message)
            }
            setMesajTuru('hata')
        } else {
            window.location.href = '/'
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
            options: {
                emailRedirectTo: `${window.location.origin}/`,
                data: { full_name: isim },
            },
        })
        if (error) {
            if (error.message.includes('already registered')) {
                setMesaj('Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.')
            } else {
                setMesaj('Hata: ' + error.message)
            }
            setMesajTuru('hata')
        } else {
            setDogrulamaBekleniyor(true)
        }
        setYukleniyor(false)
    }

    function sekmeVeDegistir(yeniSekme: 'giris' | 'kayit') {
        setSekme(yeniSekme)
        setMesaj('')
    }

    return (
        <div className="min-h-screen bg-surface text-on-surface font-body flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">

            {/* ═══════════════════════════════════════════ */}
            {/* FULL PAGE LAYOUT                            */}
            {/* ═══════════════════════════════════════════ */}
            <div className="flex flex-1 min-h-screen">

                {/* ─── LEFT: Decorative Panel (desktop only) ─── */}
                <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400" />

                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 no-underline group">
                            <span className="material-symbols-outlined text-white text-[32px] group-hover:scale-110 transition-transform">
                                pets
                            </span>
                            <span className="text-3xl font-extrabold tracking-tight text-white font-headline">
                                PawBuddy
                            </span>
                        </Link>

                        {/* Hero Text */}
                        <div className="space-y-6 max-w-lg">
                            <h2 className="text-4xl xl:text-5xl font-extrabold text-white font-headline leading-tight">
                                Yeni can dostunu
                                <br />
                                bulmaya hazır mısın?
                            </h2>
                            <p className="text-white/80 text-lg leading-relaxed">
                                Türkiye'nin en güvenilir hayvan sahiplendirme platformuna katıl.
                                Binlerce sevimli dost seni bekliyor.
                            </p>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap gap-4 pt-4">
                                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2.5 rounded-full">
                                    <span className="material-symbols-outlined text-white text-lg icon-fill">verified_user</span>
                                    <span className="text-white text-sm font-semibold">Güvenli Platform</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2.5 rounded-full">
                                    <span className="material-symbols-outlined text-white text-lg icon-fill">pets</span>
                                    <span className="text-white text-sm font-semibold">5000+ İlan</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2.5 rounded-full">
                                    <span className="material-symbols-outlined text-white text-lg icon-fill">favorite</span>
                                    <span className="text-white text-sm font-semibold">2000+ Sahiplendirme</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Quote */}
                        <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-5 rounded-2xl max-w-md">
                            <span className="material-symbols-outlined text-white/60 text-3xl flex-shrink-0">format_quote</span>
                            <div>
                                <p className="text-white/90 text-sm leading-relaxed italic">
                                    &quot;PawBuddy sayesinde hayallerindeki can dostunu buldum. Güvenilir platform ve harika topluluk!&quot;
                                </p>
                                <p className="text-white/50 text-xs font-bold mt-2 uppercase tracking-wider">
                                    — Ayşe K., İstanbul
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── RIGHT: Auth Form ─── */}
                <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
                    <div className="w-full max-w-md">

                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-10">
                            <Link href="/" className="inline-flex items-center gap-2.5 no-underline group">
                                <span className="material-symbols-outlined text-primary-container text-[32px] group-hover:scale-110 transition-transform">
                                    pets
                                </span>
                                <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-tl from-orange-700 to-orange-400 bg-clip-text text-transparent font-headline">
                                    PawBuddy
                                </span>
                            </Link>
                        </div>

                        {/* Heading */}
                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface font-headline mb-2">
                                {sekme === 'giris' ? 'Hoş Geldin! 👋' : 'Hesap Oluştur'}
                            </h1>
                            <p className="text-on-surface-variant text-sm md:text-base">
                                {sekme === 'giris'
                                    ? 'Hesabına giriş yap ve can dostlarını keşfetmeye başla.'
                                    : 'Yeni bir hesap oluştur ve sahiplendirme yolculuğuna başla.'}
                            </p>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex bg-surface-container-high rounded-full p-1 mb-8">
                            <button
                                onClick={() => sekmeVeDegistir('giris')}
                                className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                                    sekme === 'giris'
                                        ? 'bg-white text-on-surface shadow-md editorial-shadow'
                                        : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                            >
                                Giriş Yap
                            </button>
                            <button
                                onClick={() => sekmeVeDegistir('kayit')}
                                className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                                    sekme === 'kayit'
                                        ? 'bg-white text-on-surface shadow-md editorial-shadow'
                                        : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                            >
                                Kayıt Ol
                            </button>
                        </div>

                        {/* Email Doğrulama Bekleniyor Ekranı */}
                        {dogrulamaBekleniyor ? (
                            <div className="text-center py-8 space-y-6">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <span className="material-symbols-outlined text-green-600 text-4xl">mark_email_unread</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-extrabold text-on-surface font-headline mb-2">E-postanı Kontrol Et!</h2>
                                    <p className="text-on-surface-variant text-sm leading-relaxed">
                                        <span className="font-bold text-on-surface">{email}</span> adresine bir doğrulama bağlantısı gönderdik.
                                        Lütfen e-postanı kontrol et ve bağlantıya tıkla.
                                    </p>
                                </div>
                                <div className="bg-surface-container-high rounded-2xl p-4 text-left space-y-2">
                                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">E-posta gelmediyse:</p>
                                    <ul className="text-sm text-on-surface-variant space-y-1">
                                        <li>• Spam / Gereksiz klasörünü kontrol et</li>
                                        <li>• Birkaç dakika bekle</li>
                                        <li>• E-posta adresinin doğru olduğundan emin ol</li>
                                    </ul>
                                </div>
                                <button
                                    onClick={() => { setDogrulamaBekleniyor(false); setSekme('giris'); setMesaj(''); }}
                                    className="text-sm font-semibold text-primary hover:text-primary-container transition-colors"
                                >
                                    Giriş sayfasına dön
                                </button>
                            </div>
                        ) : (
                        <>
                        {/* Form */}
                        <div className="space-y-4">

                            {/* Name Field - Only for Registration */}
                            {sekme === 'kayit' && (
                                <div className="space-y-2 animate-fade-in-up">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                                        Ad Soyad
                                    </label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">
                                            person
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Adınız ve soyadınız"
                                            value={isim}
                                            onChange={(e) => setIsim(e.target.value)}
                                            className="w-full bg-surface-container-high border-none rounded-xl pl-12 pr-4 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/50 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                                    E-posta
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">
                                        mail
                                    </span>
                                    <input
                                        type="email"
                                        placeholder="ornek@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-surface-container-high border-none rounded-xl pl-12 pr-4 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                                    Şifre
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">
                                        lock
                                    </span>
                                    <input
                                        type={sifreGoster ? 'text' : 'password'}
                                        placeholder={sekme === 'kayit' ? 'En az 6 karakter' : '••••••••'}
                                        value={sifre}
                                        onChange={(e) => setSifre(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (sekme === 'giris' ? girisYap() : kayitOl())}
                                        className="w-full bg-surface-container-high border-none rounded-xl pl-12 pr-12 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setSifreGoster(!sifreGoster)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {sifreGoster ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password - only for login */}
                            {sekme === 'giris' && (
                                <div className="text-right">
                                    <button className="text-xs font-semibold text-primary hover:text-primary-container transition-colors">
                                        Şifremi Unuttum
                                    </button>
                                </div>
                            )}

                            {/* Error / Success Message */}
                            {mesaj && (
                                <div className={`flex items-start gap-3 p-4 rounded-xl text-sm animate-fade-in-up ${
                                    mesajTuru === 'hata'
                                        ? 'bg-error-container/50 text-on-error-container'
                                        : 'bg-green-50 text-green-800'
                                }`}>
                                    <span className={`material-symbols-outlined text-lg flex-shrink-0 mt-0.5 ${
                                        mesajTuru === 'hata' ? 'text-error' : 'text-green-600'
                                    }`}>
                                        {mesajTuru === 'hata' ? 'error' : 'check_circle'}
                                    </span>
                                    <p className="leading-relaxed">{mesaj}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                onClick={sekme === 'giris' ? girisYap : kayitOl}
                                disabled={yukleniyor}
                                className="w-full bg-gradient-to-tl from-orange-700 to-orange-400 text-white font-bold py-4 rounded-full shadow-[0_16px_32px_rgba(144,77,0,0.2)] active:scale-95 transition-all text-base tracking-wide disabled:opacity-60 disabled:active:scale-100 font-headline mt-2"
                            >
                                {yukleniyor ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Lütfen bekleyin...
                                    </span>
                                ) : (
                                    sekme === 'giris' ? 'Giriş Yap' : 'Hesap Oluştur'
                                )}
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-4 py-2">
                                <div className="flex-1 h-px bg-outline-variant/20" />
                                <span className="text-[11px] font-bold text-on-surface-variant/40 uppercase tracking-widest">veya</span>
                                <div className="flex-1 h-px bg-outline-variant/20" />
                            </div>

                            {/* Social Login Buttons */}
                            <button className="w-full flex items-center justify-center gap-3 bg-surface-container-lowest border border-outline-variant/15 py-3.5 rounded-full font-semibold text-on-surface hover:bg-surface-container-low transition-colors text-sm editorial-shadow">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Google ile devam et
                            </button>
                        </div>

                        {/* Switch Tab Text */}
                        <p className="text-center text-on-surface-variant text-sm mt-8">
                            {sekme === 'giris' ? (
                                <>
                                    Hesabın yok mu?{' '}
                                    <button
                                        onClick={() => sekmeVeDegistir('kayit')}
                                        className="text-primary font-bold hover:text-primary-container transition-colors"
                                    >
                                        Ücretsiz Kayıt Ol
                                    </button>
                                </>
                            ) : (
                                <>
                                    Zaten hesabın var mı?{' '}
                                    <button
                                        onClick={() => sekmeVeDegistir('giris')}
                                        className="text-primary font-bold hover:text-primary-container transition-colors"
                                    >
                                        Giriş Yap
                                    </button>
                                </>
                            )}
                        </p>

                        {/* Back to Home */}
                        <div className="text-center mt-6">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant/50 hover:text-on-surface-variant transition-colors no-underline uppercase tracking-wider"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Ana Sayfaya Dön
                            </Link>
                        </div>
                        </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}