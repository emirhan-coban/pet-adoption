import { createServerSupabase } from '@/lib/supabase-server'
import { type MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerSupabase()

  const { data: ilanlar } = await supabase
    .from('listings')
    .select('id, updated_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1000)

  const ilanUrls: MetadataRoute.Sitemap = (ilanlar ?? []).map((ilan) => ({
    url: `https://sahiplendir.tr/ilanlar/${ilan.id}`,
    lastModified: new Date(ilan.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: 'https://sahiplendir.tr',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://sahiplendir.tr/giris',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...ilanUrls,
  ]
}
