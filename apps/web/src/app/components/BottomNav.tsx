'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', icon: 'explore', label: 'Keşfet' },
  { href: '/mesajlar', icon: 'chat_bubble', label: 'Mesajlar' },
  { href: '/ilan-olustur', icon: 'add_circle', label: 'İlan Ver' },
  { href: '/profil', icon: 'person', label: 'Profil' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 glass-nav z-50 rounded-t-[2rem] shadow-[0_-16px_40px_rgba(26,28,28,0.06)]">
      {navItems.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-5 py-2 rounded-full active:scale-90 duration-200 no-underline transition-colors ${
              isActive
                ? 'bg-orange-100 text-orange-700'
                : 'text-on-surface-variant/60 hover:text-primary-container'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span className="text-[10px] font-semibold tracking-wide uppercase mt-0.5 font-headline">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
