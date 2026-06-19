/**
 * Generates clean, on-brand SVG placeholder images for every product and wires
 * them up as ProductImage rows. Two images per product so the storefront's
 * hover image-swap has something to swap to. Idempotent: re-running replaces the
 * generated set. Real photos uploaded via the admin/MinIO pipeline take over
 * naturally (they're appended; delete these rows to fully switch).
 *
 *   pnpm --filter @techstore/db exec ts-node prisma/seed-images.ts
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Where the API serves static files from (ServeStaticModule → serveRoot '/uploads').
const UPLOAD_DIR = path.resolve(__dirname, '../../../apps/api/uploads/products');

// Tasteful gradient pairs (front / back) cycled across products for variety.
const PALETTES = [
  ['#6e8bff', '#34e3e8'],
  ['#a06bff', '#6e8bff'],
  ['#34e3e8', '#3fd6a0'],
  ['#ff8f6b', '#ff6b6b'],
  ['#f5c451', '#e0a24a'],
  ['#5b6eff', '#0aa2b0'],
];

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function tile(title: string, brand: string, c1: string, c2: string, angle: number, variant: 1 | 2) {
  const short = title.length > 26 ? title.slice(0, 25) + '…' : title;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} .5 .5)">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="r" cx="0.5" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.25"/>
    </radialGradient>
  </defs>
  <rect width="800" height="800" fill="#0d0f17"/>
  <rect width="800" height="800" fill="url(#g)" opacity="0.22"/>
  <rect width="800" height="800" fill="url(#r)"/>
  <rect x="250" y="${variant === 1 ? 170 : 200}" width="300" height="430" rx="44"
        fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>
  <rect x="350" y="${variant === 1 ? 192 : 222}" width="100" height="10" rx="5" fill="#ffffff" fill-opacity="0.5"/>
  <text x="400" y="690" text-anchor="middle" font-family="Inter, system-ui, sans-serif"
        font-size="26" font-weight="600" fill="#ffffff" fill-opacity="0.92">${esc(short)}</text>
  <text x="400" y="730" text-anchor="middle" font-family="Inter, system-ui, sans-serif"
        font-size="18" letter-spacing="3" fill="#ffffff" fill-opacity="0.6">${esc(brand.toUpperCase())}</text>
</svg>`;
}

async function main() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const products = await prisma.product.findMany({
    include: { brand: true, images: true },
    orderBy: { createdAt: 'asc' },
  });

  let created = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    // Skip products that already have real (non-generated) images.
    const hasReal = p.images.some((img) => !img.url.includes('/uploads/products/'));
    if (hasReal) continue;

    const [c1, c2] = PALETTES[i % PALETTES.length];
    const brand = p.brand?.name ?? 'TechStore';

    const files: { name: string; svg: string }[] = [
      { name: `${p.slug}-1.svg`, svg: tile(p.titleEn, brand, c1, c2, 0, 1) },
      { name: `${p.slug}-2.svg`, svg: tile(p.titleEn, brand, c2, c1, 180, 2) },
    ];
    for (const f of files) fs.writeFileSync(path.join(UPLOAD_DIR, f.name), f.svg, 'utf8');

    // Replace any previously generated rows, then insert the fresh pair.
    await prisma.productImage.deleteMany({ where: { productId: p.id, url: { contains: '/uploads/products/' } } });
    await prisma.productImage.createMany({
      data: files.map((f, pos) => ({
        productId: p.id,
        url: `/uploads/products/${f.name}`,
        alt: `${p.titleEn} — ${pos === 0 ? 'front' : 'back'}`,
        position: pos,
      })),
    });
    created += files.length;
  }

  console.log(`✓ Generated images for ${products.length} products (${created} files) in ${UPLOAD_DIR}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
