'use client'

import Link from 'next/link'

interface HeaderProps {
  user: { email?: string } | null
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 glass-nav border-b border-outline-variant/20">
      <div className="flex items-center justify-between px-6 lg:px-10 py-4 w-full max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline group">
          <span className="material-symbols-outlined text-primary-container text-[28px] group-hover:scale-110 transition-transform">
            pets
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-tl from-orange-700 to-orange-400 bg-clip-text text-transparent font-headline">
            PawBuddy
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-primary-container font-bold font-headline transition-opacity hover:opacity-80 active:scale-95 duration-200 no-underline"
          >
            Keşfet
          </Link>
          <Link
            href="/mesajlar"
            className="text-on-surface-variant transition-opacity hover:opacity-80 active:scale-95 duration-200 no-underline"
          >
            Mesajlar
          </Link>
          <Link
            href="/ilan-olustur"
            className="text-on-surface-variant transition-opacity hover:opacity-80 active:scale-95 duration-200 no-underline"
          >
            İlan Ver
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profil"
                className="flex items-center gap-1.5 text-on-surface-variant font-bold font-headline transition-opacity hover:opacity-80 active:scale-95 duration-200 no-underline"
              >
                <span className="material-symbols-outlined text-lg">person</span>
                Profil
              </Link>
              <div className="w-px h-5 bg-outline-variant/30" />
              <Link
                href="/cikis"
                className="flex items-center gap-1.5 text-error/70 hover:text-error font-bold text-sm transition-colors no-underline hover:bg-error-container/30 px-3 py-1.5 rounded-full"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Çıkış
              </Link>
            </div>
          ) : (
            <Link
              href="/giris"
              className="btn-gradient px-6 py-2.5 rounded-full text-sm no-underline"
            >
              Giriş Yap
            </Link>
          )}
        </nav>

        {/* Mobile: Auth button only, rest goes to bottom nav */}
        <div className="md:hidden flex items-center gap-3">
          {user ? (
            <Link
              href="/profil"
              className="w-9 h-9 rounded-full bg-gradient-to-tl from-orange-700 to-orange-400 flex items-center justify-center text-white text-sm font-bold no-underline"
            >
              {user.email?.[0]?.toUpperCase() || 'U'}
            </Link>
          ) : (
            <Link
              href="/giris"
              className="btn-gradient px-5 py-2 rounded-full text-sm no-underline"
            >
              Giriş
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
