import type { MetadataRoute } from 'next';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/checkout', '/profile'] },
    sitemap: `${WEB_URL}/sitemap.xml`,
  };
}
