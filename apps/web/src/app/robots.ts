import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sahiplendir.tr'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/mesajlar', '/profil', '/hesap-sil', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
