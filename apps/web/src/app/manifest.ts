import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TechStore',
    short_name: 'TechStore',
    description: 'New and certified pre-owned smartphones, laptops and electronics.',
    start_url: '/',
    display: 'standalone',
    background_color: '#06070b',
    theme_color: '#06070b',
    icons: [{ src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' }],
  };
}
