import * as dotenv from 'dotenv';
import * as path from 'path';
// Seed runs from packages/db via ts-node, which doesn't auto-load the repo-root .env.
// Load it before PrismaClient so DATABASE_URL and SEED_OWNER_* are available.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { PrismaClient, Condition, UsedGrade, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') return;

  // Categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: { slug: 'electronics', nameUz: 'Elektronika', nameRu: 'Электроника', nameEn: 'Electronics' },
  });

  const smartphones = await prisma.category.upsert({
    where: { slug: 'smartphones' },
    update: {},
    create: {
      slug: 'smartphones',
      nameUz: 'Smartfonlar',
      nameRu: 'Смартфоны',
      nameEn: 'Smartphones',
      parentId: electronics.id,
    },
  });

  const laptops = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: {
      slug: 'laptops',
      nameUz: 'Noutbuklar',
      nameRu: 'Ноутбуки',
      nameEn: 'Laptops',
      parentId: electronics.id,
    },
  });

  // Brands
  const apple = await prisma.brand.upsert({
    where: { slug: 'apple' },
    update: {},
    create: { slug: 'apple', name: 'Apple' },
  });

  const samsung = await prisma.brand.upsert({
    where: { slug: 'samsung' },
    update: {},
    create: { slug: 'samsung', name: 'Samsung' },
  });

  // New product: iPhone 15 Pro
  const iphone = await prisma.product.upsert({
    where: { slug: 'apple-iphone-15-pro' },
    update: {},
    create: {
      slug: 'apple-iphone-15-pro',
      titleUz: 'Apple iPhone 15 Pro',
      titleRu: 'Apple iPhone 15 Pro',
      titleEn: 'Apple iPhone 15 Pro',
      descriptionEn: 'The latest iPhone with titanium design and A17 Pro chip.',
      categoryId: smartphones.id,
      brandId: apple.id,
      condition: Condition.NEW,
      isPublished: true,
      variants: {
        create: [
          { sku: 'IP15P-128-BLK', storage: '128GB', color: 'Black Titanium', priceUzs: 14_500_000n, stock: 10 },
          { sku: 'IP15P-256-BLK', storage: '256GB', color: 'Black Titanium', priceUzs: 16_500_000n, compareAtUzs: 17_000_000n, stock: 5 },
          { sku: 'IP15P-256-WHT', storage: '256GB', color: 'White Titanium', priceUzs: 16_500_000n, stock: 3 },
        ],
      },
    },
  });

  // Used product: MacBook Pro 14" (Grade B)
  await prisma.product.upsert({
    where: { slug: 'apple-macbook-pro-14-2023-used' },
    update: {},
    create: {
      slug: 'apple-macbook-pro-14-2023-used',
      titleUz: 'Apple MacBook Pro 14" 2023 (Ishlatilgan)',
      titleRu: 'Apple MacBook Pro 14" 2023 (Б/У)',
      titleEn: 'Apple MacBook Pro 14" 2023 (Used)',
      descriptionEn: 'Pre-owned MacBook Pro with M3 Pro chip.',
      categoryId: laptops.id,
      brandId: apple.id,
      condition: Condition.USED,
      grade: UsedGrade.B,
      conditionNotes: 'Minor scratches on bottom case. Battery health 89%. All ports functional. Original charger included.',
      batteryHealth: 89,
      isPublished: true,
      variants: {
        create: [
          { sku: 'MBP14-M3P-18-512-USED', storage: '512GB', color: 'Space Gray', priceUzs: 38_000_000n, stock: 1 },
        ],
      },
    },
  });

  // Samsung Galaxy S24 Ultra
  await prisma.product.upsert({
    where: { slug: 'samsung-galaxy-s24-ultra' },
    update: {},
    create: {
      slug: 'samsung-galaxy-s24-ultra',
      titleUz: 'Samsung Galaxy S24 Ultra',
      titleRu: 'Samsung Galaxy S24 Ultra',
      titleEn: 'Samsung Galaxy S24 Ultra',
      categoryId: smartphones.id,
      brandId: samsung.id,
      condition: Condition.NEW,
      isPublished: true,
      variants: {
        create: [
          { sku: 'S24U-256-BLK', storage: '256GB', color: 'Titanium Black', priceUzs: 17_900_000n, stock: 8 },
          { sku: 'S24U-512-BLK', storage: '512GB', color: 'Titanium Black', priceUzs: 20_500_000n, stock: 4 },
        ],
      },
    },
  });

  // Owner user — credentials come from .env, never hardcoded.
  const ownerEmail = process.env.SEED_OWNER_EMAIL;
  const ownerPassword = process.env.SEED_OWNER_PASSWORD;
  const ownerName = process.env.SEED_OWNER_NAME ?? 'Store Owner';
  const ownerLocale = process.env.SEED_OWNER_LOCALE ?? 'uz';
  if (!ownerEmail || !ownerPassword) {
    throw new Error('Set SEED_OWNER_EMAIL and SEED_OWNER_PASSWORD in .env before seeding.');
  }
  const passwordHash = await bcrypt.hash(ownerPassword, 12);
  await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      passwordHash,
      name: ownerName,
      role: Role.OWNER,
      locale: ownerLocale,
    },
  });

  console.log('✅ Seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
