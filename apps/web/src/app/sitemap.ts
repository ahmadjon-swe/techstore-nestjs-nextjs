import type { MetadataRoute } from 'next';
import { catalog } from '@/lib/api';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands] = await Promise.all([
    catalog.list({ limit: 1000 }).then((r) => r.items).catch(() => []),
    catalog.categories().catch(() => []),
    catalog.brands().catch(() => []),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: WEB_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${WEB_URL}/catalog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${WEB_URL}/products/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${WEB_URL}/catalog?category=${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${WEB_URL}/catalog?brand=${b.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...brandRoutes];
}
