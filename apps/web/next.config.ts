import type { NextConfig } from 'next';
import path from 'path';

// Build the list of allowed image origins dynamically so production images load.
// In dev this is localhost:4000; in production it's whatever NEXT_PUBLIC_API_URL points to.
function buildRemotePatterns() {
  const patterns: NonNullable<NonNullable<NextConfig['images']>['remotePatterns']> = [
    // Local dev — API uploads
    { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
    // Local dev — MinIO object storage
    { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/**' },
    // Demo product images (picsum placeholder URLs used by seed-demo.ts)
    { protocol: 'https', hostname: 'picsum.photos' },
  ];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const u = new URL(apiUrl);
      if (u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') {
        patterns.push({
          protocol: u.protocol.replace(':', '') as 'http' | 'https',
          hostname: u.hostname,
          port: u.port || '',
          pathname: '/uploads/**',
        });
        // Also allow images served from the same domain root (through nginx)
        patterns.push({
          protocol: u.protocol.replace(':', '') as 'http' | 'https',
          hostname: u.hostname,
          port: u.port || '',
          pathname: '/**',
        });
      }
    } catch {
      // Malformed URL — skip
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  // Allow HMR from any local network IP (phone, tablet, other machines on LAN)
  allowedDevOrigins: ['192.168.100.49', '192.168.*.*', '10.*.*.*', '172.*.*.*'],
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: buildRemotePatterns(),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
