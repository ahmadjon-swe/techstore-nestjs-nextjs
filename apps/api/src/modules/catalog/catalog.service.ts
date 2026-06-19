import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@techstore/db';
import { PrismaService } from '../../prisma/prisma.service';

export type ProductSort = 'newest' | 'price-asc' | 'price-desc' | 'discount';

export interface ProductFilter {
  categorySlug?: string;
  brandSlug?: string;
  condition?: 'NEW' | 'USED';
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  sort?: ProductSort;
  onSale?: boolean | string;
  page?: number;
  limit?: number;
}

const VARIANT_SELECT = {
  id: true, sku: true, storage: true, color: true,
  priceUzs: true, compareAtUzs: true, stock: true, attributes: true,
};

/** Card listing shape — 2 images so the card can swap on hover. */
const CARD_SELECT = {
  id: true, slug: true, titleUz: true, titleRu: true, titleEn: true,
  condition: true, grade: true, isPublished: true, createdAt: true,
  category: { select: { slug: true, nameUz: true, nameRu: true, nameEn: true } },
  brand: { select: { slug: true, name: true, logoUrl: true } },
  images: { orderBy: { position: 'asc' as const }, take: 2 },
  variants: { select: VARIANT_SELECT },
};

/** Lowest active price across a product's variants (for sorting/display). */
function minPrice(p: { variants: { priceUzs: bigint }[] }): bigint {
  if (!p.variants.length) return 0n;
  return p.variants.reduce((m, v) => (v.priceUzs < m ? v.priceUzs : m), p.variants[0].priceUzs);
}

/** Best discount percent across variants, 0 if none on sale. */
function discountPct(p: { variants: { priceUzs: bigint; compareAtUzs: bigint | null }[] }): number {
  let best = 0;
  for (const v of p.variants) {
    if (v.compareAtUzs && v.compareAtUzs > v.priceUzs) {
      const pct = Number(((v.compareAtUzs - v.priceUzs) * 100n) / v.compareAtUzs);
      if (pct > best) best = pct;
    }
  }
  return best;
}

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async listProducts(filter: ProductFilter) {
    const {
      categorySlug, brandSlug, condition, minPrice: min, maxPrice: max,
      search, sort = 'newest', page = 1, limit = 20,
    } = filter;
    const onSale = filter.onSale === true || filter.onSale === 'true';

    const where: Prisma.ProductWhereInput = {
      isPublished: true,
      ...(condition && { condition }),
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(brandSlug && { brand: { slug: brandSlug } }),
      ...(search && {
        OR: [
          { titleUz: { contains: search, mode: 'insensitive' } },
          { titleRu: { contains: search, mode: 'insensitive' } },
          { titleEn: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(min || max
        ? { variants: { some: { priceUzs: { ...(min && { gte: BigInt(min) }), ...(max && { lte: BigInt(max) }) } } } }
        : {}),
    };

    // Price/discount sorts need the full matching set sorted in-app (variant-derived);
    // newest sorts at the DB level with normal pagination.
    if (sort === 'price-asc' || sort === 'price-desc' || sort === 'discount' || onSale) {
      const all = await this.prisma.product.findMany({ where, select: CARD_SELECT, orderBy: { createdAt: 'desc' } });
      let filtered = onSale ? all.filter((p) => discountPct(p) > 0) : all;
      filtered = filtered.sort((a, b) => {
        if (sort === 'price-asc') return Number(minPrice(a) - minPrice(b));
        if (sort === 'price-desc') return Number(minPrice(b) - minPrice(a));
        if (sort === 'discount') return discountPct(b) - discountPct(a);
        return 0;
      });
      const total = filtered.length;
      const items = filtered.slice((page - 1) * limit, page * limit);
      return { total, page, limit, items };
    }

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        select: CARD_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, page, limit, items };
  }

  /** Same-category siblings for the product detail page. */
  async getRelatedProducts(slug: string, limit = 8) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isPublished: true },
      select: { id: true, categoryId: true },
    });
    if (!product) return [];
    return this.prisma.product.findMany({
      where: { isPublished: true, categoryId: product.categoryId, id: { not: product.id } },
      select: CARD_SELECT,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Products with at least one variant on sale, best discount first. */
  async getDiscounted(limit = 12) {
    const all = await this.prisma.product.findMany({
      where: { isPublished: true },
      select: CARD_SELECT,
      orderBy: { createdAt: 'desc' },
    });
    return all
      .filter((p) => discountPct(p) > 0)
      .sort((a, b) => discountPct(b) - discountPct(a))
      .slice(0, limit);
  }

  /** Newest arrivals. */
  async getNewArrivals(limit = 12) {
    return this.prisma.product.findMany({
      where: { isPublished: true },
      select: CARD_SELECT,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Flat list of categories that actually hold published products (the real
   *  shopping categories — e.g. smartphones, laptops — not empty parent nodes). */
  async getNavCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { slug: 'asc' },
      include: { _count: { select: { products: { where: { isPublished: true } } } } },
    });
    return categories
      .filter((c) => c._count.products > 0)
      .sort((a, b) => b._count.products - a._count.products)
      .map(({ _count, ...c }) => c);
  }

  /** Home page: each populated category with a handful of products. */
  async getHomeSections(perCategory = 8) {
    const categories = await this.getNavCategories();
    const sections = await Promise.all(
      categories.map(async (cat) => ({
        category: cat,
        products: await this.prisma.product.findMany({
          where: { isPublished: true, categoryId: cat.id },
          select: CARD_SELECT,
          take: perCategory,
          orderBy: { createdAt: 'desc' },
        }),
      })),
    );
    return sections.filter((s) => s.products.length > 0);
  }

  async getProduct(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isPublished: true },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { position: 'asc' } },
        variants: true,
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async listCategories() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { slug: 'asc' },
    });
  }

  async listBrands() {
    return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }
}
