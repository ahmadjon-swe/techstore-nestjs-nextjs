/**
 * Demo seed — a rich catalog + demo accounts for showing the store to clients.
 *
 *   pnpm db:seed:demo            (from repo root)
 *   make demo                    (migrate + demo seed + dev)
 *
 * Idempotent (everything upserts). Refuses to run in production.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { PrismaClient, Condition, UsedGrade, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// One-click demo logins surfaced by the dev login panel (NEXT_PUBLIC_DEV_MODE=true).
export const DEMO_ACCOUNTS = [
  { email: 'owner@demo.uz', password: 'Demo1234!', name: 'Demo Owner', role: Role.OWNER },
  { email: 'manager@demo.uz', password: 'Demo1234!', name: 'Demo Manager', role: Role.MANAGER },
  { email: 'staff@demo.uz', password: 'Demo1234!', name: 'Demo Staff', role: Role.STAFF },
  { email: 'customer@demo.uz', password: 'Demo1234!', name: 'Demo Customer', role: Role.CUSTOMER },
];

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.log('Refusing to run demo seed in production.');
    return;
  }

  // ---- Categories ----
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: { slug: 'electronics', nameUz: 'Elektronika', nameRu: 'Электроника', nameEn: 'Electronics' },
  });
  const cat = async (slug: string, uz: string, ru: string, en: string) =>
    prisma.category.upsert({
      where: { slug },
      update: {},
      create: { slug, nameUz: uz, nameRu: ru, nameEn: en, parentId: electronics.id },
    });
  const smartphones = await cat('smartphones', 'Smartfonlar', 'Смартфоны', 'Smartphones');
  const laptops = await cat('laptops', 'Noutbuklar', 'Ноутбуки', 'Laptops');
  const tablets = await cat('tablets', 'Planshetlar', 'Планшеты', 'Tablets');
  const audio = await cat('audio', 'Audio', 'Аудио', 'Audio');
  const wearables = await cat('wearables', 'Aqlli soatlar', 'Носимые', 'Wearables');

  // ---- Brands ----
  const brand = async (slug: string, name: string) =>
    prisma.brand.upsert({ where: { slug }, update: {}, create: { slug, name } });
  const apple = await brand('apple', 'Apple');
  const samsung = await brand('samsung', 'Samsung');
  const google = await brand('google', 'Google');
  const sony = await brand('sony', 'Sony');
  const xiaomi = await brand('xiaomi', 'Xiaomi');

  // ---- Products ----
  type V = { sku: string; storage?: string; color?: string; priceUzs: bigint; compareAtUzs?: bigint; stock: number };
  type P = {
    slug: string; title: string; desc: string; categoryId: string; brandId: string;
    condition: Condition; grade?: UsedGrade; conditionNotes?: string; batteryHealth?: number;
    variants: V[];
  };

  const products: P[] = [
    {
      slug: 'apple-iphone-15-pro-max', title: 'Apple iPhone 15 Pro Max',
      desc: 'Titanium flagship with the A17 Pro chip and a 5x telephoto camera.',
      categoryId: smartphones.id, brandId: apple.id, condition: Condition.NEW,
      variants: [
        { sku: 'IP15PM-256-NT', storage: '256GB', color: 'Natural Titanium', priceUzs: 18_900_000n, stock: 12 },
        { sku: 'IP15PM-512-BT', storage: '512GB', color: 'Blue Titanium', priceUzs: 21_500_000n, compareAtUzs: 22_900_000n, stock: 6 },
      ],
    },
    {
      slug: 'apple-iphone-15', title: 'Apple iPhone 15',
      desc: 'Dynamic Island, USB-C and a 48MP main camera.',
      categoryId: smartphones.id, brandId: apple.id, condition: Condition.NEW,
      variants: [
        { sku: 'IP15-128-PK', storage: '128GB', color: 'Pink', priceUzs: 12_400_000n, stock: 20 },
        { sku: 'IP15-256-BK', storage: '256GB', color: 'Black', priceUzs: 14_200_000n, stock: 9 },
      ],
    },
    {
      slug: 'samsung-galaxy-s24-ultra-demo', title: 'Samsung Galaxy S24 Ultra',
      desc: 'Galaxy AI, titanium frame and a built-in S Pen.',
      categoryId: smartphones.id, brandId: samsung.id, condition: Condition.NEW,
      variants: [
        { sku: 'S24U-256-TB', storage: '256GB', color: 'Titanium Black', priceUzs: 17_900_000n, stock: 8 },
        { sku: 'S24U-512-TG', storage: '512GB', color: 'Titanium Gray', priceUzs: 20_500_000n, stock: 3 },
      ],
    },
    {
      slug: 'google-pixel-8-pro', title: 'Google Pixel 8 Pro',
      desc: 'Tensor G3, seven years of updates and the best computational camera.',
      categoryId: smartphones.id, brandId: google.id, condition: Condition.NEW,
      variants: [{ sku: 'PX8P-128-OB', storage: '128GB', color: 'Obsidian', priceUzs: 11_800_000n, stock: 5 }],
    },
    {
      slug: 'xiaomi-14-pro', title: 'Xiaomi 14 Pro',
      desc: 'Leica optics and Snapdragon 8 Gen 3 performance.',
      categoryId: smartphones.id, brandId: xiaomi.id, condition: Condition.NEW,
      variants: [{ sku: 'MI14P-256-BK', storage: '256GB', color: 'Black', priceUzs: 9_900_000n, stock: 14 }],
    },
    {
      slug: 'apple-macbook-pro-16-m3-max', title: 'Apple MacBook Pro 16" M3 Max',
      desc: 'The most powerful MacBook Pro, built for heavy creative workloads.',
      categoryId: laptops.id, brandId: apple.id, condition: Condition.NEW,
      variants: [{ sku: 'MBP16-M3MAX-1TB', storage: '1TB', color: 'Space Black', priceUzs: 48_000_000n, stock: 2 }],
    },
    {
      slug: 'apple-macbook-air-13-m3', title: 'Apple MacBook Air 13" M3',
      desc: 'Fanless, featherweight and all-day battery.',
      categoryId: laptops.id, brandId: apple.id, condition: Condition.NEW,
      variants: [
        { sku: 'MBA13-M3-256', storage: '256GB', color: 'Midnight', priceUzs: 16_500_000n, stock: 7 },
        { sku: 'MBA13-M3-512', storage: '512GB', color: 'Starlight', priceUzs: 19_000_000n, stock: 4 },
      ],
    },
    {
      slug: 'apple-macbook-pro-14-2023-used-demo', title: 'Apple MacBook Pro 14" 2023 (Used)',
      desc: 'Certified pre-owned M3 Pro. Inspected and ready to ship.',
      categoryId: laptops.id, brandId: apple.id, condition: Condition.USED, grade: UsedGrade.A,
      conditionNotes: 'Like new — no visible marks. Battery health 97%. Original box and charger included.',
      batteryHealth: 97,
      variants: [{ sku: 'MBP14-USED-A', storage: '512GB', color: 'Silver', priceUzs: 36_500_000n, stock: 1 }],
    },
    {
      slug: 'samsung-galaxy-s22-used', title: 'Samsung Galaxy S22 (Used)',
      desc: 'Certified pre-owned, fully functional, great value.',
      categoryId: smartphones.id, brandId: samsung.id, condition: Condition.USED, grade: UsedGrade.B,
      conditionNotes: 'Light wear on the frame. Battery health 88%. Screen flawless.',
      batteryHealth: 88,
      variants: [{ sku: 'S22-USED-B', storage: '128GB', color: 'Phantom White', priceUzs: 6_200_000n, stock: 1 }],
    },
    {
      slug: 'apple-ipad-pro-13-m4', title: 'Apple iPad Pro 13" M4',
      desc: 'Ultra Retina XDR display and the M4 chip in an impossibly thin design.',
      categoryId: tablets.id, brandId: apple.id, condition: Condition.NEW,
      variants: [{ sku: 'IPADP13-M4-256', storage: '256GB', color: 'Space Black', priceUzs: 17_200_000n, stock: 6 }],
    },
    {
      slug: 'sony-wh-1000xm5', title: 'Sony WH-1000XM5',
      desc: 'Industry-leading noise cancelling over-ear headphones.',
      categoryId: audio.id, brandId: sony.id, condition: Condition.NEW,
      variants: [{ sku: 'WH1000XM5-BK', color: 'Black', priceUzs: 4_300_000n, compareAtUzs: 4_900_000n, stock: 18 }],
    },
    {
      slug: 'apple-watch-series-9', title: 'Apple Watch Series 9',
      desc: 'Brighter display, double-tap gesture and carbon-neutral options.',
      categoryId: wearables.id, brandId: apple.id, condition: Condition.NEW,
      variants: [{ sku: 'AWS9-45-MN', color: 'Midnight', priceUzs: 5_600_000n, stock: 11 }],
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        titleUz: p.title, titleRu: p.title, titleEn: p.title,
        descriptionEn: p.desc,
        categoryId: p.categoryId, brandId: p.brandId,
        condition: p.condition, grade: p.grade ?? null,
        conditionNotes: p.conditionNotes ?? null, batteryHealth: p.batteryHealth ?? null,
        isPublished: true,
        variants: {
          create: p.variants.map((v) => ({
            sku: v.sku, storage: v.storage ?? null, color: v.color ?? null,
            priceUzs: v.priceUzs, compareAtUzs: v.compareAtUzs ?? null, stock: v.stock,
          })),
        },
      },
    });
  }

  // ---- Demo accounts ----
  for (const acc of DEMO_ACCOUNTS) {
    const passwordHash = await bcrypt.hash(acc.password, 12);
    await prisma.user.upsert({
      where: { email: acc.email },
      update: { role: acc.role, name: acc.name },
      create: { email: acc.email, passwordHash, name: acc.name, role: acc.role, locale: 'uz' },
    });
  }

  const productCount = await prisma.product.count();
  console.log(`✅ Demo seed complete — ${productCount} products, ${DEMO_ACCOUNTS.length} demo accounts.`);
  console.log('   Demo logins (password Demo1234!):');
  DEMO_ACCOUNTS.forEach((a) => console.log(`   · ${a.role.padEnd(8)} ${a.email}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
