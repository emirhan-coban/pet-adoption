'use client'

import { useState, useEffect } from 'react'

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent')
        if (!consent) {
            setIsVisible(true)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted')
        setIsVisible(false)
    }

    const handleReject = () => {
        localStorage.setItem('cookie-consent', 'rejected')
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container border-t border-outline-variant/20 shadow-lg p-4 md:p-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-on-surface mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">cookie</span>
                        Çerez Kullanımı
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                        Bu site, size en iyi deneyimi sunmak için çerezleri kullanmaktadır. 
                        Zorunlu çerezler platformun çalışması için gereklidir. 
                        Detaylı bilgi için{' '}
                        <a href="/gizlilik" className="text-primary font-semibold hover:underline">
                            Gizlilik Politikamızı
                        </a>{' '}
                        inceleyebilirsiniz.
                    </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                    <button
                        onClick={handleReject}
                        className="px-6 py-3 bg-surface-container-high text-on-surface-variant font-semibold rounded-full hover:bg-surface-container-highest transition-colors text-sm"
                    >
                        Reddet
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-container transition-colors text-sm shadow-md"
                    >
                        Kabul Et
                    </button>
                </div>
            </div>
        </div>
    )
}
