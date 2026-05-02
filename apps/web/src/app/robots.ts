import { type MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/profil', '/mesajlar', '/cikis'],
      },
    ],
    sitemap: 'https://sahiplendir.tr/sitemap.xml',
  }
}
