/**
 * Demo seed — a rich catalog + demo accounts for showing the store to clients.
 *
 *   pnpm db:seed:demo            (from repo root)
 *
 * Idempotent (everything upserts; product scalars + specs refresh on re-run).
 * Refuses to run in production. After running, run `pnpm db:seed:images`.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { PrismaClient, Condition, UsedGrade, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const DEMO_ACCOUNTS = [
  { email: 'owner@demo.uz', password: 'Demo1234!', name: 'Demo Owner', role: Role.OWNER },
  { email: 'manager@demo.uz', password: 'Demo1234!', name: 'Demo Manager', role: Role.MANAGER },
  { email: 'staff@demo.uz', password: 'Demo1234!', name: 'Demo Staff', role: Role.STAFF },
  { email: 'customer@demo.uz', password: 'Demo1234!', name: 'Demo Customer', role: Role.CUSTOMER },
];

type Specs = Record<string, Record<string, string>>;
type Details = {
  releaseYear?: number;
  modelName?: string;
  mpn?: string;
  warrantyMonths?: number;
  weightGrams?: number;
  highlights?: string[];
  specs?: Specs;
};

async function main() {
  // Guard: skip in production. To seed the VPS database, use:
  //   pnpm db:seed:demo:prod   (sets NODE_ENV=development for this run only)
  if (process.env.NODE_ENV === 'production') {
    console.log('Refusing to run demo seed in production.');
    return;
  }

  // ── Root (hidden) ───────────────────────────────────────────────────────────
  const root = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: { nameUz: 'Elektronika', nameRu: 'Электроника', nameEn: 'Electronics' },
    create: { slug: 'electronics', nameUz: 'Elektronika', nameRu: 'Электроника', nameEn: 'Electronics' },
  });

  const cat = async (slug: string, uz: string, ru: string, en: string, parentId = root.id) =>
    prisma.category.upsert({
      where: { slug },
      update: { nameUz: uz, nameRu: ru, nameEn: en, parentId },
      create: { slug, nameUz: uz, nameRu: ru, nameEn: en, parentId },
    });

  // ── Top-level navigation categories ────────────────────────────────────────
  // Nav order: Laptops | PCs | Components | Phones | Gaming | Monitors | Accessories | Networking | Smart Home
  const laptops      = await cat('laptops',      'Noutbuklar',          'Ноутбуки',            'Laptops');
  const desktopPcs   = await cat('desktop-pcs',  'Stol kompyuterlari',  'Настольные ПК',       'Desktop PCs');
  const components   = await cat('components',   'Kompyuter qismlari',  'Комплектующие',       'Components');
  const smartphones  = await cat('smartphones',  'Smartfonlar',         'Смартфоны',           'Smartphones');
  const gaming       = await cat('gaming',       'Geyming',             'Игры',                'Gaming');
  const monitors     = await cat('monitors',     'Monitorlar',          'Мониторы',            'Monitors');
  const accessories  = await cat('accessories',  'Aksessuarlar',        'Аксессуары',          'Accessories');
  const networking   = await cat('networking',   'Tarmoq uskunalari',   'Сетевое оборудование','Networking');
  const smartHome    = await cat('smart-home',   'Aqlli uy',            'Умный дом',           'Smart Home');

  // ── Sub-categories (informational, no nav unless they have products) ────────
  await cat('tablets',          'Planshetlar',            'Планшеты',              'Tablets',          smartphones.id);
  await cat('smartwatches',     'Aqlli soatlar',          'Смарт-часы',            'Smartwatches',     accessories.id);
  await cat('headphones-audio', 'Quloqchin va audio',     'Наушники и аудио',      'Headphones & Audio', accessories.id);
  await cat('processors',       'Protsessorlar (CPU)',     'Процессоры (CPU)',       'Processors (CPU)', components.id);
  await cat('graphics-cards',   'Videokartalar (GPU)',     'Видеокарты (GPU)',       'Graphics Cards',   components.id);
  await cat('ram-memory',       'Operativ xotira (RAM)',   'Оперативная память',    'RAM',              components.id);
  await cat('storage-drives',   'SSD va HDD disklar',     'SSD и HDD',             'SSD & HDD',        components.id);
  await cat('gaming-laptops',   'Geyming noutbuklar',     'Игровые ноутбуки',      'Gaming Laptops',   gaming.id);
  await cat('consoles',         'Konsollar',              'Консоли',               'Consoles',         gaming.id);
  await cat('storage-power',    'Saqlash va quvvat',      'Хранение и питание',    'Storage & Power',  accessories.id);

  // ── Brands ──────────────────────────────────────────────────────────────────
  const brand = async (slug: string, name: string) =>
    prisma.brand.upsert({ where: { slug }, update: { name }, create: { slug, name } });

  const apple    = await brand('apple',   'Apple');
  const samsung  = await brand('samsung', 'Samsung');
  const google   = await brand('google',  'Google');
  const sony     = await brand('sony',    'Sony');
  const xiaomi   = await brand('xiaomi',  'Xiaomi');
  const nintendo = await brand('nintendo','Nintendo');
  const anker    = await brand('anker',   'Anker');
  const spigen   = await brand('spigen',  'Spigen');
  const lg       = await brand('lg',      'LG');
  const tplink   = await brand('tplink',  'TP-Link');
  const asus     = await brand('asus',    'ASUS');
  const lenovo   = await brand('lenovo',  'Lenovo');
  const dell     = await brand('dell',    'Dell');

  // ── Products ─────────────────────────────────────────────────────────────────
  type V = { sku: string; storage?: string; color?: string; priceUzs: bigint; compareAtUzs?: bigint; stock: number };
  type P = {
    slug: string; title: string; desc: string; categoryId: string; brandId: string;
    condition: Condition; grade?: UsedGrade; conditionNotes?: string; batteryHealth?: number;
    details?: Details;
    variants: V[];
  };

  const products: P[] = [
    // ── Smartphones ────────────────────────────────────────────────────────────
    {
      slug: 'apple-iphone-15-pro-max', title: 'Apple iPhone 15 Pro Max',
      desc: 'Titanium flagship with A17 Pro and 5x telephoto.',
      categoryId: smartphones.id, brandId: apple.id, condition: Condition.NEW,
      details: {
        releaseYear: 2023, modelName: 'iPhone 15 Pro Max', mpn: 'MU7E3', warrantyMonths: 12, weightGrams: 221,
        highlights: ['Aerospace-grade titanium design', 'A17 Pro chip', '5x telephoto camera', 'Action button + USB-C'],
        specs: {
          Display: { Size: '6.7"', Type: 'Super Retina XDR OLED', Refresh: '120Hz ProMotion', Brightness: '2000 nits' },
          Performance: { Chip: 'A17 Pro', CPU: '6-core', GPU: '6-core' },
          Camera: { Main: '48MP', Telephoto: '12MP 5x', Ultrawide: '12MP', Front: '12MP' },
          Battery: { Capacity: '4422 mAh', Charging: 'USB-C, 27W wired, 15W MagSafe' },
          Connectivity: { Cellular: '5G', 'Wi-Fi': 'Wi-Fi 6E', Port: 'USB-C 3.0' },
        },
      },
      variants: [
        { sku: 'IP15PM-256-NT', storage: '256GB', color: 'Natural Titanium', priceUzs: 18_900_000n, stock: 12 },
        { sku: 'IP15PM-512-BT', storage: '512GB', color: 'Blue Titanium', priceUzs: 21_500_000n, compareAtUzs: 22_900_000n, stock: 6 },
      ],
    },
    {
      slug: 'apple-iphone-15', title: 'Apple iPhone 15',
      desc: 'Dynamic Island, USB-C and a 48MP main camera.',
      categoryId: smartphones.id, brandId: apple.id, condition: Condition.NEW,
      details: {
        releaseYear: 2023, modelName: 'iPhone 15', mpn: 'MTP03', warrantyMonths: 12, weightGrams: 171,
        highlights: ['Dynamic Island', '48MP main camera', 'USB-C', 'A16 Bionic'],
        specs: {
          Display: { Size: '6.1"', Type: 'Super Retina XDR OLED', Brightness: '2000 nits' },
          Performance: { Chip: 'A16 Bionic' },
          Camera: { Main: '48MP', Ultrawide: '12MP', Front: '12MP' },
        },
      },
      variants: [
        { sku: 'IP15-128-PK', storage: '128GB', color: 'Pink', priceUzs: 12_400_000n, stock: 20 },
        { sku: 'IP15-256-BK', storage: '256GB', color: 'Black', priceUzs: 14_200_000n, stock: 9 },
      ],
    },
    {
      slug: 'samsung-galaxy-s24-ultra', title: 'Samsung Galaxy S24 Ultra',
      desc: 'Galaxy AI, titanium frame and built-in S Pen.',
      categoryId: smartphones.id, brandId: samsung.id, condition: Condition.NEW,
      details: {
        releaseYear: 2024, modelName: 'SM-S928', mpn: 'SM-S928BZKG', warrantyMonths: 12, weightGrams: 232,
        highlights: ['Galaxy AI', 'Titanium frame', 'Built-in S Pen', '200MP camera'],
        specs: {
          Display: { Size: '6.8"', Type: 'Dynamic AMOLED 2X', Refresh: '120Hz', Brightness: '2600 nits' },
          Performance: { Chip: 'Snapdragon 8 Gen 3 for Galaxy' },
          Camera: { Main: '200MP', Periscope: '50MP 5x', Telephoto: '10MP 3x', Ultrawide: '12MP' },
          Battery: { Capacity: '5000 mAh', Charging: '45W wired' },
        },
      },
      variants: [
        { sku: 'S24U-256-TB', storage: '256GB', color: 'Titanium Black', priceUzs: 17_900_000n, stock: 8 },
        { sku: 'S24U-512-TG', storage: '512GB', color: 'Titanium Gray', priceUzs: 20_500_000n, stock: 3 },
      ],
    },
    {
      slug: 'google-pixel-8-pro', title: 'Google Pixel 8 Pro',
      desc: 'Tensor G3, seven years of updates and best computational camera.',
      categoryId: smartphones.id, brandId: google.id, condition: Condition.NEW,
      details: {
        releaseYear: 2023, modelName: 'Pixel 8 Pro', mpn: 'GC3VE', warrantyMonths: 12, weightGrams: 213,
        highlights: ['7 years of OS updates', 'Tensor G3', 'Pro camera controls'],
        specs: {
          Display: { Size: '6.7"', Type: 'LTPO OLED', Refresh: '120Hz' },
          Performance: { Chip: 'Google Tensor G3' },
          Camera: { Main: '50MP', Telephoto: '48MP 5x', Ultrawide: '48MP' },
        },
      },
      variants: [{ sku: 'PX8P-128-OB', storage: '128GB', color: 'Obsidian', priceUzs: 11_800_000n, stock: 5 }],
    },
    {
      slug: 'xiaomi-14-pro', title: 'Xiaomi 14 Pro',
      desc: 'Leica optics and Snapdragon 8 Gen 3 performance.',
      categoryId: smartphones.id, brandId: xiaomi.id, condition: Condition.NEW,
      details: {
        releaseYear: 2023, modelName: 'Xiaomi 14 Pro', warrantyMonths: 12, weightGrams: 223,
        highlights: ['Leica Summilux optics', 'Snapdragon 8 Gen 3', '120W HyperCharge'],
        specs: {
          Display: { Size: '6.73"', Type: 'LTPO AMOLED', Refresh: '120Hz' },
          Performance: { Chip: 'Snapdragon 8 Gen 3' },
          Battery: { Capacity: '4880 mAh', Charging: '120W wired, 50W wireless' },
        },
      },
      variants: [{ sku: 'MI14P-256-BK', storage: '256GB', color: 'Black', priceUzs: 9_900_000n, stock: 14 }],
    },
    {
      slug: 'samsung-galaxy-s22-used', title: 'Samsung Galaxy S22 (Used)',
      desc: 'Certified pre-owned, fully functional, great value.',
      categoryId: smartphones.id, brandId: samsung.id, condition: Condition.USED, grade: UsedGrade.B,
      conditionNotes: 'Light wear on frame. Battery health 88%. Screen flawless.',
      batteryHealth: 88,
      details: {
        releaseYear: 2022, modelName: 'SM-S901', warrantyMonths: 3, weightGrams: 167,
        highlights: ['Certified pre-owned', 'Battery health 88%', 'Flawless screen'],
        specs: { Display: { Size: '6.1"', Type: 'Dynamic AMOLED 2X' }, Performance: { Chip: 'Snapdragon 8 Gen 1' } },
      },
      variants: [{ sku: 'S22-USED-B', storage: '128GB', color: 'Phantom White', priceUzs: 6_200_000n, stock: 1 }],
    },

    // ── Laptops ────────────────────────────────────────────────────────────────
    {
      slug: 'apple-macbook-pro-16-m3-max', title: 'Apple MacBook Pro 16" M3 Max',
      desc: 'The most powerful MacBook Pro for heavy creative workloads.',
      categoryId: laptops.id, brandId: apple.id, condition: Condition.NEW,
      details: {
        releaseYear: 2023, modelName: 'MacBook Pro 16" (M3 Max)', mpn: 'MRW73', warrantyMonths: 12, weightGrams: 2160,
        highlights: ['M3 Max — 16-core CPU', 'Liquid Retina XDR display', 'Up to 22h battery'],
        specs: {
          Display: { Size: '16.2"', Type: 'Liquid Retina XDR', Refresh: '120Hz ProMotion' },
          Performance: { Chip: 'Apple M3 Max', CPU: '16-core', GPU: '40-core', RAM: '48GB unified' },
          Battery: { Life: 'Up to 22 hours', Charging: '140W MagSafe 3' },
        },
      },
      variants: [{ sku: 'MBP16-M3MAX-1TB', storage: '1TB', color: 'Space Black', priceUzs: 48_000_000n, stock: 2 }],
    },
    {
      slug: 'apple-macbook-air-13-m3', title: 'Apple MacBook Air 13" M3',
      desc: 'Fanless, featherweight and all-day battery.',
      categoryId: laptops.id, brandId: apple.id, condition: Condition.NEW,
      details: {
        releaseYear: 2024, modelName: 'MacBook Air 13" (M3)', mpn: 'MRXV3', warrantyMonths: 12, weightGrams: 1240,
        highlights: ['Apple M3 chip', 'Fanless silent design', 'Up to 18h battery'],
        specs: {
          Display: { Size: '13.6"', Type: 'Liquid Retina', Brightness: '500 nits' },
          Performance: { Chip: 'Apple M3', CPU: '8-core', GPU: '10-core' },
          Battery: { Life: 'Up to 18 hours' },
        },
      },
      variants: [
        { sku: 'MBA13-M3-256', storage: '256GB', color: 'Midnight', priceUzs: 16_500_000n, stock: 7 },
        { sku: 'MBA13-M3-512', storage: '512GB', color: 'Starlight', priceUzs: 19_000_000n, stock: 4 },
      ],
    },
    {
      slug: 'asus-rog-strix-g16-2024', title: 'ASUS ROG Strix G16 Gaming Laptop',
      desc: 'RTX 4070 Ti, i9-14900HX, and 240Hz QHD display.',
      categoryId: laptops.id, brandId: asus.id, condition: Condition.NEW,
      details: {
        releaseYear: 2024, modelName: 'G614JZR', warrantyMonths: 12, weightGrams: 2600,
        highlights: ['GeForce RTX 4070 Ti', 'Intel i9-14900HX', '240Hz QHD display', 'Liquid metal thermal'],
        specs: {
          Display: { Size: '16"', Type: 'IPS QHD', Refresh: '240Hz' },
          Performance: { CPU: 'Intel Core i9-14900HX', GPU: 'NVIDIA RTX 4070 Ti SUPER', RAM: '32GB DDR5' },
          Storage: { SSD: '1TB PCIe 4.0 NVMe' },
        },
      },
      variants: [{ sku: 'ROG-G16-32-1TB', storage: '1TB', color: 'Eclipse Gray', priceUzs: 28_900_000n, compareAtUzs: 31_000_000n, stock: 4 }],
    },
    {
      slug: 'lenovo-thinkpad-x1-carbon-gen12', title: 'Lenovo ThinkPad X1 Carbon Gen 12',
      desc: 'Ultra-thin business laptop with Intel Core Ultra.',
      categoryId: laptops.id, brandId: lenovo.id, condition: Condition.NEW,
      details: {
        releaseYear: 2024, modelName: 'X1 Carbon Gen 12', warrantyMonths: 12, weightGrams: 1120,
        highlights: ['Intel Core Ultra 7', 'Under 1.12 kg', '4G LTE optional', 'Military-grade durability'],
        specs: {
          Display: { Size: '14"', Type: 'IPS 2.8K OLED', Refresh: '120Hz' },
          Performance: { CPU: 'Intel Core Ultra 7 165U', RAM: '32GB LPDDR5X' },
          Battery: { Life: 'Up to 15 hours' },
        },
      },
      variants: [{ sku: 'X1C12-32-1TB', storage: '1TB', color: 'Black', priceUzs: 22_500_000n, stock: 3 }],
    },
    {
      slug: 'apple-macbook-pro-14-used', title: 'Apple MacBook Pro 14" 2023 (Used)',
      desc: 'Certified pre-owned M3 Pro. Inspected and ready to ship.',
      categoryId: laptops.id, brandId: apple.id, condition: Condition.USED, grade: UsedGrade.A,
      conditionNotes: 'Like new — no visible marks. Battery health 97%. Original box included.',
      batteryHealth: 97,
      details: {
        releaseYear: 2023, modelName: 'MacBook Pro 14" (M3 Pro)', warrantyMonths: 6, weightGrams: 1610,
        highlights: ['Certified pre-owned', 'Battery health 97%', '14-day return'],
        specs: { Performance: { Chip: 'Apple M3 Pro', RAM: '18GB' }, Display: { Size: '14.2"', Type: 'Liquid Retina XDR' } },
      },
      variants: [{ sku: 'MBP14-USED-A', storage: '512GB', color: 'Silver', priceUzs: 36_500_000n, stock: 1 }],
    },

    // ── Desktop PCs ────────────────────────────────────────────────────────────
    {
      slug: 'apple-mac-mini-m4', title: 'Apple Mac Mini M4',
      desc: 'Compact powerhouse with M4 chip and 16GB RAM.',
      categoryId: desktopPcs.id, brandId: apple.id, condition: Condition.NEW,
      details: {
        releaseYear: 2024, modelName: 'Mac Mini (M4)', mpn: 'MUAK3', warrantyMonths: 12, weightGrams: 670,
        highlights: ['Apple M4 chip', '10-core CPU, 10-core GPU', 'Thunderbolt 4 + USB-C', 'Ultra-compact 12.7 cm'],
        specs: {
          Performance: { Chip: 'Apple M4', CPU: '10-core', GPU: '10-core', RAM: '16GB unified' },
          Storage: { SSD: '256GB NVMe' },
          Connectivity: { Ports: '3× USB-C, 2× USB-A, HDMI 2.1, 3.5mm', 'Wi-Fi': 'Wi-Fi 6E', Bluetooth: '5.3' },
        },
      },
      variants: [
        { sku: 'MMINI-M4-256', storage: '256GB', color: 'Silver', priceUzs: 11_900_000n, stock: 5 },
        { sku: 'MMINI-M4-512', storage: '512GB', color: 'Silver', priceUzs: 14_200_000n, stock: 3 },
      ],
    },
    {
      slug: 'dell-xps-desktop-8960', title: 'Dell XPS Desktop 8960',
      desc: 'Intel Core i7-13700 with RTX 4060 Ti for creative pros.',
      categoryId: desktopPcs.id, brandId: dell.id, condition: Condition.NEW,
      details: {
        releaseYear: 2023, modelName: 'XPS 8960', warrantyMonths: 12, weightGrams: 8800,
        highlights: ['Intel Core i7-13700', 'NVIDIA RTX 4060 Ti', '32GB DDR5', 'Tool-less chassis'],
        specs: {
          Performance: { CPU: 'Intel Core i7-13700', GPU: 'NVIDIA RTX 4060 Ti 8GB', RAM: '32GB DDR5' },
          Storage: { SSD: '1TB NVMe', HDD: '2TB 7200RPM' },
        },
      },
      variants: [{ sku: 'XPS8960-I7-1TB', storage: '1TB SSD', color: 'Platinum Silver', priceUzs: 19_800_000n, compareAtUzs: 22_000_000n, stock: 2 }],
    },

    // ── Components ─────────────────────────────────────────────────────────────
    {
      slug: 'samsung-990-pro-1tb', title: 'Samsung 990 Pro 1TB NVMe SSD',
      desc: 'PCIe 4.0 SSD with 7450MB/s sequential read.',
      categoryId: components.id, brandId: samsung.id, condition: Condition.NEW,
      details: {
        releaseYear: 2022, modelName: 'MZ-V9P1T0BW', warrantyMonths: 60, weightGrams: 9,
        highlights: ['7450 MB/s read', 'PCIe 4.0 x4', 'M.2 2280', '5-year warranty'],
        specs: {
          Performance: { 'Sequential Read': '7450 MB/s', 'Sequential Write': '6900 MB/s', Interface: 'PCIe 4.0 x4 NVMe 2.0' },
          Physical: { Form: 'M.2 2280', Encryption: 'AES 256-bit' },
        },
      },
      variants: [{ sku: 'S990PRO-1TB', storage: '1TB', priceUzs: 1_290_000n, compareAtUzs: 1_490_000n, stock: 30 }],
    },
    {
      slug: 'corsair-vengeance-32gb-ddr5', title: 'Corsair Vengeance 32GB DDR5-6000',
      desc: '2×16GB DDR5 kit optimised for Intel XMP 3.0.',
      categoryId: components.id, brandId: samsung.id, condition: Condition.NEW,
      details: {
        releaseYear: 2022, modelName: 'CMK32GX5M2B6000C30', warrantyMonths: 120, weightGrams: 80,
        highlights: ['DDR5-6000 MHz', 'Intel XMP 3.0 / AMD EXPO', '2×16GB kit', 'Low-profile heat spreader'],
        specs: {
          Memory: { Capacity: '32GB (2×16GB)', Speed: 'DDR5-6000', Latency: 'CL30', Voltage: '1.35V' },
        },
      },
      variants: [{ sku: 'CMK32GX5M2B6000', color: 'Black', priceUzs: 1_890_000n, stock: 15 }],
    },

    // ── Monitors ───────────────────────────────────────────────────────────────
    {
      slug: 'lg-27gp850-b', title: 'LG 27GP850-B UltraGear 27" Gaming Monitor',
      desc: '165Hz Nano IPS, 1ms GTG — built for competitive gaming.',
      categoryId: monitors.id, brandId: lg.id, condition: Condition.NEW,
      details: {
        releaseYear: 2021, modelName: '27GP850-B', warrantyMonths: 36, weightGrams: 6800,
        highlights: ['165Hz refresh rate', '1ms GTG response', 'Nano IPS panel', 'NVIDIA G-Sync compatible'],
        specs: {
          Display: { Size: '27"', Resolution: '2560×1440 QHD', Panel: 'Nano IPS', Refresh: '165Hz', 'Response time': '1ms GTG' },
          Connectivity: { Ports: '2× HDMI 2.0, 1× DisplayPort 1.4, 2× USB-A' },
        },
      },
      variants: [{ sku: 'LG27GP850', color: 'Black', priceUzs: 4_800_000n, compareAtUzs: 5_400_000n, stock: 8 }],
    },
    {
      slug: 'dell-u2724d-ultrasharp', title: 'Dell UltraSharp U2724D 27" 4K Monitor',
      desc: 'IPS Black panel — perfect for colour-accurate creative work.',
      categoryId: monitors.id, brandId: dell.id, condition: Condition.NEW,
      details: {
        releaseYear: 2023, modelName: 'U2724D', warrantyMonths: 36, weightGrams: 6700,
        highlights: ['IPS Black — 2000:1 contrast', '4K 3840×2160', 'USB-C 90W charging', 'Factory-calibrated'],
        specs: {
          Display: { Size: '27"', Resolution: '3840×2160 4K', Panel: 'IPS Black', Refresh: '60Hz', 'Color coverage': '100% sRGB, 98% DCI-P3' },
          Connectivity: { Ports: 'USB-C 90W, HDMI 2.0, DP 1.4, 4× USB-A' },
        },
      },
      variants: [{ sku: 'DELL-U2724D', color: 'Black', priceUzs: 6_200_000n, stock: 5 }],
    },

    // ── Networking ─────────────────────────────────────────────────────────────
    {
      slug: 'tplink-archer-ax73', title: 'TP-Link Archer AX73 Wi-Fi 6 Router',
      desc: 'AX5400 dual-band router — powerful coverage for large homes.',
      categoryId: networking.id, brandId: tplink.id, condition: Condition.NEW,
      details: {
        releaseYear: 2021, modelName: 'AX73', warrantyMonths: 24, weightGrams: 1050,
        highlights: ['Wi-Fi 6 — AX5400', '6 antennas', 'MU-MIMO', 'USB 3.0 sharing'],
        specs: {
          Wireless: { Standard: 'Wi-Fi 6 (802.11ax)', Speed: 'AX5400 (574+4804 Mbps)', Bands: 'Dual-band 2.4/5GHz' },
          Ports: { WAN: '1× Gigabit WAN', LAN: '4× Gigabit LAN', USB: '1× USB 3.0' },
        },
      },
      variants: [{ sku: 'AX73-WH', color: 'White', priceUzs: 890_000n, compareAtUzs: 1_090_000n, stock: 20 }],
    },
    {
      slug: 'asus-rog-rapture-gt6-mesh', title: 'ASUS ROG Rapture GT6 Mesh System',
      desc: 'Tri-band Wi-Fi 6 mesh for lag-free gaming throughout the home.',
      categoryId: networking.id, brandId: asus.id, condition: Condition.NEW,
      details: {
        releaseYear: 2022, modelName: 'GT6 (2-pack)', warrantyMonths: 24,
        highlights: ['Tri-band Wi-Fi 6', '10 Gbps backhaul ready', 'ASUS AiMesh', 'Gaming optimized QoS'],
        specs: {
          Wireless: { Standard: 'Wi-Fi 6 (802.11ax)', Speed: 'AXE11000', Coverage: 'Up to 560m² (2 nodes)' },
        },
      },
      variants: [{ sku: 'ROG-GT6-2PK', color: 'Black', priceUzs: 3_200_000n, stock: 4 }],
    },

    // ── Smart Home ─────────────────────────────────────────────────────────────
    {
      slug: 'google-nest-hub-2nd-gen', title: 'Google Nest Hub (2nd Gen)',
      desc: '7-inch smart display with sleep tracking — your home hub.',
      categoryId: smartHome.id, brandId: google.id, condition: Condition.NEW,
      details: {
        releaseYear: 2021, modelName: 'GA01892', warrantyMonths: 12, weightGrams: 490,
        highlights: ['7" LCD touchscreen', 'Sleep Sense technology', 'Google Assistant', 'Stereo speaker'],
        specs: {
          Display: { Size: '7"', Type: 'LCD capacitive touch', Brightness: 'Ambient EQ' },
          Audio: { Speakers: 'Full-range driver + passive radiator' },
          Connectivity: { 'Wi-Fi': 'Wi-Fi 5 dual-band', Bluetooth: '5.0' },
        },
      },
      variants: [{ sku: 'NESTH2-CHL', color: 'Chalk', priceUzs: 1_150_000n, compareAtUzs: 1_350_000n, stock: 12 }],
    },
    {
      slug: 'xiaomi-smart-speaker-lite', title: 'Xiaomi Smart Speaker Lite',
      desc: 'Compact smart speaker with Google Assistant and rich sound.',
      categoryId: smartHome.id, brandId: xiaomi.id, condition: Condition.NEW,
      details: {
        releaseYear: 2023, modelName: 'XM-SSLITE', warrantyMonths: 12, weightGrams: 310,
        highlights: ['Google Assistant built-in', '360° omni-directional sound', 'Smart home control', 'Wi-Fi + Bluetooth'],
        specs: {
          Audio: { Driver: '2.5" full-range', Output: '6W' },
          Connectivity: { 'Wi-Fi': '2.4 / 5GHz', Bluetooth: '5.0' },
        },
      },
      variants: [{ sku: 'XMSS-LITE-WH', color: 'White', priceUzs: 680_000n, stock: 18 }],
    },

    // ── Gaming ─────────────────────────────────────────────────────────────────
    {
      slug: 'sony-playstation-5-slim', title: 'Sony PlayStation 5 Slim',
      desc: 'Next-gen gaming with lightning-fast SSD and 4K output.',
      categoryId: gaming.id, brandId: sony.id, condition: Condition.NEW,
      details: {
        releaseYear: 2023, modelName: 'CFI-2000', warrantyMonths: 12, weightGrams: 3200,
        highlights: ['Custom RDNA 2 GPU', '1TB NVMe SSD', '4K 120Hz, ray tracing', 'DualSense haptics'],
        specs: {
          Performance: { GPU: '10.28 TFLOPs RDNA 2', CPU: '8-core Zen 2', Storage: '1TB NVMe SSD' },
          Output: { Resolution: 'Up to 4K 120Hz', Optical: 'Ultra HD Blu-ray' },
        },
      },
      variants: [{ sku: 'PS5-SLIM-1TB', storage: '1TB', color: 'White', priceUzs: 7_200_000n, compareAtUzs: 7_900_000n, stock: 9 }],
    },
    {
      slug: 'nintendo-switch-oled', title: 'Nintendo Switch OLED',
      desc: 'Vivid 7-inch OLED screen, handheld or docked on the TV.',
      categoryId: gaming.id, brandId: nintendo.id, condition: Condition.NEW,
      details: {
        releaseYear: 2021, modelName: 'HEG-001', warrantyMonths: 12, weightGrams: 420,
        highlights: ['7" OLED screen', 'Handheld + docked play', 'Enhanced audio', '64GB storage'],
        specs: {
          Display: { Size: '7"', Type: 'OLED', Resolution: '1280×720 handheld / 1080p docked' },
          Storage: { Internal: '64GB (expandable via microSD)' },
        },
      },
      variants: [{ sku: 'NSW-OLED-WH', color: 'White', priceUzs: 4_100_000n, stock: 13 }],
    },
    {
      slug: 'sony-dualsense-edge', title: 'Sony DualSense Edge Wireless Controller',
      desc: 'Pro-level customisable controller for PlayStation 5.',
      categoryId: gaming.id, brandId: sony.id, condition: Condition.NEW,
      details: {
        releaseYear: 2023, modelName: 'CFI-ZCP1', warrantyMonths: 12, weightGrams: 325,
        highlights: ['Swappable back buttons', 'Adjustable trigger dead zones', 'Pro-length sticks', 'USB-C charging'],
        specs: { Input: { Buttons: 'Remappable back buttons', Triggers: 'Adjustable travel + dead zones', Sticks: '3 pairs included' } },
      },
      variants: [{ sku: 'DS-EDGE-WH', color: 'White', priceUzs: 2_800_000n, stock: 10 }],
    },

    // ── Accessories ────────────────────────────────────────────────────────────
    {
      slug: 'anker-737-power-bank', title: 'Anker 737 Power Bank 24,000mAh',
      desc: '140W output — charges a MacBook Pro fast.',
      categoryId: accessories.id, brandId: anker.id, condition: Condition.NEW,
      details: {
        releaseYear: 2022, modelName: 'A1289', warrantyMonths: 18, weightGrams: 630,
        highlights: ['24,000mAh capacity', '140W max output', 'Smart digital display'],
        specs: { Battery: { Capacity: '24,000 mAh', Output: '140W USB-C', Ports: '2× USB-C, 1× USB-A' } },
      },
      variants: [{ sku: 'ANK-737-BK', color: 'Black', priceUzs: 1_650_000n, compareAtUzs: 1_900_000n, stock: 25 }],
    },
    {
      slug: 'anker-nano-65w-charger', title: 'Anker Nano II 65W USB-C Charger',
      desc: 'Compact GaN charger for phones, tablets and laptops.',
      categoryId: accessories.id, brandId: anker.id, condition: Condition.NEW,
      details: {
        releaseYear: 2021, modelName: 'A2663', warrantyMonths: 18, weightGrams: 112,
        highlights: ['65W GaN II', 'Half the size of stock charger', 'Universal compatibility'],
        specs: { Power: { Output: '65W max', Tech: 'GaN II', Port: 'USB-C PD 3.0' } },
      },
      variants: [{ sku: 'ANK-65W-BK', color: 'Black', priceUzs: 480_000n, stock: 40 }],
    },
    {
      slug: 'sony-wh-1000xm5', title: 'Sony WH-1000XM5 Headphones',
      desc: 'Industry-leading noise cancelling over-ear headphones.',
      categoryId: accessories.id, brandId: sony.id, condition: Condition.NEW,
      details: {
        releaseYear: 2022, modelName: 'WH-1000XM5', mpn: 'WH1000XM5B', warrantyMonths: 12, weightGrams: 250,
        highlights: ['Best-in-class noise cancelling', '30h battery', 'Multipoint connection'],
        specs: {
          Audio: { Drivers: '30mm', Codecs: 'LDAC, AAC, SBC', 'Noise cancelling': 'Dual processor, 8 mics' },
          Battery: { Life: '30 hours', Charging: 'USB-C, 3 min = 3h' },
        },
      },
      variants: [{ sku: 'WH1000XM5-BK', color: 'Black', priceUzs: 4_300_000n, compareAtUzs: 4_900_000n, stock: 18 }],
    },
    {
      slug: 'spigen-iphone-15-pro-case', title: 'Spigen Ultra Hybrid Case — iPhone 15 Pro',
      desc: 'Crystal-clear protection with reinforced corners and MagSafe.',
      categoryId: accessories.id, brandId: spigen.id, condition: Condition.NEW,
      details: {
        releaseYear: 2023, modelName: 'ACS06706', warrantyMonths: 6, weightGrams: 30,
        highlights: ['MagSafe compatible', 'Air-cushion corners', 'Anti-yellowing'],
        specs: { Material: { Back: 'Clear polycarbonate', Bumper: 'TPU', MagSafe: 'Yes' } },
      },
      variants: [{ sku: 'SPG-15PRO-CL', color: 'Crystal Clear', priceUzs: 320_000n, stock: 50 }],
    },
    {
      slug: 'apple-watch-series-9', title: 'Apple Watch Series 9 45mm',
      desc: 'Brighter display, double-tap gesture and carbon-neutral options.',
      categoryId: accessories.id, brandId: apple.id, condition: Condition.NEW,
      details: {
        releaseYear: 2023, modelName: 'Watch Series 9 (45mm)', mpn: 'MR9A3', warrantyMonths: 12, weightGrams: 39,
        highlights: ['Double-tap gesture', '2000-nit display', 'S9 SiP'],
        specs: {
          Display: { Size: '45mm', Type: 'LTPO OLED', Brightness: '2000 nits' },
          Health: { Sensors: 'ECG, Blood oxygen, Temperature' },
        },
      },
      variants: [{ sku: 'AWS9-45-MN', color: 'Midnight', priceUzs: 5_600_000n, stock: 11 }],
    },
  ];

  for (const p of products) {
    const scalar = {
      titleUz: p.title, titleRu: p.title, titleEn: p.title,
      descriptionEn: p.desc,
      categoryId: p.categoryId, brandId: p.brandId,
      condition: p.condition, grade: p.grade ?? null,
      conditionNotes: p.conditionNotes ?? null, batteryHealth: p.batteryHealth ?? null,
      releaseYear: p.details?.releaseYear ?? null,
      modelName: p.details?.modelName ?? null,
      mpn: p.details?.mpn ?? null,
      warrantyMonths: p.details?.warrantyMonths ?? null,
      weightGrams: p.details?.weightGrams ?? null,
      highlights: p.details?.highlights ?? [],
      specs: (p.details?.specs ?? undefined) as object | undefined,
      isPublished: true,
    };
    const imageData = [{ url: `https://picsum.photos/seed/${p.slug}/600/600`, alt: null, position: 0 }];
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...scalar, images: { deleteMany: {}, create: imageData } },
      create: {
        slug: p.slug,
        ...scalar,
        images: { create: imageData },
        variants: {
          create: p.variants.map((v) => ({
            sku: v.sku, storage: v.storage ?? null, color: v.color ?? null,
            priceUzs: v.priceUzs, compareAtUzs: v.compareAtUzs ?? null, stock: v.stock,
          })),
        },
      },
    });
  }

  // Retire old/empty category slugs that may exist from previous seeds.
  const oldSlugs = ['audio', 'wearables', 'cases', 'chargers-cables', 'power-banks', 'tablets'];
  for (const slug of oldSlugs) {
    const c = await prisma.category.findUnique({ where: { slug }, include: { _count: { select: { products: true } } } });
    if (c && c._count.products === 0) await prisma.category.delete({ where: { id: c.id } }).catch(() => {});
  }

  // ── Demo accounts ─────────────────────────────────────────────────────────
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
  console.log('   Run `pnpm db:seed:images` to generate product images.');
  DEMO_ACCOUNTS.forEach((a) => console.log(`   · ${a.role.padEnd(8)} ${a.email}`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
